import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const adminProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    currentPassword: z.string().min(8).max(200).optional(),
    newPassword: z.string().min(8).max(200).optional(),
  })
  .refine(
    (v) =>
      (typeof v.currentPassword === "string" && typeof v.newPassword === "string") ||
      (v.currentPassword === undefined && v.newPassword === undefined),
    { message: "currentPassword and newPassword must be provided together" }
  )
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
