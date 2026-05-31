import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Otp from '@/models/Otp';
import { z } from 'zod';

const requestOtpSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const result = requestOtpSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phoneNumber } = result.data;

    // Generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove existing OTPs for this phone number to prevent spam
    await Otp.deleteMany({ phoneNumber });

    // Store in database
    await Otp.create({
      phoneNumber,
      otp: generatedOtp,
    });

    // Output OTP clearly in the server console for testing/audit
    console.log(`\n==============================================`);
    console.log(`[OTP VERIFICATION SYSTEM]`);
    console.log(`PHONE NUMBER: ${phoneNumber}`);
    console.log(`OTP CODE: ${generatedOtp}`);
    console.log(`==============================================\n`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (check server logs/console or response)',
      // We also return the OTP in the response for development convenience
      otp: generatedOtp, 
    });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to request OTP. Please try again.' },
      { status: 500 }
    );
  }
}
