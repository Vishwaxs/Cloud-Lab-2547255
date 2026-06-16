import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Card from "@/components/Card";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import { connectDb } from "@/lib/db";
import { isMongoConfigured } from "@/lib/env";
import { NewsPost } from "@/models/NewsPost";

export const dynamic = "force-dynamic";

function formatDate(d?: Date) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export async function generateMetadata(
  props: Readonly<{ params: Promise<{ slug: string }> }>
): Promise<Metadata> {
  if (!isMongoConfigured()) {
    return { title: "News" };
  }

  const { slug } = await props.params;
  await connectDb();
  const item = await NewsPost.findOne({ slug, status: "published" })
    .select({ title: 1, excerpt: 1 })
    .lean();

  if (!item) {
    return { title: "News" };
  }

  return {
    title: item.title,
    description: item.excerpt,
  };
}

export default async function NewsDetailPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  if (!isMongoConfigured()) {
    return (
      <div>
        <PageTitle
          title="News"
          subtitle="This page requires database configuration."
        />
        <Container className="pb-14">
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-sm text-white/85">
              This news item cannot be loaded because the database is not configured.
            </div>
            <div className="mt-2 text-xs text-white/70">
              Set <span className="font-mono">MONGODB_URI</span> and restart the dev server.
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const { slug } = await params;
  await connectDb();

  const item = await NewsPost.findOne({ slug, status: "published" }).lean();
  if (!item) return notFound();

  const displayDate =
    (item.publishDate ? formatDate(item.publishDate) : "") ||
    (item.publishedAt ? formatDate(item.publishedAt) : "") ||
    formatDate(item.updatedAt);

  return (
    <div>
      <PageTitle
        title={item.title}
        subtitle={displayDate}
      />
      <Container className="pb-14">
        <Card className="border-white/20 bg-white/10 text-white">
          {item.excerpt ? (
            <div className="mb-5 rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-white/85">
              {item.excerpt}
            </div>
          ) : null}

          {(item.publishDate || item.eventTime || item.location) ? (
            <div className="mb-5 rounded-lg border border-white/20 bg-white/5 p-4 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/90">
                {displayDate ? (
                  <div>
                    <span className="font-semibold">Date:</span> {displayDate}
                  </div>
                ) : null}
                {item.eventTime ? (
                  <div>
                    <span className="font-semibold">Time:</span> {item.eventTime}
                  </div>
                ) : null}
                {item.location ? (
                  <div>
                    <span className="font-semibold">Location:</span> {item.location}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <article
            className="prose prose-sm max-w-none prose-invert prose-a:text-white prose-a:underline prose-a:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }}
          />
        </Card>
      </Container>
    </div>
  );
}
