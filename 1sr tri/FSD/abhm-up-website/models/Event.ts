import mongoose, { Schema, type Model } from "mongoose";

export type EventDoc = {
  title: string;
  titleHi?: string;
  slug: string;
  description: string;
  descriptionHi?: string;
  eventDate: Date;
  eventTime?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  status: "draft" | "published";
  publishedAt?: Date;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const eventSchema = new Schema<EventDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleHi: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, required: true },
    descriptionHi: { type: String },
    eventDate: { type: Date, required: true, index: true },
    eventTime: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    locationHi: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, index: true },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, eventDate: -1 });

export const Event: Model<EventDoc> =
  mongoose.models.Event || mongoose.model("Event", eventSchema);
