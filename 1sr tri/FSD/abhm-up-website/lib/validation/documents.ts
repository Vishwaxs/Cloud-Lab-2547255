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

export const documentCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  titleHi: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  descriptionHi: z.string().trim().min(1).max(500).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  fileUrl: z.string().trim().min(1).max(500).refine(isValidUrlOrPath, "Invalid file URL/path"),
  fileType: z.string().trim().min(1).max(80).optional(),
  order: z.coerce.number().int().min(0).max(100000).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const documentUpdateSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    titleHi: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    descriptionHi: z.string().trim().min(1).max(500).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    fileUrl: z.string().trim().min(1).max(500).refine(isValidUrlOrPath, "Invalid file URL/path").optional(),
    fileType: z.string().trim().min(1).max(80).optional(),
    order: z.coerce.number().int().min(0).max(100000).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
