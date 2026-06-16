"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import ImageUpload from "@/components/ImageUpload";
import { adminFetch } from "@/lib/security/adminFetch";

type EventFormProps = {
  initialData?: {
    _id?: string;
    title: string;
    titleHi?: string;
    slug: string;
    description: string;
    descriptionHi?: string;
    eventDate: string;
    eventTime?: string;
    location: string;
    locationHi?: string;
    imageUrl?: string;
    status: "draft" | "published";
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?._id;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    titleHi: initialData?.titleHi || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    descriptionHi: initialData?.descriptionHi || "",
    eventDate: initialData?.eventDate?.split("T")[0] || "",
    eventTime: initialData?.eventTime || "",
    location: initialData?.location || "",
    locationHi: initialData?.locationHi || "",
    imageUrl: initialData?.imageUrl || "",
    status: initialData?.status || "draft",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === "title" && !isEdit) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  async function submitEvent(publish: boolean) {
    setSubmitting(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/admin/events/${initialData?._id}`
        : "/api/admin/events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: publish ? "published" : formData.status,
          publishedAt: publish ? new Date().toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save event");
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save event"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitEvent(false);
  }

  return (
    <div>
      <PageTitle
        title={isEdit ? "Edit Event" : "Create Event"}
        subtitle="Add event details with date, time, and location"
        tone="dark"
      />
      
      <Container className="pb-14">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* English Section */}
          <Card>
            <h3 className="text-lg font-bold mb-4">English Content</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  Title <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="Annual Membership Drive 2025"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  Slug (URL) <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black font-mono outline-none focus:border-(--abhm-deep-red)"
                  placeholder="annual-membership-drive-2025"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  Description <span className="text-red-600">*</span>
                </span>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="Join us for the annual membership drive..."
                />
              </label>
            </div>
          </Card>

          {/* Hindi Section */}
          <Card className="bg-orange-50/50">
            <h3 className="text-lg font-bold mb-4">Hindi Content (Optional)</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-black/80">शीर्षक (Title)</span>
                <input
                  type="text"
                  value={formData.titleHi}
                  onChange={(e) => handleChange("titleHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="वार्षिक सदस्यता अभियान 2025"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">विवरण (Description)</span>
                <textarea
                  rows={4}
                  value={formData.descriptionHi}
                  onChange={(e) => handleChange("descriptionHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="वार्षिक सदस्यता अभियान में शामिल हों..."
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">स्थान (Location)</span>
                <input
                  type="text"
                  value={formData.locationHi}
                  onChange={(e) => handleChange("locationHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="लखनऊ, उत्तर प्रदेश"
                />
              </label>
            </div>
          </Card>

          {/* Event Details */}
          <Card className="bg-blue-50/50">
            <h3 className="text-lg font-bold mb-4">Event Details</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  📅 Event Date <span className="text-red-600">*</span>
                </span>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => handleChange("eventDate", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">🕐 Event Time</span>
                <input
                  type="text"
                  value={formData.eventTime}
                  onChange={(e) => handleChange("eventTime", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="10:00 AM - 2:00 PM"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  📍 Location <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-(--abhm-deep-red)"
                  placeholder="Lucknow, Uttar Pradesh"
                />
              </label>

              <ImageUpload
                label="🖼️ Event Image"
                images={formData.imageUrl ? [formData.imageUrl] : []}
                onChange={(urls) => handleChange("imageUrl", urls[0] || "")}
                multiple={false}
              />
            </div>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <div className="text-sm text-red-800">{error}</div>
            </Card>
          )}

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Save as Draft"}
            </Button>
            
            <Button
              type="button"
              onClick={() => submitEvent(true)}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Publishing..." : "Publish Event"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/events")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
