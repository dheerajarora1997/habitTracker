import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const joinGroupSchema = z.object({
  inviteCode: z.string().trim().toUpperCase().length(6, 'Invite code must be exactly 6 characters'),
});

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
    const result = joinGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { inviteCode } = result.data;
    const userIdObj = new mongoose.Types.ObjectId(tokenData.userId);

    // 1. Fetch the user details
    const user = await User.findById(userIdObj);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch the group by invite code
    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return NextResponse.json(
        { error: 'Invalid invite code or group not found' },
        { status: 404 }
      );
    }

    // 3. Check if user is already a member
    const isAlreadyMember = group.members.some(
      (m: any) => m.userId.toString() === tokenData.userId
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group.' },
        { status: 400 }
      );
    }

    // 4. Enforce strict limit of exactly 2 members per group
    if (group.members.length >= 2) {
      return NextResponse.json(
        { error: 'This accountability group is already full (maximum 2 partners).' },
        { status: 400 }
      );
    }

    // 5. Enforce 3 groups maximum limit for joining user
    const groupCount = await Group.countDocuments({
      'members.userId': userIdObj,
    });
    if (groupCount >= 3) {
      return NextResponse.json(
        { error: 'You have reached the maximum limit of 3 groups.' },
        { status: 400 }
      );
    }

    // 6. Join the user
    group.members.push({
      userId: userIdObj,
      name: user.name,
      phoneNumber: user.phoneNumber,
      joinedAt: new Date(),
      totalPoints: 0,
      streak: 0,
    });

    // Update scores Map & Leaderboard Rankings
    group.scores.set(tokenData.userId, 0);
    group.leaderboardData.weeklyRankings.push({ userId: tokenData.userId, points: 0 });
    group.leaderboardData.monthlyRankings.push({ userId: tokenData.userId, points: 0 });

    await group.save();

    // 7. Save group reference on User
    user.groupIds.push(group._id as mongoose.Types.ObjectId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Joined group successfully',
      group,
    });
  } catch (error: any) {
    console.error('Join group error:', error);
    return NextResponse.json(
      { error: 'Failed to join group' },
      { status: 500 }
    );
  }
}
