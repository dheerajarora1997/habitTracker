import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';

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

    const user = await User.findById(tokenData.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Account banned.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        name: user.name,
        avatarUrl: user.avatarUrl,
        groupIds: user.groupIds,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication request failed' },
      { status: 500 }
    );
  }
}
