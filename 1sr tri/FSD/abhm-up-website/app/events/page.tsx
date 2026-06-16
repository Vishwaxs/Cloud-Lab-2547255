import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and past events — date, venue, details, and participation (RSVP) information.",
  alternates: { canonical: "/events" },
  openGraph: { url: "/events" },
};

export default function EventsPage() {
  return (
    <div>
      <PageTitle
        title="Events"
        subtitle="Upcoming and past events — date, venue, details, and participation (RSVP) information."
      />
      <Container className="pb-14">
        <Card className="border-white/20 bg-white/10 text-white">
          <div className="text-sm text-white/85">
            No events are currently published.
          </div>
        </Card>
      </Container>
    </div>
  );
}
