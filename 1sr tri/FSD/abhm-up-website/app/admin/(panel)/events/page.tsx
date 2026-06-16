import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import { requireAdminSession } from "@/lib/auth/session";
import { Event } from "@/models/Event";
import { connectDB } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export const metadata = { title: "Events" };

async function getEvents() {
  try {
    await connectDB();
    const events = await Event.find({})
      .sort({ eventDate: -1 })
      .limit(50)
      .lean();
    
    return events.map((evt) => ({
      ...evt,
      _id: evt._id.toString(),
      eventDate: evt.eventDate.toISOString(),
      publishedAt: evt.publishedAt?.toISOString() || null,
      createdAt: evt.createdAt.toISOString(),
      updatedAt: evt.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function AdminEventsPage() {
  await requireAdminSession(["superadmin", "admin", "editor", "viewer"]);
  const events = await getEvents();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <PageTitle title="Events" subtitle="Manage upcoming events" tone="dark" />
        <Button href="/admin/events/new">+ New Event</Button>
      </div>

      <Container className="pb-14">
        {events.length === 0 ? (
          <Card>
            <div className="text-center text-sm text-black/60">
              No events yet.{" "}
              <Link className="text-[var(--abhm-deep-red)] underline" href="/admin/events/new">
                Create your first event
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link key={event._id} href={`/admin/events/${event._id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-base font-semibold">{event.title}</div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            event.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-black/70 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-semibold">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        {event.eventTime && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold">{event.eventTime}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-semibold">{event.location}</span>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm text-black/60 line-clamp-2">
                          {event.description.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    <svg className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

