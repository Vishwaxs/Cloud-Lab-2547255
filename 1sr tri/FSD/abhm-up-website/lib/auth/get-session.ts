import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type SessionData = {
  userId: string;
  email: string;
  role: string;
};

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;
    
    if (!token || !process.env.JWT_SECRET) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as SessionData;
    return decoded;
  } catch {
    return null;
  }
}
