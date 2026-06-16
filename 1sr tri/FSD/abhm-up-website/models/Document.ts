import mongoose, { Schema, type Model } from "mongoose";

export type DocumentStatus = "draft" | "published";

export type DocumentDoc = {
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  category?: string;
  fileUrl: string;
  fileType?: string;
  order: number;
  status: DocumentStatus;
  publishedAt?: Date;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const documentSchema = new Schema<DocumentDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleHi: { type: String, trim: true },
    description: { type: String, trim: true },
    descriptionHi: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, index: true },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

documentSchema.index({ status: 1, order: 1, updatedAt: -1 });

export const Document: Model<DocumentDoc> =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
