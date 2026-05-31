import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import { z } from 'zod';

async function checkAdmin(userId: string): Promise<boolean> {
  const user = await User.findById(userId);
  return user?.phoneNumber === '+1111111111' || user?.phoneNumber === '1111111111';
}

const banSchema = z.object({
  isBanned: z.boolean(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const tokenData = getVerifiedTokenData(request);

    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const isAdmin = await checkAdmin(tokenData.userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const result = banSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { isBanned } = result.data;

    if (targetUserId === tokenData.userId) {
      return NextResponse.json({ error: 'You cannot ban yourself' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { isBanned },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: user._id.toString(),
        name: user.name,
        phoneNumber: user.phoneNumber,
        isBanned: user.isBanned,
      },
    });
  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Failed to perform ban action' },
      { status: 500 }
    );
  }
}
