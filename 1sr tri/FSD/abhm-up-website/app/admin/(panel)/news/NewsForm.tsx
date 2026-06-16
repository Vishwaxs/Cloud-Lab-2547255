"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Card from "@/components/Card";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "./RichTextEditor";
import { adminFetch } from "@/lib/security/adminFetch";

type FormValue = {
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published";
  contentHtml: string;
  images: string[];
};

type Props = {
  mode: "create" | "edit";
  initial?: Partial<FormValue> & { id?: string };
};

function toFormValue(initial?: Partial<FormValue>): FormValue {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    status: initial?.status ?? "draft",
    contentHtml: initial?.contentHtml ?? "",
    images: initial?.images ?? [],
  };
}

export default function NewsForm({ mode, initial }: Readonly<Props>) {
  const router = useRouter();
  const [value, setValue] = useState<FormValue>(() => toFormValue(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!value.title.trim()) return false;
    if (!value.contentHtml.trim()) return false;
    return true;
  }, [value.title, value.contentHtml]);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: value.title,
        slug: value.slug || undefined,
        excerpt: value.excerpt || undefined,
        status: value.status,
        contentHtml: value.contentHtml,
        images: value.images.length > 0 ? value.images : undefined,
      };

      const res = await adminFetch(
        mode === "create" ? "/api/admin/news" : `/api/admin/news/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        return;
      }

      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="text-base font-semibold">
          {mode === "create" ? "Create News / Announcement" : "Edit News / Announcement"}
        </div>

        {error ? (
          <div className="rounded-lg border border-[var(--abhm-deep-red)]/25 bg-[var(--abhm-deep-red)]/5 p-3 text-sm text-black">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title</span>
            <input
              className="h-10 rounded-lg border border-black/15 px-3 text-sm text-black outline-none focus:border-black/30"
              value={value.title}
              onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
              placeholder="Title"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Slug (optional)</span>
            <input
              className="h-10 rounded-lg border border-black/15 px-3 text-sm text-black outline-none focus:border-black/30"
              value={value.slug}
              onChange={(e) => setValue((v) => ({ ...v, slug: e.target.value }))}
              placeholder="example-slug"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Excerpt (optional)</span>
          <textarea
            className="min-h-[80px] rounded-lg border border-black/15 px-3 py-2 text-sm text-black outline-none focus:border-black/30"
            value={value.excerpt}
            onChange={(e) => setValue((v) => ({ ...v, excerpt: e.target.value }))}
            placeholder="Short summary"
          />
        </label>

        <div className="flex flex-col gap-1">
          <ImageUpload
            label="📰 News Images (Gallery)"
            images={value.images}
            onChange={(urls) => setValue((v) => ({ ...v, images: urls }))}
            multiple={true}
            maxImages={5}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Status</span>
            <select
              className="h-10 rounded-lg border border-black/15 bg-white px-3 text-sm text-black outline-none focus:border-black/30"
              value={value.status}
              onChange={(e) => setValue((v) => ({ ...v, status: e.target.value as FormValue["status"] }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button href="/admin/news" variant="outline">
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              aria-disabled={!canSubmit || submitting}
            >
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-2 text-sm font-semibold">Content</div>
          <RichTextEditor
            value={value.contentHtml}
            onChange={(html) => setValue((v) => ({ ...v, contentHtml: html }))}
          />
        </div>
      </div>
    </Card>
  );
}
