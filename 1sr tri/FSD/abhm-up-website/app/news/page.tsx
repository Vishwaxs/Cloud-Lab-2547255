import type { Metadata } from "next";
import Link from "next/link";

import Card from "@/components/Card";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import { connectDb } from "@/lib/db";
import { isMongoConfigured } from "@/lib/env";
import { NewsPost } from "@/models/NewsPost";

export const metadata: Metadata = {
  title: "News & Announcements",
  description:
    "Press releases, organizational announcements, and the latest updates.",
  alternates: { canonical: "/news" },
  openGraph: { url: "/news" },
};

export const dynamic = "force-dynamic";

function coerceDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function formatDate(value: unknown) {
  const d = coerceDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export default async function NewsPage() {
  if (!isMongoConfigured()) {
    return (
      <div>
        <PageTitle
          title="News & Announcements"
          subtitle="Press releases, organizational announcements, and the latest updates."
        />
        <Container className="pb-14">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-sm text-white/85">
              News is not available because the database is not configured.
            </div>
            <div className="mt-2 text-xs text-white/70">
              Set <span className="font-mono">MONGODB_URI</span> and restart the dev server.
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  await connectDb();
  const items = await NewsPost.find({ status: "published" })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .limit(50)
    .select({
      title: 1,
      slug: 1,
      excerpt: 1,
      publishDate: 1,
      eventTime: 1,
      location: 1,
      publishedAt: 1,
      updatedAt: 1,
    })
    .lean();

  return (
    <div>
      <PageTitle
        title="News & Announcements"
        subtitle="Press releases, organizational announcements, and the latest updates."
      />
      <Container className="pb-14">
        {items.length === 0 ? (
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-sm text-white/85">No news or releases are currently published.</div>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <Card key={it.slug} className="border-white/20 bg-white/10 text-white">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
                    {it.publishDate || it.publishedAt || it.updatedAt ? (
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(it.publishDate ?? it.publishedAt ?? it.updatedAt)}
                      </div>
                    ) : null}
                    {it.eventTime ? (
                      <div>
                        <span className="font-semibold">Time:</span> {it.eventTime}
                      </div>
                    ) : null}
                    {it.location ? (
                      <div>
                        <span className="font-semibold">Location:</span> {it.location}
                      </div>
                    ) : null}
                  </div>
                  <Link
                    className="text-lg font-semibold text-white hover:underline"
                    href={`/news/${it.slug}`}
                  >
                    {it.title}
                  </Link>
                  {it.excerpt ? (
                    <div className="text-sm leading-relaxed text-white/85">{it.excerpt}</div>
                  ) : null}
                  <div>
                    <Link className="text-sm text-white underline underline-offset-4 opacity-90 hover:opacity-100" href={`/news/${it.slug}`}>
                      Read more →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

