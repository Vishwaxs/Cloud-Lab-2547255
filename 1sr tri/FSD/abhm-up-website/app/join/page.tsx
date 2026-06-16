import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";
import JoinForm from "./ui/JoinForm";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Membership and volunteer interest form — securely stored with server-side validation.",
  alternates: { canonical: "/join" },
  openGraph: { url: "/join" },
};

export default function JoinPage() {
  return (
    <div>
      <PageTitle
        title="Membership"
        subtitle="Please enter accurate information. This form is securely stored with server-side validation (Zod)."
      />
      <Container className="pb-14">
        <Card className="border-white/20 bg-white/10 text-white">
          <JoinForm />
        </Card>
      </Container>
    </div>
  );
}
