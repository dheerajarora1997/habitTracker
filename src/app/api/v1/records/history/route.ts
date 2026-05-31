import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import DailyRecord from '@/models/DailyRecord';
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

    const records = await DailyRecord.find({
      userId: tokenData.userId,
    }).sort({ date: 1 });

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error: any) {
    console.error('Fetch history records error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve historical records' },
      { status: 500 }
    );
  }
}
