import mongoose, { Schema, type Model } from "mongoose";

export type NewsStatus = "draft" | "published";

export type NewsPostDoc = {
  title: string;
  titleHi?: string;
  slug: string;
  excerpt?: string;
  excerptHi?: string;
  contentHtml: string;
  contentHtmlHi?: string;
  imageUrl?: string;
  images?: string[]; // Multiple images support
  publishDate?: Date;
  eventTime?: string;
  location?: string;
  locationHi?: string;
  status: NewsStatus;
  publishedAt?: Date;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const newsPostSchema = new Schema<NewsPostDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleHi: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, trim: true },
    excerptHi: { type: String, trim: true },
    contentHtml: { type: String, required: true },
    contentHtmlHi: { type: String },
    imageUrl: { type: String, trim: true },
    publishDate: { type: Date, index: true },
    eventTime: { type: String, trim: true },
    location: { type: String, trim: true },
    locationHi: { type: String, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, index: true },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

newsPostSchema.index({ status: 1, publishedAt: -1 });

export const NewsPost: Model<NewsPostDoc> =
  mongoose.models.NewsPost || mongoose.model("NewsPost", newsPostSchema);
