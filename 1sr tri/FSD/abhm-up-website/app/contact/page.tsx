import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";
import ContactForm from "./ui/ContactForm";
import { getPublicSiteSettings } from "@/lib/site-settings/public";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Office addresses, email/phone, map, and a contact form for public outreach.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  const contact = settings?.contact;
  const stateOfficeAddress =
    contact?.address ||
    "26A, Vaishnopuri Colony, Khurshid Bagh (Near: Durga Tents), Lucknow, Uttar Pradesh";
  const email = contact?.email || "info@akhilbharthindumahasabha.org";
  const phone = contact?.phone || "011-23365138, 011-23365354";

  return (
    <div>
      <PageTitle
        title="Contact"
        subtitle="Office addresses, email/phone, map, and contact form."
      />
      <Container className="pb-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Offices</div>
            <div className="mt-3 space-y-2 text-sm text-white/85">
              <div>
                <span className="font-semibold text-white">State Office:</span>{" "}
                {stateOfficeAddress}
              </div>
              <div>
                <span className="font-semibold text-white">Contact Office:</span> D.P. Complex,
                Matiyari Chauraha, Deva Road, Lucknow-55, Uttar Pradesh
              </div>
              <div>
                <span className="font-semibold text-white">Central Office:</span> Hindu Mahasabha Bhawan,
                Mandir Marg, New Delhi-110001
              </div>
              <div>
                <span className="font-semibold text-white">Email:</span>{" "}
                {email}
              </div>
              <div>
                <span className="font-semibold text-white">Website:</span> akhilbharathindumahasabha.org
              </div>
              <div>
                <span className="font-semibold text-white">Phone:</span>{" "}
                {phone}
              </div>
            </div>
          </Card>
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Map</div>
            <div className="mt-3 overflow-hidden rounded-lg border border-white/20">
              <iframe
                title="Office location (Lucknow)"
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=DP%20Complex%20Matiyari%20Chauraha%20Deva%20Road%20Lucknow&output=embed"
              />
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-base font-semibold">Contact Form</div>
            <p className="mt-2 text-sm text-white/85">
              Please keep your message clear and factual. This form is for public outreach.
            </p>
            <div className="mt-4">
              <ContactForm />
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
