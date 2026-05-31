import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string;
  name: string;
  avatarUrl?: string;
  groupIds: mongoose.Types.ObjectId[];
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group', default: [] }],
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
