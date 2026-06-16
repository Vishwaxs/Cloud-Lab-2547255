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

export const leaderCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameHi: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().min(1).max(120),
  roleHi: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  descriptionHi: z.string().trim().min(1).max(2000).optional(),
  imageUrl: z.string().trim().min(1).max(500).refine(isValidUrlOrPath, "Invalid image URL/path").optional(),
  order: z.coerce.number().int().min(0).max(100000).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const leaderUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    nameHi: z.string().trim().min(1).max(120).optional(),
    role: z.string().trim().min(1).max(120).optional(),
    roleHi: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    descriptionHi: z.string().trim().min(1).max(2000).optional(),
    imageUrl: z.string().trim().min(1).max(500).refine(isValidUrlOrPath, "Invalid image URL/path").optional(),
    order: z.coerce.number().int().min(0).max(100000).optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
