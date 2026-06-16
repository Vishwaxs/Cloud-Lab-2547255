import { z } from "zod";

const mobileRegex = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  mobile: z.string().regex(mobileRegex, "Invalid mobile number"),
  district: z.string().min(2).max(60).optional(),
  message: z.string().min(10).max(1000),
});

export type ContactInput = z.infer<typeof contactSchema>;
