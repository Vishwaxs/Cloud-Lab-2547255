import { requireAdminSession } from "@/lib/auth/session";
import LeaderForm from "../LeaderForm";

export const metadata = {
  title: "Add Leader",
};

export default async function NewLeaderPage() {
  await requireAdminSession(["superadmin", "admin", "editor"]);

  return <LeaderForm />;
}
