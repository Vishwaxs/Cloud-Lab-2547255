import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "../env";

export type JwtRole = "superadmin" | "admin" | "editor" | "viewer";

export type JwtPayload = {
  sub: string;
  role: JwtRole;
  email: string;
};

function getSecretKey() {
  const { JWT_SECRET } = getEnv();
  return new TextEncoder().encode(JWT_SECRET);
}

export async function signAdminJwt(payload: JwtPayload, expiresIn = "8h") {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyAdminJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const role = typeof payload.role === "string" ? payload.role : null;
  const email = typeof payload.email === "string" ? payload.email : null;

  if (!sub || !role || !email) {
    throw new Error("Invalid token payload");
  }

  return { sub, role: role as JwtPayload["role"], email };
}
