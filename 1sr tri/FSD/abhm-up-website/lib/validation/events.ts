import { z } from "zod";

function isValidUrlOrPath(value: string) {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("/")) return true;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const eventDateSchema = z.union([
  z.coerce.date(),
  z
    .string()
    .trim()
    .min(1)
    .transform((v) => new Date(v)),
]).refine((d) => d instanceof Date && !Number.isNaN(d.getTime()), {
  message: "Invalid eventDate",
});

export const eventCreateSchema = z.object({
  title: z.string().trim().min(3).max(180),
  titleHi: z.string().trim().min(1).max(180).optional(),
  slug: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  descriptionHi: z.string().trim().min(1).max(5000).optional(),
  eventDate: eventDateSchema,
  eventTime: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(1).max(200),
  locationHi: z.string().trim().min(1).max(200).optional(),
  imageUrl: z.string().trim().min(1).max(500).refine(isValidUrlOrPath, "Invalid image URL/path").optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const eventUpdateSchema = z
  .object({
    title: z.string().trim().min(3).max(180).optional(),
    titleHi: z.string().trim().min(1).max(180).optional(),
    slug: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    descriptionHi: z.string().trim().min(1).max(5000).optional(),
    eventDate: eventDateSchema.optional(),
    eventTime: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    locationHi: z.string().trim().min(1).max(200).optional(),
    imageUrl: z.string().trim().min(1).max(500).refine(isValidUrlOrPath, "Invalid image URL/path").optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
