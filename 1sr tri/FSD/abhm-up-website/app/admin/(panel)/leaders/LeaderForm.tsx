"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageTitle from "@/components/PageTitle";
import ImageUpload from "@/components/ImageUpload";
import { adminFetch } from "@/lib/security/adminFetch";

type LeaderFormProps = {
  initialData?: {
    _id?: string;
    name: string;
    nameHi?: string;
    role: string;
    roleHi?: string;
    description?: string;
    descriptionHi?: string;
    imageUrl?: string;
    order: number;
    isActive: boolean;
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function LeaderForm({ initialData }: LeaderFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?._id;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nameHi: initialData?.nameHi || "",
    role: initialData?.role || "",
    roleHi: initialData?.roleHi || "",
    description: initialData?.description || "",
    descriptionHi: initialData?.descriptionHi || "",
    imageUrl: initialData?.imageUrl || "",
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
      const url = isEdit ? `/api/admin/leaders/${initialData._id}` : "/api/admin/leaders";
      const method = isEdit ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save leader");
      }

      router.push("/admin/leaders");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save leader"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !confirm("Are you sure you want to delete this leader?")) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await adminFetch(`/api/admin/leaders/${initialData._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete leader");
      }

      router.push("/admin/leaders");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete leader"));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageTitle
        title={isEdit ? "Edit Leader" : "Add Leader"}
        subtitle="Manage organizational leadership information"
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
                  Name <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="Pandit Madan Mohan Malaviya"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">
                  Role/Position <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="Founder & Freedom Fighter"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">Description</span>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="Brief biography or contribution details..."
                />
              </label>
            </div>
          </Card>

          {/* Hindi Section */}
          <Card className="bg-orange-50/50">
            <h3 className="text-lg font-bold mb-4">Hindi Content (Optional)</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-black/80">नाम (Name)</span>
                <input
                  type="text"
                  value={formData.nameHi}
                  onChange={(e) => handleChange("nameHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="पंडित मदन मोहन मालवीय"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">पद (Role)</span>
                <input
                  type="text"
                  value={formData.roleHi}
                  onChange={(e) => handleChange("roleHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="संस्थापक और स्वतंत्रता सेनानी"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-black/80">विवरण (Description)</span>
                <textarea
                  rows={4}
                  value={formData.descriptionHi}
                  onChange={(e) => handleChange("descriptionHi", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-orange-500"
                  placeholder="संक्षिप्त जीवनी या योगदान विवरण..."
                />
              </label>
            </div>
          </Card>

          {/* Display Settings */}
          <Card className="bg-purple-50/50">
            <h3 className="text-lg font-bold mb-4">Display Settings</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <ImageUpload
                  label="🖼️ Leader Photo"
                  images={formData.imageUrl ? [formData.imageUrl] : []}
                  onChange={(urls) => handleChange("imageUrl", urls[0] || "")}
                  multiple={false}
                />
              </div>

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
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Leader"}
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
              onClick={() => router.push("/admin/leaders")}
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
