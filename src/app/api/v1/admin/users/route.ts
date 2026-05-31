import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
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

    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        phoneNumber: u.phoneNumber,
        avatarUrl: u.avatarUrl,
        groupIds: u.groupIds,
        isBanned: u.isBanned,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user list' },
      { status: 500 }
    );
  }
}
