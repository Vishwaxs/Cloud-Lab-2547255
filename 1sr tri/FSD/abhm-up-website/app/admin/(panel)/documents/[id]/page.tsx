import { notFound } from "next/navigation";

import { requireAdminSession } from "@/lib/auth/session";
import { connectDb } from "@/lib/db";
import { Document } from "@/models/Document";
import DocumentForm from "../DocumentForm";

export const metadata = { title: "Edit Document" };

export default async function AdminDocumentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession(["superadmin", "admin", "editor", "viewer"]);

  const { id } = await params;

  await connectDb();
  const item = await Document.findById(id).lean();
  if (!item) return notFound();

  return (
    <DocumentForm
      mode="edit"
      initial={{
        id: String(item._id),
        title: item.title ?? "",
        titleHi: item.titleHi ?? "",
        description: item.description ?? "",
        descriptionHi: item.descriptionHi ?? "",
        category: item.category ?? "",
        fileUrl: item.fileUrl ?? "",
        fileType: item.fileType ?? "",
        order: String(item.order ?? 0),
        status: item.status ?? "draft",
      }}
    />
  );
}
