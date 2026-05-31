import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHabitCompletion {
  noFastFood: boolean;
  hitGym: boolean;
  noAlcohol: boolean;
  socialMediaDetox: boolean;
  learnStudy: boolean;
  noSugar: boolean;
  drinkWater: number;
}

export interface IDailyRecord extends Document {
  date: string; // YYYY-MM-DD format
  userId: mongoose.Types.ObjectId;
  steps: number;
  stepPoints: number;
  habits: IHabitCompletion;
  dailyTotalPoints: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyRecordSchema = new Schema<IDailyRecord>(
  {
    date: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    steps: { type: Number, default: 0 },
    stepPoints: { type: Number, default: 0 },
    habits: {
      noFastFood: { type: Boolean, default: false },
      hitGym: { type: Boolean, default: false },
      noAlcohol: { type: Boolean, default: false },
      socialMediaDetox: { type: Boolean, default: false },
      learnStudy: { type: Boolean, default: false },
      noSugar: { type: Boolean, default: false },
      drinkWater: { type: Number, default: 0 },
    },
    dailyTotalPoints: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

// Enforce compound unique constraint so a user has exactly one record per date
DailyRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyRecord: Model<IDailyRecord> =
  mongoose.models.DailyRecord || mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema);

export default DailyRecord;
