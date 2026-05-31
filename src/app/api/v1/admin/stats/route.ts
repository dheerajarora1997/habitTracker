import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Group from '@/models/Group';
import DailyRecord from '@/models/DailyRecord';
import { getVerifiedTokenData } from '@/lib/auth';

async function checkAdmin(userId: string): Promise<boolean> {
  const user = await User.findById(userId);
  return user?.phoneNumber === '+1111111111' || user?.phoneNumber === '1111111111';
}

export async function GET(request: NextRequest) {
  try {
    const tokenData = getVerifiedTokenData(request);

    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const isAdmin = await checkAdmin(tokenData.userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalRecords = await DailyRecord.countDocuments();

    // Sum of all points logged
    const pointSumResult = await DailyRecord.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$dailyTotalPoints' } } },
    ]);
    const totalPointsScored = pointSumResult[0]?.totalPoints || 0;

    // Platform streak record
    const streakLeader = await Group.findOne()
      .sort({ 'leaderboardData.longestStreakValue': -1 })
      .select('groupName leaderboardData.longestStreakValue')
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalGroups,
        totalRecords,
        totalPointsScored,
        maxStreakOnPlatform: streakLeader?.leaderboardData?.longestStreakValue || 0,
        maxStreakGroupName: streakLeader?.groupName || 'None',
      },
    });
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve platform stats' },
      { status: 500 }
    );
  }
}
