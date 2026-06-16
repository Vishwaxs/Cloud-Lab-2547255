import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import { requireAdminSession } from "@/lib/auth/session";
import { Leader } from "@/models/Leader";
import { connectDB } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export const metadata = { title: "Leaders" };

async function getLeaders() {
  try {
    await connectDB();
    const leaders = await Leader.find({})
      .sort({ order: 1 })
      .limit(50)
      .lean();
    
    return leaders.map((leader) => ({
      ...leader,
      _id: leader._id.toString(),
      createdAt: leader.createdAt.toISOString(),
      updatedAt: leader.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function LeadersPage() {
  await requireAdminSession(["superadmin", "admin", "editor", "viewer"]);
  const leaders = await getLeaders();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <PageTitle title="Leaders" subtitle="Manage organizational leaders" tone="dark" />
        <Button href="/admin/leaders/new">+ New Leader</Button>
      </div>

      <Container className="pb-14">
        {leaders.length === 0 ? (
          <Card>
            <div className="text-center text-sm text-black/60">
              No leaders yet.{" "}
              <Link className="text-red-600 underline" href="/admin/leaders/new">
                Add your first leader
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaders.map((leader) => (
              <Link key={leader._id} href={`/admin/leaders/${leader._id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {leader.imageUrl && (
                        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          <img 
                            src={leader.imageUrl} 
                            alt={leader.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-base font-semibold">{leader.name}</div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              leader.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {leader.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-black/40">Order: {leader.order}</span>
                        </div>
                        <div className="mt-1 text-sm text-black/70">{leader.role}</div>
                        {leader.description && (
                          <p className="mt-2 text-sm text-black/60 line-clamp-2">
                            {leader.description.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
