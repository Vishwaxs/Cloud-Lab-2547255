"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import { adminFetch } from "@/lib/security/adminFetch";

type FocusAreaFormProps = {
  initialData?: {
    _id?: string;
    title: string;
    titleHi?: string;
    description?: string;
    descriptionHi?: string;
    icon?: string;
    order: number;
    isActive: boolean;
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function FocusAreaForm({ initialData }: FocusAreaFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?._id;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    titleHi: initialData?.titleHi || "",
    description: initialData?.description || "",
    descriptionHi: initialData?.descriptionHi || "",
    icon: initialData?.icon || "",
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = isEdit ? `/api/admin/focus-areas/${initialData._id}` : "/api/admin/focus-areas";
      const method = isEdit ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save focus area");
      }

      router.push("/admin/focus-areas");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save focus area"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !confirm("Are you sure you want to delete this focus area?")) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await adminFetch(`/api/admin/focus-areas/${initialData._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete focus area");
      }

      router.push("/admin/focus-areas");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete focus area"));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageTitle
        title={isEdit ? "Edit Focus Area" : "Add Focus Area"}
        subtitle="Manage organizational focus areas and principles"
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
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="Education & Empowerment"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">Description</span>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="Detailed description of this focus area..."
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
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="शिक्षा और सशक्तिकरण"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">विवरण (Description)</span>
                <textarea
                  rows={4}
                  value={formData.descriptionHi}
                  onChange={(e) => handleChange("descriptionHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="इस फोकस क्षेत्र का विस्तृत विवरण..."
                />
              </label>
            </div>
          </Card>

          {/* Display Settings */}
          <Card className="bg-blue-50/50">
            <h3 className="text-lg font-bold mb-4">Display Settings</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  🎨 Icon/Emoji
                </span>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleChange("icon", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="📚 or 🎓"
                  maxLength={10}
                />
                <span className="mt-1 text-xs text-black/60">Single emoji or icon</span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  📊 Display Order
                </span>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleChange("order", parseInt(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="0"
                />
                <span className="mt-1 text-xs text-black/60">Lower numbers appear first</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-black/15"
                />
                <span className="text-sm font-semibold text-black/80">
                  ✓ Active (Show on website)
                </span>
              </label>
            </div>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <div className="text-sm text-red-800">{error}</div>
            </Card>
          )}

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Focus Area"}
            </Button>

            {isEdit && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/focus-areas")}
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
