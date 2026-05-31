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

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const todayStr = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
      ? dateParam
      : new Date().toISOString().split('T')[0];

    let record = await DailyRecord.findOne({
      userId: tokenData.userId,
      date: todayStr,
    });

    if (!record) {
      // Return a standard placeholder template so the client always has a clean form
      record = {
        date: todayStr,
        userId: tokenData.userId,
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
      } as any;
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error: any) {
    console.error('Fetch today record error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve today\'s record' },
      { status: 500 }
    );
  }
}
