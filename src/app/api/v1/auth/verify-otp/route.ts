import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phoneNumber, otp, name } = result.data;

    // Find OTP in database
    const otpRecord = await Otp.findOne({ phoneNumber, otp });

    // Special bypass for testing (e.g. standard code 123456)
    const isSpecialBypass = otp === '123456';

    if (!otpRecord && !isSpecialBypass) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Clean up OTP records if verified via record
    if (otpRecord) {
      await Otp.deleteMany({ phoneNumber });
    }

    // Find or create user
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Auto-register user
      const defaultName = name || `Tracker Partner ${phoneNumber.slice(-4)}`;
      user = await User.create({
        phoneNumber,
        name: defaultName,
        groupIds: [],
        isBanned: false,
      });
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned. Please contact administration.' },
        { status: 403 }
      );
    }

    // Generate JWT and write HTTP-only cookie
    await setAuthCookie({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
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
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
