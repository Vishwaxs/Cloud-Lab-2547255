import { requireAdminSession } from "@/lib/auth/session";
import AnnouncementForm from "../AnnouncementForm";

export const metadata = { title: "Create Announcement" };

export default async function AdminAnnouncementNewPage() {
  await requireAdminSession(["superadmin", "admin", "editor"]);
  return <AnnouncementForm mode="create" />;
}
