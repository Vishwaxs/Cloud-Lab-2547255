import mongoose, { Schema, type Model } from "mongoose";

export type ActivityType = 
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "upload";

export type ActivityLogDoc = {
  adminId: string;
  adminEmail: string;
  action: ActivityType;
  entityType?: string; // "event", "news", "leader", etc.
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
};

const activityLogSchema = new Schema<ActivityLogDoc>(
  {
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ["login", "logout", "create", "update", "delete", "upload"],
    },
    entityType: { type: String },
    entityId: { type: String },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
activityLogSchema.index({ adminId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<ActivityLogDoc> =
  mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
