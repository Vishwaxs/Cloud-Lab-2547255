import mongoose, { Schema, type Model } from "mongoose";

export type SocialLink = {
  label: string;
  url: string;
};

export type HeroSettings = {
  title: string;
  titleHi?: string;
  subtitle?: string;
  subtitleHi?: string;
  description?: string;
  descriptionHi?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
};

export type ContactSettings = {
  email?: string;
  phone?: string;
  address?: string;
  addressHi?: string;
};

export type SiteSettingsDoc = {
  key: "default";
  hero: HeroSettings;
  contact?: ContactSettings;
  socialLinks?: SocialLink[];
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const socialLinkSchema = new Schema<SocialLink>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const heroSchema = new Schema<HeroSettings>(
  {
    title: { type: String, required: true, trim: true },
    titleHi: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    subtitleHi: { type: String, trim: true },
    description: { type: String, trim: true },
    descriptionHi: { type: String, trim: true },
    primaryCtaLabel: { type: String, trim: true },
    primaryCtaHref: { type: String, trim: true },
    secondaryCtaLabel: { type: String, trim: true },
    secondaryCtaHref: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: false }
);

const contactSchema = new Schema<ContactSettings>(
  {
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    addressHi: { type: String, trim: true },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    key: { type: String, required: true, unique: true, index: true, default: "default" },
    hero: { type: heroSchema, required: true },
    contact: { type: contactSchema },
    socialLinks: { type: [socialLinkSchema], default: [] },
    createdByAdminId: { type: String },
    updatedByAdminId: { type: String },
  },
  { timestamps: true }
);

export const SiteSettings: Model<SiteSettingsDoc> =
  mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);
