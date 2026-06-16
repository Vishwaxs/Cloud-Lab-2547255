import { notFound } from "next/navigation";

import { requireAdminSession } from "@/lib/auth/session";
import { connectDb } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import AnnouncementForm from "../AnnouncementForm";

export const metadata = { title: "Edit Announcement" };

function toIsoInput(d?: Date) {
  if (!d) return "";
  return new Date(d).toISOString();
}

export default async function AdminAnnouncementEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession(["superadmin", "admin", "editor", "viewer"]);

  const { id } = await params;

  await connectDb();
  const item = await Announcement.findById(id).lean();
  if (!item) return notFound();

  return (
    <AnnouncementForm
      mode="edit"
      initial={{
        id: String(item._id),
        title: item.title ?? "",
        titleHi: item.titleHi ?? "",
        href: item.href ?? "",
        publishDate: item.publishDate ? new Date(item.publishDate).toISOString().slice(0, 10) : "",
        eventTime: item.eventTime ?? "",
        location: item.location ?? "",
        locationHi: item.locationHi ?? "",
        startAt: toIsoInput(item.startAt),
        endAt: toIsoInput(item.endAt),
        status: item.status ?? "draft",
      }}
    />
  );
}
