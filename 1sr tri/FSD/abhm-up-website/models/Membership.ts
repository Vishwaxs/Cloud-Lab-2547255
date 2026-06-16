import mongoose, { Schema, type Model } from "mongoose";

export type MembershipDoc = {
  name: string;
  mobile: string;
  district: string;
  roleInterest: string;
  createdAt: Date;
  updatedAt: Date;
};

const membershipSchema = new Schema<MembershipDoc>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    roleInterest: { type: String, required: true },
  },
  { timestamps: true }
);

export const Membership: Model<MembershipDoc> =
  mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
