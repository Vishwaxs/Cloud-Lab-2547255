import { notFound } from "next/navigation";

import { requireAdminSession } from "@/lib/auth/session";
import { connectDb } from "@/lib/db";
import { NewsPost } from "@/models/NewsPost";
import NewsForm from "../NewsForm";

export const metadata = { title: "Edit News" };

export default async function AdminNewsEditPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  await requireAdminSession(["superadmin", "admin", "editor"]);
  const { id } = await params;

  await connectDb();
  const item = await NewsPost.findById(id).lean();
  if (!item) return notFound();

  return (
    <NewsForm
      mode="edit"
      initial={{
        id: String(item._id),
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt ?? "",
        status: item.status,
        contentHtml: item.contentHtml,
      }}
    />
  );
}
