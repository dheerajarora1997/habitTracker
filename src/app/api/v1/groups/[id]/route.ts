import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Group from '@/models/Group';
import DailyRecord from '@/models/DailyRecord';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const tokenData = getVerifiedTokenData(request);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized. Session not found.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 1. Fetch Group Document
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID format' }, { status: 400 });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // 2. Validate Membership
    const isMember = group.members.some(
      (m: any) => m.userId.toString() === tokenData.userId
    );

    // Get current user to see if they are admin
    const currentUser = await User.findById(tokenData.userId);
    const isAdmin = currentUser?.phoneNumber === '+1111111111' || false; // Simple Admin check (e.g. +1111111111 phone)

    if (!isMember && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. You are not a member of this group.' },
        { status: 403 }
      );
    }

    // Get date string (today) in YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];

    // 3. Find Today's Records for members
    const memberIds = group.members.map((m: any) => m.userId);
    const todayRecords = await DailyRecord.find({
      userId: { $in: memberIds },
      date: todayStr,
    });

    // 4. Find Recent History (last 30 days) for analytics comparisons
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimitStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentRecords = await DailyRecord.find({
      userId: { $in: memberIds },
      date: { $gte: dateLimitStr },
    }).sort({ date: 1 });

    // Map records for convenience
    const memberTodayRecordMap = new Map();
    todayRecords.forEach((record) => {
      memberTodayRecordMap.set(record.userId.toString(), record);
    });

    const memberHistoryMap = new Map();
    memberIds.forEach((mId: any) => {
      memberHistoryMap.set(mId.toString(), []);
    });
    recentRecords.forEach((record) => {
      const array = memberHistoryMap.get(record.userId.toString()) || [];
      array.push(record);
      memberHistoryMap.set(record.userId.toString(), array);
    });

    // 5. Structure rich dashboard payload
    const membersData = group.members.map((member: any) => {
      const uIdStr = member.userId.toString();
      const todayRecord = memberTodayRecordMap.get(uIdStr) || {
        steps: 0,
        stepPoints: 0,
        habits: {
          noFastFood: false,
          hitGym: false,
          noAlcohol: false,
          socialMediaDetox: false,
          learnStudy: false,
          noSugar: false,
          drinkWater: 0,
        },
        dailyTotalPoints: 0,
        notes: '',
      };

      const history = memberHistoryMap.get(uIdStr) || [];

      return {
        userId: uIdStr,
        name: member.name,
        phoneNumber: member.phoneNumber,
        joinedAt: member.joinedAt,
        totalPoints: member.totalPoints,
        streak: member.streak,
        todayRecord,
        history,
      };
    });

    return NextResponse.json({
      success: true,
      group: {
        id: group._id.toString(),
        groupName: group.groupName,
        createdBy: group.createdBy.toString(),
        inviteCode: group.inviteCode,
        leaderboardData: group.leaderboardData,
        createdAt: group.createdAt,
      },
      members: membersData,
      meUserId: tokenData.userId,
    });
  } catch (error: any) {
    console.error('Fetch group details error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve group details' },
      { status: 500 }
    );
  }
}
