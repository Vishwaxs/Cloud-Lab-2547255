import { requireAdminSession } from "@/lib/auth/session";
import NewsForm from "../NewsForm";

export const metadata = { title: "Create News" };

export default async function AdminNewsNewPage() {
  await requireAdminSession(["superadmin", "admin", "editor"]);
  return <NewsForm mode="create" />;
}
