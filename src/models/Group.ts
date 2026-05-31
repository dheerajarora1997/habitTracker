import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroupMember {
  userId: mongoose.Types.ObjectId;
  name: string;
  phoneNumber: string;
  joinedAt: Date;
  totalPoints: number;
  streak: number;
}

export interface IGroupDailySnapshot {
  date: string; // YYYY-MM-DD
  user1Points: number;
  user2Points: number;
}

export interface IGroup extends Document {
  groupName: string;
  createdBy: mongoose.Types.ObjectId;
  members: IGroupMember[]; // Max 2 members
  inviteCode: string;
  scores: Map<string, number>; // Maps User ID string -> Points
  dailySnapshots: IGroupDailySnapshot[]; // Track recent daily aggregates directly inside the group
  leaderboardData: {
    weeklyRankings: { userId: string; points: number }[];
    monthlyRankings: { userId: string; points: number }[];
    longestStreakUserId?: mongoose.Types.ObjectId;
    longestStreakValue?: number;
    currentWinnerId?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    groupName: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          name: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          joinedAt: { type: Date, default: Date.now },
          totalPoints: { type: Number, default: 0 },
          streak: { type: Number, default: 0 },
        },
      ],
      validate: [
        (val: IGroupMember[]) => val.length <= 2,
        'A group contains exactly up to 2 members.',
      ],
    },
    inviteCode: { type: String, required: true, unique: true, index: true },
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    dailySnapshots: [
      {
        date: { type: String, required: true },
        user1Points: { type: Number, default: 0 },
        user2Points: { type: Number, default: 0 },
      },
    ],
    leaderboardData: {
      weeklyRankings: [
        {
          userId: { type: String, required: true },
          points: { type: Number, default: 0 },
        },
      ],
      monthlyRankings: [
        {
          userId: { type: String, required: true },
          points: { type: Number, default: 0 },
        },
      ],
      longestStreakUserId: { type: Schema.Types.ObjectId, ref: 'User' },
      longestStreakValue: { type: Number, default: 0 },
      currentWinnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export default Group;
