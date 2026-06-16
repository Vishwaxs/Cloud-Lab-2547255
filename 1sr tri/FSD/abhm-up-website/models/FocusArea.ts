import mongoose, { Schema, type Model } from "mongoose";

export type FocusAreaDoc = {
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const focusAreaSchema = new Schema<FocusAreaDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleHi: { type: String, trim: true },
    description: { type: String, required: true },
    descriptionHi: { type: String },
    icon: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0, index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

focusAreaSchema.index({ isActive: 1, order: 1 });

export const FocusArea: Model<FocusAreaDoc> =
  mongoose.models.FocusArea || mongoose.model("FocusArea", focusAreaSchema);
