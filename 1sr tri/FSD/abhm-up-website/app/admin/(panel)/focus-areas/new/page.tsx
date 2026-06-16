import { requireAdminSession } from "@/lib/auth/session";
import FocusAreaForm from "../FocusAreaForm";

export const metadata = {
  title: "Add Focus Area",
};

export default async function NewFocusAreaPage() {
  await requireAdminSession(["superadmin", "admin", "editor"]);

  return <FocusAreaForm />;
}
