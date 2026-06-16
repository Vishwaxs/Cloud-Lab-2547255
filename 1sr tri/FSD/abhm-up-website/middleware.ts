import { NextResponse, type NextRequest } from "next/server";
import { ensureCsrfCookie } from "@/lib/security/csrf";

function buildCsp(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  const scriptSrc = ["'self'", "'unsafe-inline'"].concat(
    isDev ? ["'unsafe-eval'"] : []
  );
  const connectSrc = ["'self'", "https:"]
    .concat(isDev && isLocalhost ? ["ws:", "http:"] : [])
    .join(" ");

  // Note: Next.js dev uses eval; production should be tightened further with nonces.
  return [
    "default-src 'self'",
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https:`,
    `style-src 'self' 'unsafe-inline'`,
    `script-src ${scriptSrc.join(" ")}`,
    `connect-src ${connectSrc}`,
    `upgrade-insecure-requests${isDev ? "" : ""}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // CSRF token cookie for same-origin mutating requests.
  ensureCsrfCookie(req, res);

  // Security headers (safe defaults; avoid breaking dev tooling)
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // CSP (relaxed in dev; should be hardened with nonces in production later)
  res.headers.set("Content-Security-Policy", buildCsp(req));

  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
