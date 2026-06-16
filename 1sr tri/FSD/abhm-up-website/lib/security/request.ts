import type { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  const direct = (req as unknown as { ip?: unknown } | null | undefined)?.ip;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const headerCandidates = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "true-client-ip",
    "x-client-ip",
  ];

  for (const headerName of headerCandidates) {
    const value = req.headers.get(headerName);
    if (!value) continue;
    const first = headerName === "x-forwarded-for" ? value.split(",")[0] : value;
    const ip = first?.trim();
    if (ip) return ip;
  }

  // Stable fallback so we don't accidentally rate-limit the entire app as one "unknown" key.
  const ua = req.headers.get("user-agent")?.slice(0, 200) || "";
  const al = req.headers.get("accept-language")?.slice(0, 80) || "";
  const host = req.headers.get("host")?.slice(0, 120) || "";
  const fallback = [host, ua, al].filter(Boolean).join("|");
  return fallback || "unknown";
}
