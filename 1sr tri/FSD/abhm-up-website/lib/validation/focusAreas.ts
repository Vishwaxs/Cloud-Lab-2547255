import { z } from "zod";

export const focusAreaCreateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  titleHi: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().min(1).max(3000),
  descriptionHi: z.string().trim().min(1).max(3000).optional(),
  icon: z.string().trim().min(1).max(80),
  order: z.coerce.number().int().min(0).max(100000).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const focusAreaUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(180).optional(),
    titleHi: z.string().trim().min(1).max(180).optional(),
    description: z.string().trim().min(1).max(3000).optional(),
    descriptionHi: z.string().trim().min(1).max(3000).optional(),
    icon: z.string().trim().min(1).max(80).optional(),
    order: z.coerce.number().int().min(0).max(100000).optional(),
    isActive: z.coerce.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });
