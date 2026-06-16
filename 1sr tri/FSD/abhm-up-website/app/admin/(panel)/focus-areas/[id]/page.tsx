import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { FocusArea } from "@/models/FocusArea";
import { connectDB } from "@/lib/db/mongodb";
import FocusAreaForm from "../FocusAreaForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Focus Area",
};

async function getFocusArea(id: string) {
  try {
    await connectDB();
    const area = await FocusArea.findById(id).lean();
    
    if (!area) return null;

    return {
      ...area,
      _id: area._id.toString(),
    };
  } catch {
    return null;
  }
}

export default async function EditFocusAreaPage({ params }: { params: { id: string } }) {
  await requireAdminSession(["superadmin", "admin", "editor"]);
  const area = await getFocusArea(params.id);

  if (!area) {
    notFound();
  }

  return <FocusAreaForm initialData={area} />;
}
