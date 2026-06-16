import mongoose, { Schema, type Model } from "mongoose";

export type ContactMessageDoc = {
  name: string;
  mobile: string;
  district?: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

const contactMessageSchema = new Schema<ContactMessageDoc>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    district: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const ContactMessage: Model<ContactMessageDoc> =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);
