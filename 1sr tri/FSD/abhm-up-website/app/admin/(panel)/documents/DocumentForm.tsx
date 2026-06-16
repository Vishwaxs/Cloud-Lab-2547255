"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Card from "@/components/Card";
import FileUpload from "@/components/FileUpload";
import { adminFetch } from "@/lib/security/adminFetch";

type FormValue = {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: string;
  fileUrl: string;
  fileType: string;
  order: string;
  status: "draft" | "published";
};

type Props = {
  mode: "create" | "edit";
  initial?: Partial<FormValue> & { id?: string };
};

function toFormValue(initial?: Partial<FormValue>): FormValue {
  return {
    title: initial?.title ?? "",
    titleHi: initial?.titleHi ?? "",
    description: initial?.description ?? "",
    descriptionHi: initial?.descriptionHi ?? "",
    category: initial?.category ?? "",
    fileUrl: initial?.fileUrl ?? "",
    fileType: initial?.fileType ?? "PDF",
    order: initial?.order ?? "0",
    status: initial?.status ?? "draft",
  };
}

export default function DocumentForm({ mode, initial }: Readonly<Props>) {
  const router = useRouter();
  const [value, setValue] = useState<FormValue>(() => toFormValue(initial));
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!value.title.trim()) return false;
    if (!value.fileUrl.trim()) return false;
    return true;
  }, [value.title, value.fileUrl]);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: value.title,
        titleHi: value.titleHi || undefined,
        description: value.description || undefined,
        descriptionHi: value.descriptionHi || undefined,
        category: value.category || undefined,
        fileUrl: value.fileUrl,
        fileType: value.fileType || undefined,
        order: value.order,
        status: value.status,
      };

      const res = await adminFetch(mode === "create" ? "/api/admin/documents" : `/api/admin/documents/${initial?.id}`,
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

      router.push("/admin/documents");
      router.refresh();
    } catch {
      setError("Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (mode !== "edit") return;
    if (!initial?.id) return;

    const ok = window.confirm("Delete this document? This cannot be undone.");
    if (!ok) return;

    setError(null);
    setDeleting(true);

    try {
      const res = await adminFetch(`/api/admin/documents/${initial.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Delete failed");
        return;
      }

      router.push("/admin/documents");
      router.refresh();
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="text-base font-semibold">
          {mode === "create" ? "Create Document" : "Edit Document"}
        </div>

        {error ? (
          <div className="rounded-lg border border-(--abhm-deep-red)/25 bg-(--abhm-deep-red)/5 p-3 text-sm text-black">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title (EN)</span>
            <input value={value.title} onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))} placeholder="Document title" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title (HI) (optional)</span>
            <input value={value.titleHi} onChange={(e) => setValue((v) => ({ ...v, titleHi: e.target.value }))} placeholder="शीर्षक" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Description (EN) (optional)</span>
            <textarea rows={3} value={value.description} onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))} placeholder="Short description" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Description (HI) (optional)</span>
            <textarea rows={3} value={value.descriptionHi} onChange={(e) => setValue((v) => ({ ...v, descriptionHi: e.target.value }))} placeholder="संक्षिप्त विवरण" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Category (optional)</span>
            <input value={value.category} onChange={(e) => setValue((v) => ({ ...v, category: e.target.value }))} placeholder="Notices" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Order</span>
            <input value={value.order} onChange={(e) => setValue((v) => ({ ...v, order: e.target.value }))} placeholder="0" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Status</span>
            <select value={value.status} onChange={(e) => setValue((v) => ({ ...v, status: e.target.value as FormValue["status"] }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FileUpload
            label="PDF File"
            fileUrl={value.fileUrl}
            onChange={(url) => setValue((v) => ({ ...v, fileUrl: url }))}
            accept="application/pdf,.pdf"
            hint="PDF"
          />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">File Type (optional)</span>
            <input value={value.fileType} onChange={(e) => setValue((v) => ({ ...v, fileType: e.target.value }))} placeholder="PDF" />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button href="/admin/documents" variant="outline">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit || submitting} aria-disabled={!canSubmit || submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
          {mode === "edit" ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-(--abhm-deep-red) hover:bg-black/5 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
