import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Providers from "./Providers";
import { getPublicSiteSettings } from "@/lib/site-settings/public";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Akhil Bharat Hindu Mahasabha (U.P.)",
    template: "%s | Akhil Bharat Hindu Mahasabha (U.P.)",
  },
  description:
    "Official website of Akhil Bharat Hindu Mahasabha (Uttar Pradesh) — organization, leadership, news, events, membership, and official documents.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: {
      default: "Akhil Bharat Hindu Mahasabha (U.P.)",
      template: "%s | Akhil Bharat Hindu Mahasabha (U.P.)",
    },
    description:
      "Official website of Akhil Bharat Hindu Mahasabha (Uttar Pradesh) — organization, leadership, news, events, membership, and official documents.",
    url: "/",
    siteName: "Akhil Bharat Hindu Mahasabha (U.P.)",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: {
      default: "Akhil Bharat Hindu Mahasabha (U.P.)",
      template: "%s | Akhil Bharat Hindu Mahasabha (U.P.)",
    },
    description:
      "Official website of Akhil Bharat Hindu Mahasabha (Uttar Pradesh) — organization, leadership, news, events, membership, and official documents.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // NOTE: Root layout is a Server Component; fetch settings server-side and pass
  // safe, serializable props into client components.
  const settings = await getPublicSiteSettings();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter settings={settings} />
        </Providers>
      </body>
    </html>
  );
}
