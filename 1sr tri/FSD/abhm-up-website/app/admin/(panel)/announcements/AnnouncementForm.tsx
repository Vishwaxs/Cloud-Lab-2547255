"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { adminFetch } from "@/lib/security/adminFetch";

type FormValue = {
  title: string;
  titleHi: string;
  href: string;
  publishDate: string;
  eventTime: string;
  location: string;
  locationHi: string;
  startAt: string;
  endAt: string;
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
    href: initial?.href ?? "",
    publishDate: initial?.publishDate ?? "",
    eventTime: initial?.eventTime ?? "",
    location: initial?.location ?? "",
    locationHi: initial?.locationHi ?? "",
    startAt: initial?.startAt ?? "",
    endAt: initial?.endAt ?? "",
    status: initial?.status ?? "draft",
  };
}

export default function AnnouncementForm({ mode, initial }: Readonly<Props>) {
  const router = useRouter();
  const [value, setValue] = useState<FormValue>(() => toFormValue(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!value.title.trim()) return false;
    if (!value.href.trim()) return false;
    return true;
  }, [value.title, value.href]);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: value.title,
        titleHi: value.titleHi || undefined,
        href: value.href,
        publishDate: value.publishDate || undefined,
        eventTime: value.eventTime || undefined,
        location: value.location || undefined,
        locationHi: value.locationHi || undefined,
        startAt: value.startAt || undefined,
        endAt: value.endAt || undefined,
        status: value.status,
      };

      const res = await adminFetch(
        mode === "create" ? "/api/admin/announcements" : `/api/admin/announcements/${initial?.id}`,
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

      router.push("/admin/announcements");
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
          {mode === "create" ? "Create Announcement" : "Edit Announcement"}
        </div>

        {error ? (
          <div className="rounded-lg border border-[var(--abhm-deep-red)]/25 bg-[var(--abhm-deep-red)]/5 p-3 text-sm text-black">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title (EN)</span>
            <input value={value.title} onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))} placeholder="Announcement title" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Title (HI) (optional)</span>
            <input value={value.titleHi} onChange={(e) => setValue((v) => ({ ...v, titleHi: e.target.value }))} placeholder="शीर्षक" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Link (URL or /path)</span>
          <input value={value.href} onChange={(e) => setValue((v) => ({ ...v, href: e.target.value }))} placeholder="/news or https://…" />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Date (optional)</span>
            <input value={value.publishDate} onChange={(e) => setValue((v) => ({ ...v, publishDate: e.target.value }))} placeholder="2026-01-03" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Time (optional)</span>
            <input value={value.eventTime} onChange={(e) => setValue((v) => ({ ...v, eventTime: e.target.value }))} placeholder="10:30 AM" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Location (EN) (optional)</span>
            <input value={value.location} onChange={(e) => setValue((v) => ({ ...v, location: e.target.value }))} placeholder="Lucknow" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Location (HI) (optional)</span>
          <input value={value.locationHi} onChange={(e) => setValue((v) => ({ ...v, locationHi: e.target.value }))} placeholder="लखनऊ" />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Start At (optional)</span>
            <input value={value.startAt} onChange={(e) => setValue((v) => ({ ...v, startAt: e.target.value }))} placeholder="2026-01-03T00:00:00Z" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">End At (optional)</span>
            <input value={value.endAt} onChange={(e) => setValue((v) => ({ ...v, endAt: e.target.value }))} placeholder="2026-01-10T00:00:00Z" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Status</span>
            <select value={value.status} onChange={(e) => setValue((v) => ({ ...v, status: e.target.value as FormValue["status"] }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button href="/admin/announcements" variant="outline">
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={!canSubmit || submitting} aria-disabled={!canSubmit || submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="text-xs text-black/70">
          Tip: Use {"\"Start At\""} / {"\"End At\""} to auto-expire announcements.
        </div>
      </div>
    </Card>
  );
}
