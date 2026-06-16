import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_TOKEN_COOKIE } from "./cookie";
import { verifyAdminJwt, type JwtRole } from "./jwt";

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifyAdminJwt(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession(allowedRoles?: JwtRole[]) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/admin/login");
  }

  return session;
}
