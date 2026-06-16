import { cache } from "react";

import { connectDb } from "@/lib/db";
import { SiteSettings, type ContactSettings, type HeroSettings, type SocialLink } from "@/models/SiteSettings";

export type PublicSiteSettings = {
  hero?: Partial<HeroSettings>;
  contact?: ContactSettings;
  socialLinks?: SocialLink[];
};

export const getPublicSiteSettings = cache(async (): Promise<PublicSiteSettings | null> => {
  try {
    await connectDb();

    const doc = await SiteSettings.findOne({ key: "default" })
      .select({ _id: 0, hero: 1, contact: 1, socialLinks: 1 })
      .lean();

    if (!doc) return null;

    return {
      hero: doc.hero,
      contact: doc.contact,
      socialLinks: doc.socialLinks,
    };
  } catch {
    return null;
  }
});
