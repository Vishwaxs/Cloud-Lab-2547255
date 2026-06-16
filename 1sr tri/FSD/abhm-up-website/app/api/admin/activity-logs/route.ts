import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession(["superadmin", "admin"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_activity_logs_list", 120, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    
    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
