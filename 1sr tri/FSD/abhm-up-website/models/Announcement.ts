import mongoose, { Schema, type Model } from "mongoose";

export type AnnouncementStatus = "draft" | "published";

export type AnnouncementDoc = {
  title: string;
  titleHi?: string;
  href: string;
  publishDate?: Date;
  eventTime?: string;
  location?: string;
  locationHi?: string;
  status: AnnouncementStatus;
  publishedAt?: Date;
  startAt?: Date;
  endAt?: Date;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const announcementSchema = new Schema<AnnouncementDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleHi: { type: String, trim: true },
    href: { type: String, required: true, trim: true },
    publishDate: { type: Date, index: true },
    eventTime: { type: String, trim: true },
    location: { type: String, trim: true },
    locationHi: { type: String, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, index: true },
    startAt: { type: Date, index: true },
    endAt: { type: Date, index: true },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

announcementSchema.index({ status: 1, publishedAt: -1 });
announcementSchema.index({ status: 1, startAt: 1, endAt: 1 });

export const Announcement: Model<AnnouncementDoc> =
  mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
