import mongoose, { Schema, type Model } from "mongoose";

export type AdminRole = "superadmin" | "admin" | "editor" | "viewer";

export type AdminUserDoc = {
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const adminUserSchema = new Schema<AdminUserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["superadmin", "admin", "editor", "viewer"],
      default: "admin",
    },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const AdminUser: Model<AdminUserDoc> =
  mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
