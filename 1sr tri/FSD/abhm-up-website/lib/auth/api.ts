import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "./cookie";
import { verifyAdminJwt, type JwtPayload, type JwtRole } from "./jwt";

export type ApiAuthResult =
  | { ok: true; session: JwtPayload }
  | { ok: false; response: Response };

export async function requireAdminApiSession(allowedRoles?: JwtRole[]): Promise<ApiAuthResult> {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const session = await verifyAdminJwt(token);
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return { ok: false, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { ok: true, session };
  } catch {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}
