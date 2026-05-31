import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Group from '@/models/Group';
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

    const groups = await Group.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error: any) {
    console.error('Fetch admin groups error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve groups list' },
      { status: 500 }
    );
  }
}
