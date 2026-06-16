import Link from "next/link";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { requireAdminSession } from "@/lib/auth/session";
import { connectDb } from "@/lib/db";
import { Announcement } from "@/models/Announcement";

export const metadata = { title: "Announcements" };

type Row = {
  _id: unknown;
  title: string;
  href: string;
  status: "draft" | "published";
  startAt?: Date;
  endAt?: Date;
  updatedAt?: Date;
};

function formatDate(d?: Date) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function AdminAnnouncementsPage() {
  await requireAdminSession(["superadmin", "admin", "editor", "viewer"]);

  await connectDb();
  const items = await Announcement.find({})
    .sort({ updatedAt: -1 })
    .limit(200)
    .select({ title: 1, href: 1, status: 1, startAt: 1, endAt: 1, updatedAt: 1 })
    .lean<Row[]>();

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold">Announcements</div>
          <div className="mt-1 text-sm text-black/70">Short ribbon announcements with optional scheduling.</div>
        </div>
        <Button href="/admin/announcements/new">Create</Button>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs font-semibold text-black/70">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Link</th>
                <th className="py-2 pr-4">Active Window</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="py-4 text-black/70" colSpan={5}>
                    No items.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={String(it._id)} className="border-b border-black/5">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-black">{it.title}</div>
                      <div className="mt-1 text-xs text-black/60">Updated: {formatDate(it.updatedAt)}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          it.status === "published"
                            ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-black/70"
                        }
                      >
                        {it.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs">{it.href}</span>
                    </td>
                    <td className="py-3 pr-4 text-black/70">
                      {formatDate(it.startAt)} → {formatDate(it.endAt)}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
                          href={`/admin/announcements/${String(it._id)}`}
                        >
                          Edit
                        </Link>
                        <Link
                          className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
                          href={it.href}
                          target={it.href.startsWith("/") ? undefined : "_blank"}
                          rel={it.href.startsWith("/") ? undefined : "noreferrer"}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
