import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "About",
  description:
    "A brief, formal introduction to our history, vision, objectives, and public mission.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <div>
      <PageTitle
        title="About"
        subtitle="A brief, formal introduction to our history, vision, objectives, and public mission."
      />
      <Container className="pb-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">History</div>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              The organization’s work is centered on public service, social cohesion, and preservation of
              cultural awareness. The Uttar Pradesh unit operates through statewide organization-building,
              outreach, event coordination, and structured communication.
            </p>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Vision & Principles</div>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              The vision is to promote a strong, disciplined, self-reliant, and cohesive society that prioritizes
              national interest, civic duty, respect for law, and public service.
            </p>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Objectives</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/85">
              <li>Organizational discipline and volunteer capacity-building</li>
              <li>Lawful, fact-based public awareness on public-interest issues</li>
              <li>Social service, disaster support, and community participation</li>
              <li>Documenting civic issues locally and representing them appropriately</li>
            </ul>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Public Mission</div>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Building an educated, organized, and service-oriented civic society; maintaining transparent
              processes; and ensuring accountability in programs and communication.
            </p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
