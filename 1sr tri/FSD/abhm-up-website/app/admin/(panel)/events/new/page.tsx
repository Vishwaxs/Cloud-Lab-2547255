import { requireAdminSession } from "@/lib/auth/session";
import EventForm from "../EventForm";

export const metadata = {
  title: "Create Event",
};

export default async function NewEventPage() {
  await requireAdminSession(["superadmin", "admin", "editor"]);

  return <EventForm />;
}
