import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "National and Uttar Pradesh leadership — roles, responsibilities, and organizational functions.",
  alternates: { canonical: "/leadership" },
  openGraph: { url: "/leadership" },
};

export default function LeadershipPage() {
  return (
    <div>
      <PageTitle
        title="Leadership"
        subtitle="National and Uttar Pradesh leadership — roles, responsibilities, and organizational functions."
      />
      <Container className="pb-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">National Leadership</div>
            <p className="mt-3 text-sm text-white/85">
              Policy direction, organization-building, program approval, and national-level coordination.
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-white/25 p-4 text-sm text-white/75">
              Verified office-bearer list (with official notification) will be published.
            </div>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">State Leadership (Uttar Pradesh)</div>
            <p className="mt-3 text-sm text-white/85">
              District/block coordination, outreach, event operations, and administrative communication.
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-white/25 p-4 text-sm text-white/75">
              Verified office-bearer list (with official notification) will be published.
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
