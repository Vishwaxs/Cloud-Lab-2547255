import { z } from "zod";

const mobileRegex = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;

export const membershipSchema = z.object({
  name: z.string().min(2).max(80),
  mobile: z.string().regex(mobileRegex, "Invalid mobile number"),
  district: z.string().min(2).max(60),
  roleInterest: z.string().min(2).max(80),
});

export type MembershipInput = z.infer<typeof membershipSchema>;
