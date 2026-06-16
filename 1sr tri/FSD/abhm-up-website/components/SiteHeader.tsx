import SiteHeaderClient from "./SiteHeaderClient";
import { getSession } from "@/lib/auth/get-session";

export default async function SiteHeader() {
  const session = await getSession();
  return <SiteHeaderClient session={session} />;
}
