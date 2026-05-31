import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await deleteAuthCookie();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout request failed' },
      { status: 500 }
    );
  }
}
