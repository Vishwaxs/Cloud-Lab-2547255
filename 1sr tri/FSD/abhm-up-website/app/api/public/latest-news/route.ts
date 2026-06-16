import { NextResponse, type NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { NewsPost } from "@/models/NewsPost";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("public_latest_news", 120, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDb();
    
    const items = await NewsPost.find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .select({ title: 1, titleHi: 1, slug: 1, publishedAt: 1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error: unknown) {
    console.error("Failed to fetch latest news:", error);
    return NextResponse.json({ items: [] });
  }
}
