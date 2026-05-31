import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const createGroupSchema = z.object({
  groupName: z.string().min(3, 'Group name must be at least 3 characters'),
});

// Helper to generate a unique invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
    const result = createGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { groupName } = result.data;
    const userIdObj = new mongoose.Types.ObjectId(tokenData.userId);

    // 1. Validate that the creator exists
    const user = await User.findById(userIdObj);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Enforce the max 3 groups rule
    const groupCount = await Group.countDocuments({
      'members.userId': userIdObj,
    });

    if (groupCount >= 3) {
      return NextResponse.json(
        { error: 'A user can create or join a maximum of 3 groups.' },
        { status: 400 }
      );
    }

    // 3. Generate unique invite code
    let inviteCode = generateInviteCode();
    let codeExists = await Group.findOne({ inviteCode });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await Group.findOne({ inviteCode });
    }

    // 4. Create Group Document
    const initialScores = new Map<string, number>();
    initialScores.set(tokenData.userId, 0);

    const newGroup = await Group.create({
      groupName,
      createdBy: userIdObj,
      members: [
        {
          userId: userIdObj,
          name: user.name,
          phoneNumber: user.phoneNumber,
          joinedAt: new Date(),
          totalPoints: 0,
          streak: 0,
        },
      ],
      inviteCode,
      scores: initialScores,
      dailySnapshots: [],
      leaderboardData: {
        weeklyRankings: [{ userId: tokenData.userId, points: 0 }],
        monthlyRankings: [{ userId: tokenData.userId, points: 0 }],
      },
    });

    // 5. Update user groupIds reference
    user.groupIds.push(newGroup._id as mongoose.Types.ObjectId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Group created successfully',
      group: newGroup,
    });
  } catch (error: any) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tokenData = getVerifiedTokenData(request);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized. Session not found.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const groups = await Group.find({
      'members.userId': new mongoose.Types.ObjectId(tokenData.userId),
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error: any) {
    console.error('List groups error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve groups' },
      { status: 500 }
    );
  }
}
