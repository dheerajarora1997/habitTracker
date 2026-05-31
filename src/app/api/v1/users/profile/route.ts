import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().url().or(z.string().length(0)).optional(),
});

export async function PUT(request: NextRequest) {
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
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, avatarUrl } = result.data;

    const user = await User.findById(tokenData.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    user.name = name;
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        name: user.name,
        avatarUrl: user.avatarUrl,
        groupIds: user.groupIds,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
