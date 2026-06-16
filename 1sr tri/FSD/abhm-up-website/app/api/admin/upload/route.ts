import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { getClientIp } from "@/lib/security/request";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { requireCsrf } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(request);
    const limiter = getMongoRateLimiter("admin_upload", 20, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const csrf = requireCsrf(request);
    if (csrf) return csrf;

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      if (!isImage && !isPdf) continue; // Skip unsupported files

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const rawExt = file.name.split(".").pop() || "";
      const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");
      const safeExt = ext.length ? ext : isPdf ? "pdf" : "bin";
      const filename = `${timestamp}-${randomStr}.${safeExt}`;

      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      uploadedFiles.push({
        filename,
        url: `/uploads/${filename}`,
        originalName: sanitizePlainText(file.name),
        size: file.size,
        type: file.type,
      });
    }

    // Log the upload activity
    try {
      await connectDB();
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "upload",
        details: `Uploaded ${uploadedFiles.length} file(s)`,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
