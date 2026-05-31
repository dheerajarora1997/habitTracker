import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import DailyRecord from '@/models/DailyRecord';
import Group from '@/models/Group';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const habitSchema = z.object({
  noFastFood: z.boolean(),
  hitGym: z.boolean(),
  noAlcohol: z.boolean(),
  socialMediaDetox: z.boolean(),
  learnStudy: z.boolean(),
  noSugar: z.boolean(),
  drinkWater: z.number().min(0),
});

const upsertRecordSchema = z.object({
  steps: z.number().min(0, 'Steps cannot be negative'),
  habits: habitSchema,
  notes: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// Helper to calculate streak based on history
async function calculateUserStreak(userId: mongoose.Types.ObjectId, todayStr: string): Promise<number> {
  const records = await DailyRecord.find({
    userId,
    dailyTotalPoints: { $gt: 0 },
  }).sort({ date: -1 });

  if (records.length === 0) return 0;

  const today = new Date(todayStr);
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  let streak = 0;
  let currentDate = today;

  // If the user hasn't logged anything today yet, let's check starting from yesterday
  const hasLoggedToday = records.some(r => r.date === todayStr);
  
  if (!hasLoggedToday) {
    const yesterdayStr = new Date(today.getTime() - oneDayMs).toISOString().split('T')[0];
    const hasLoggedYesterday = records.some(r => r.date === yesterdayStr);
    
    if (!hasLoggedYesterday) {
      // Streak broken
      return 0;
    }
    // Start streak calculation from yesterday
    currentDate = new Date(yesterdayStr);
  }

  // Iterate backwards and check consecutive dates
  while (true) {
    const checkDateStr = currentDate.toISOString().split('T')[0];
    const match = records.find(r => r.date === checkDateStr);
    
    if (match) {
      streak++;
      // Move to the previous day
      currentDate = new Date(currentDate.getTime() - oneDayMs);
    } else {
      break;
    }
  }

  return streak;
}

export async function POST(request: NextRequest) {
  try {
    const tokenData = getVerifiedTokenData(request);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized. Session not found.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const result = upsertRecordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { steps, habits, notes, date } = result.data;

    // Enforce "edit today's record until midnight" limit
    const todayStr = new Date().toISOString().split('T')[0];
    if (date !== todayStr) {
      // Allow minor threshold block for timezones, but restrict arbitrary history writing
      const diffDays = Math.abs(
        (new Date(date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 1.1) {
        return NextResponse.json(
          { error: 'You are only allowed to edit today\'s habit log.' },
          { status: 400 }
        );
      }
    }

    // 1. Calculate scoring
    // Steps points: 0-2499 = 0, 2500-4999 = 1, 5000-7499 = 2, etc. (Math.floor(steps / 2500))
    const stepPoints = Math.floor(steps / 2500);

    // Habits points: 1 point per habit; 1 point for every 2L of water
    let habitPoints = 0;
    Object.entries(habits).forEach(([key, val]) => {
      if (key === 'drinkWater') {
        habitPoints += Math.floor((val as number) / 2);
      } else if (val === true) {
        habitPoints += 1;
      }
    });

    const dailyTotalPoints = stepPoints + habitPoints;
    const userIdObj = new mongoose.Types.ObjectId(tokenData.userId);

    // 2. Fetch existing record to calculate delta (points difference)
    const existingRecord = await DailyRecord.findOne({
      userId: userIdObj,
      date,
    });

    const oldPoints = existingRecord ? existingRecord.dailyTotalPoints : 0;
    const pointsDelta = dailyTotalPoints - oldPoints;

    // 3. Upsert the DailyRecord document
    const updatedRecord = await DailyRecord.findOneAndUpdate(
      { userId: userIdObj, date },
      {
        userId: userIdObj,
        date,
        steps,
        stepPoints,
        habits,
        dailyTotalPoints,
        notes,
      },
      { upsert: true, new: true }
    );

    // 4. Calculate User's streak
    const currentStreak = await calculateUserStreak(userIdObj, todayStr);

    // 5. Update user's accountability groups (scores, streaks, leaderboard, dailySnapshots cache)
    const groups = await Group.find({ 'members.userId': userIdObj });

    for (const group of groups) {
      // Find the member node in members array
      const memberIndex = group.members.findIndex(
        (m) => m.userId.toString() === tokenData.userId
      );

      if (memberIndex !== -1) {
        // Enforce safety initializers to prevent runtime undefined crashes on legacy docs
        if (!group.scores) {
          group.scores = new Map();
        }
        if (!group.dailySnapshots) {
          group.dailySnapshots = [];
        }
        if (!group.leaderboardData) {
          group.leaderboardData = {
            weeklyRankings: [],
            monthlyRankings: [],
            longestStreakValue: 0,
          };
        }
        if (!group.leaderboardData.weeklyRankings) {
          group.leaderboardData.weeklyRankings = [];
        }
        if (!group.leaderboardData.monthlyRankings) {
          group.leaderboardData.monthlyRankings = [];
        }

        // Update member points and streak
        group.members[memberIndex].totalPoints += pointsDelta;
        group.members[memberIndex].streak = currentStreak;

        // Sync local scores map for high-speed references
        const currentPoints = group.scores.get(tokenData.userId) || 0;
        group.scores.set(tokenData.userId, Math.max(0, currentPoints + pointsDelta));

        // Update Daily Snapshots inside group document
        const snapshotIndex = group.dailySnapshots.findIndex((s) => s.date === date);
        const userPosition = memberIndex + 1; // user1 or user2

        if (snapshotIndex !== -1) {
          if (userPosition === 1) {
            group.dailySnapshots[snapshotIndex].user1Points = dailyTotalPoints;
          } else {
            group.dailySnapshots[snapshotIndex].user2Points = dailyTotalPoints;
          }
        } else {
          // Create new snapshot
          group.dailySnapshots.push({
            date,
            user1Points: userPosition === 1 ? dailyTotalPoints : 0,
            user2Points: userPosition === 2 ? dailyTotalPoints : 0,
          });
        }

        // Limit snapshots array to recent 30 entries to prevent oversized document growth
        if (group.dailySnapshots.length > 30) {
          group.dailySnapshots.shift();
        }

        // Recalculate Weekly/Monthly Leaderboard rankings in the Group document
        // We aggregate DailyRecords for members of this group in the last 7 and 30 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const groupMemberIds = group.members.map((m) => m.userId);

        // Fetch records in range
        const weeklyRecords = await DailyRecord.find({
          userId: { $in: groupMemberIds },
          date: { $gte: sevenDaysAgoStr },
        });

        const monthlyRecords = await DailyRecord.find({
          userId: { $in: groupMemberIds },
          date: { $gte: thirtyDaysAgoStr },
        });

        // Compute rankings
        const weeklyPointsMap: Record<string, number> = {};
        const monthlyPointsMap: Record<string, number> = {};
        
        groupMemberIds.forEach((mId) => {
          weeklyPointsMap[mId.toString()] = 0;
          monthlyPointsMap[mId.toString()] = 0;
        });

        weeklyRecords.forEach((rec) => {
          weeklyPointsMap[rec.userId.toString()] = (weeklyPointsMap[rec.userId.toString()] || 0) + rec.dailyTotalPoints;
        });

        monthlyRecords.forEach((rec) => {
          monthlyPointsMap[rec.userId.toString()] = (monthlyPointsMap[rec.userId.toString()] || 0) + rec.dailyTotalPoints;
        });

        // Re-write rankings arrays
        group.leaderboardData.weeklyRankings = Object.entries(weeklyPointsMap).map(
          ([userId, points]) => ({ userId, points })
        ).sort((a, b) => b.points - a.points);

        group.leaderboardData.monthlyRankings = Object.entries(monthlyPointsMap).map(
          ([userId, points]) => ({ userId, points })
        ).sort((a, b) => b.points - a.points);

        // Determine current winner (highest total points in group)
        let highestPoints = -1;
        let winnerId: mongoose.Types.ObjectId | undefined = undefined;
        
        group.members.forEach((m) => {
          if (m.totalPoints > highestPoints) {
            highestPoints = m.totalPoints;
            winnerId = m.userId;
          } else if (m.totalPoints === highestPoints && highestPoints > 0) {
            // Tie breaker or draw, keep the original or set undefined
            winnerId = undefined; 
          }
        });
        group.leaderboardData.currentWinnerId = winnerId;

        // Longest streak user tracking
        let longestStreakVal = group.leaderboardData.longestStreakValue || 0;
        let longestStreakUser = group.leaderboardData.longestStreakUserId;

        group.members.forEach((m) => {
          if (m.streak > longestStreakVal) {
            longestStreakVal = m.streak;
            longestStreakUser = m.userId;
          }
        });

        group.leaderboardData.longestStreakValue = longestStreakVal;
        group.leaderboardData.longestStreakUserId = longestStreakUser;

        // Save modifications to group document
        group.markModified('scores');
        group.markModified('dailySnapshots');
        group.markModified('leaderboardData');
        await group.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Record updated and synced successfully',
      record: updatedRecord,
      streak: currentStreak,
    });
  } catch (error: any) {
    console.error('Upsert habit record error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record daily habit logs',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
