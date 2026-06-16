import { z } from "zod";

export const newsCreateSchema = z.object({
  title: z.string().min(3).max(180),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(300).optional(),
  contentHtml: z.string().min(1).max(250_000),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const newsUpdateSchema = z
  .object({
    title: z.string().min(3).max(180).optional(),
    slug: z.string().min(1).max(200).optional(),
    excerpt: z.string().max(300).optional(),
    contentHtml: z.string().min(1).max(250_000).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields provided" });
