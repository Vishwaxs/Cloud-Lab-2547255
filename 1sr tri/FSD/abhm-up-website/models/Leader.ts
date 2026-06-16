import mongoose, { Schema, type Model } from "mongoose";

export type LeaderDoc = {
  name: string;
  nameHi?: string;
  role: string;
  roleHi?: string;
  description?: string;
  descriptionHi?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const leaderSchema = new Schema<LeaderDoc>(
  {
    name: { type: String, required: true, trim: true },
    nameHi: { type: String, trim: true },
    role: { type: String, required: true, trim: true },
    roleHi: { type: String, trim: true },
    description: { type: String },
    descriptionHi: { type: String },
    imageUrl: { type: String, trim: true },
    order: { type: Number, required: true, default: 0, index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

leaderSchema.index({ isActive: 1, order: 1 });

export const Leader: Model<LeaderDoc> =
  mongoose.models.Leader || mongoose.model("Leader", leaderSchema);
