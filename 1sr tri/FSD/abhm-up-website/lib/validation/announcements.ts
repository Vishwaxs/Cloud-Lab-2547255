import { z } from "zod";

function isValidHref(value: string) {
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

const optionalIsoDate = z
  .string()
  .trim()
  .min(1)
  .optional()
  .refine((v) => {
    if (typeof v !== "string") return true;
    const d = new Date(v);
    return !Number.isNaN(d.getTime());
  }, "Invalid date");

export const announcementCreateSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    titleHi: z.string().trim().min(1).max(200).optional(),
    href: z.string().trim().min(1).max(500).refine(isValidHref, "Invalid URL/path"),
    publishDate: optionalIsoDate,
    eventTime: z.string().trim().min(1).max(100).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    locationHi: z.string().trim().min(1).max(200).optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    startAt: optionalIsoDate,
    endAt: optionalIsoDate,
  })
  .refine(
    (v) => {
      if (!v.startAt || !v.endAt) return true;
      return new Date(v.endAt).getTime() >= new Date(v.startAt).getTime();
    },
    { message: "endAt must be after startAt", path: ["endAt"] }
  );

export const announcementUpdateSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    titleHi: z.string().trim().min(1).max(200).optional(),
    href: z.string().trim().min(1).max(500).refine(isValidHref, "Invalid URL/path").optional(),
    publishDate: optionalIsoDate,
    eventTime: z.string().trim().min(1).max(100).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    locationHi: z.string().trim().min(1).max(200).optional(),
    status: z.enum(["draft", "published"]).optional(),
    startAt: optionalIsoDate,
    endAt: optionalIsoDate,
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" })
  .refine(
    (v) => {
      if (!v.startAt || !v.endAt) return true;
      return new Date(v.endAt).getTime() >= new Date(v.startAt).getTime();
    },
    { message: "endAt must be after startAt", path: ["endAt"] }
  );
