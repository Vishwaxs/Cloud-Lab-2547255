import type { Metadata } from "next";

import PageTitle from "@/components/PageTitle";
import Container from "@/components/Container";
import Card from "@/components/Card";
import { connectDb } from "@/lib/db";
import { Document } from "@/models/Document";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Official documents and communications — prepared or uploaded for download.",
  alternates: { canonical: "/documents" },
  openGraph: { url: "/documents" },
};

type DocRow = {
  _id: unknown;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  category?: string;
  fileUrl: string;
  fileType?: string;
};

export default async function DocumentsPage() {
  let items: DocRow[] = [];
  try {
    await connectDb();
    items = await Document.find({ status: "published" })
      .sort({ order: 1, updatedAt: -1 })
      .limit(200)
      .select({
        title: 1,
        titleHi: 1,
        description: 1,
        descriptionHi: 1,
        category: 1,
        fileUrl: 1,
        fileType: 1,
      })
      .lean<DocRow[]>();
  } catch {
    items = [];
  }

  return (
    <div>
      <PageTitle
        title="Documents"
        subtitle="Official documents/communications — prepared or uploaded for PDF download."
      />
      <Container className="pb-14">
        {items.length === 0 ? (
          <Card className="border-white/20 bg-white/10 text-white">
            <div className="text-sm text-white/85">No documents are currently published.</div>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((d) => (
              <Card key={String(d._id)} className="border-white/20 bg-white/10 text-white">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-base font-semibold">{d.title}</div>
                    {d.titleHi ? <div className="mt-1 text-sm text-white/85">{d.titleHi}</div> : null}
                    {d.category ? <div className="mt-2 text-xs font-semibold text-white/70">{d.category}</div> : null}
                    {d.description ? <div className="mt-2 text-sm text-white/85">{d.description}</div> : null}
                    {d.descriptionHi ? <div className="mt-1 text-sm text-white/80">{d.descriptionHi}</div> : null}
                  </div>

                  <a
                    className="mt-2 inline-flex w-fit items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 md:mt-0"
                    href={d.fileUrl}
                    target={d.fileUrl.startsWith("/") ? undefined : "_blank"}
                    rel={d.fileUrl.startsWith("/") ? undefined : "noreferrer"}
                  >
                    Download {d.fileType ? `(${d.fileType})` : ""}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
