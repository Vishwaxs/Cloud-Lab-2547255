import { z } from "zod";

const urlSchema = z
  .string()
  .url()
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

export const siteSettingsSchema = z.object({
  hero: z.object({
    title: z.string().min(3).max(120),
    titleHi: z.string().min(1).max(120).optional(),
    subtitle: z.string().max(160).optional(),
    subtitleHi: z.string().max(160).optional(),
    description: z.string().max(600).optional(),
    descriptionHi: z.string().max(600).optional(),
    primaryCtaLabel: z.string().max(40).optional(),
    primaryCtaHref: z.union([urlSchema, z.literal("")]).optional(),
    secondaryCtaLabel: z.string().max(40).optional(),
    secondaryCtaHref: z.union([urlSchema, z.literal("")]).optional(),
    imageUrl: z.union([urlSchema, z.literal("")]).optional(),
  }),
  contact: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().max(40).optional(),
      address: z.string().max(240).optional(),
      addressHi: z.string().max(240).optional(),
    })
    .optional(),
  socialLinks: z
    .array(
      z.object({
        label: z.string().min(1).max(30),
        url: urlSchema,
      })
    )
    .max(12)
    .optional(),
});

export const siteSettingsUpdateSchema = siteSettingsSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "No fields provided" });
