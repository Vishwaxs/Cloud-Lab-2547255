import slugify from "slugify";
import { connectDb } from "@/lib/db";
import { NewsPost } from "@/models/NewsPost";

export function generateBaseSlug(input: string) {
  const base = slugify(input, {
    lower: true,
    strict: true,
    trim: true,
  });
  return base && base.length > 0 ? base : `post-${Date.now()}`;
}

export async function ensureUniqueSlug(desiredSlug: string, excludeId?: string) {
  await connectDb();

  const base = desiredSlug;
  let candidate = base;
  let i = 2;

  while (true) {
    const existing = await NewsPost.findOne(
      excludeId
        ? { slug: candidate, _id: { $ne: excludeId } }
        : { slug: candidate }
    )
      .select({ _id: 1 })
      .lean();

    if (!existing) return candidate;
    candidate = `${base}-${i}`;
    i += 1;
  }
}
