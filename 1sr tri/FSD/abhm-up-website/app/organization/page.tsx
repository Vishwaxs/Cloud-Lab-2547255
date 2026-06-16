import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Organization",
  description:
    "Organization structure overview — National → State → District → Block coordination.",
  alternates: { canonical: "/organization" },
  openGraph: { url: "/organization" },
};

export default function OrganizationPage() {
  return (
    <div>
      <PageTitle
        title="Organization Structure"
        subtitle="National → State → District → Block — a formal structure and coordination overview."
      />
      <Container className="pb-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">National Level</div>
            <div className="mt-3 text-sm text-white/85">
              National President/office-bearers • policy direction • national programs
            </div>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">State Level (U.P.)</div>
            <div className="mt-3 text-sm text-white/85">
              State President/office-bearers • district coordination • statewide programs
            </div>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">District Level</div>
            <div className="mt-3 text-sm text-white/85">
              District unit • local civic issues • program execution
            </div>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Block Level</div>
            <div className="mt-3 text-sm text-white/85">
              Block unit • volunteer coordination • campaign/membership support
            </div>
          </Card>
        </div>
        <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-5 text-sm text-white/85">
          This structure is for information. Detailed unit lists and in-charge details are published/updated officially from time to time.
        </div>
      </Container>
    </div>
  );
}
