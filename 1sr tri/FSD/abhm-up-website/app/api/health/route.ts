import { NextResponse, type NextRequest } from "next/server";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = getMongoRateLimiter("health", 120, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }
  return NextResponse.json({ ok: true, service: "abhm-up-website" });
}
