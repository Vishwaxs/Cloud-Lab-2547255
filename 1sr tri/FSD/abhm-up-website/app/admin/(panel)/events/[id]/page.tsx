import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { Event } from "@/models/Event";
import { connectDB } from "@/lib/db/mongodb";
import EventForm from "../EventForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Event",
};

async function getEvent(id: string) {
  try {
    await connectDB();
    const event = await Event.findById(id).lean();
    
    if (!event) return null;

    return {
      ...event,
      _id: event._id.toString(),
      eventDate: event.eventDate?.toISOString().split("T")[0],
    };
  } catch {
    return null;
  }
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requireAdminSession(["superadmin", "admin", "editor"]);
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return <EventForm initialData={event} />;
}
