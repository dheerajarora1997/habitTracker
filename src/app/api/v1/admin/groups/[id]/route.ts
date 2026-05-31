import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { getVerifiedTokenData } from '@/lib/auth';
import mongoose from 'mongoose';

async function checkAdmin(userId: string): Promise<boolean> {
  const user = await User.findById(userId);
  return user?.phoneNumber === '+1111111111' || user?.phoneNumber === '1111111111';
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const tokenData = getVerifiedTokenData(request);

    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const isAdmin = await checkAdmin(tokenData.userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID format' }, { status: 400 });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    // Pull the group ID from all users who were members
    const memberIds = group.members.map((m) => m.userId);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { groupIds: groupObjectId } }
    );

    // Delete the group itself
    await Group.findByIdAndDelete(groupId);

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully and user relations updated',
    });
  } catch (error: any) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
