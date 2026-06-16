import mongoose, { Schema, type Model } from "mongoose";

export type AdminRefreshTokenDoc = {
  adminId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
};

const adminRefreshTokenSchema = new Schema<AdminRefreshTokenDoc>(
  {
    adminId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    lastUsedAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const AdminRefreshToken: Model<AdminRefreshTokenDoc> =
  mongoose.models.AdminRefreshToken ||
  mongoose.model("AdminRefreshToken", adminRefreshTokenSchema);
