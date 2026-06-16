import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { Leader } from "@/models/Leader";
import { connectDB } from "@/lib/db/mongodb";
import LeaderForm from "../LeaderForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Leader",
};

async function getLeader(id: string) {
  try {
    await connectDB();
    const leader = await Leader.findById(id).lean();
    
    if (!leader) return null;

    return {
      ...leader,
      _id: leader._id.toString(),
    };
  } catch {
    return null;
  }
}

export default async function EditLeaderPage({ params }: { params: { id: string } }) {
  await requireAdminSession(["superadmin", "admin", "editor"]);
  const leader = await getLeader(params.id);

  if (!leader) {
    notFound();
  }

  return <LeaderForm initialData={leader} />;
}
