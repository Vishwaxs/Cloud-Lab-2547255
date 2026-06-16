import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import { requireAdminSession } from "@/lib/auth/session";
import { FocusArea } from "@/models/FocusArea";
import { connectDB } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export const metadata = { title: "Focus Areas" };

async function getFocusAreas() {
  try {
    await connectDB();
    const focusAreas = await FocusArea.find({})
      .sort({ order: 1 })
      .limit(50)
      .lean();
    
    return focusAreas.map((area) => ({
      ...area,
      _id: area._id.toString(),
      createdAt: area.createdAt.toISOString(),
      updatedAt: area.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function FocusAreasPage() {
  await requireAdminSession(["superadmin", "admin", "editor", "viewer"]);
  const focusAreas = await getFocusAreas();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <PageTitle title="Focus Areas" subtitle="Manage organizational focus areas and principles" tone="dark" />
        <Button href="/admin/focus-areas/new">+ New Focus Area</Button>
      </div>

      <Container className="pb-14">
        {focusAreas.length === 0 ? (
          <Card>
            <div className="text-center text-sm text-black/60">
              No focus areas yet.{" "}
              <Link className="text-red-600 underline" href="/admin/focus-areas/new">
                Add your first focus area
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {focusAreas.map((area) => (
              <Link key={area._id} href={`/admin/focus-areas/${area._id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {area.icon && (
                        <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{area.icon}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-base font-semibold">{area.title}</div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              area.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {area.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-black/40">Order: {area.order}</span>
                        </div>
                        {area.description && (
                          <p className="mt-2 text-sm text-black/60 line-clamp-2">
                            {area.description.substring(0, 200)}...
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
