"use client";

import { useMemo, useState } from "react";
import Button from "@/components/Button";

type FormState = {
  name: string;
  mobile: string;
  district: string;
  roleInterest: string;
};

export default function JoinForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    mobile: "",
    district: "",
    roleInterest: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: true } | { ok: false; message: string }>(null);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.mobile.trim().length >= 10 &&
      form.district.trim().length >= 2 &&
      form.roleInterest.trim().length >= 2
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Request failed. Please try again.");
      }

      setResult({ ok: true });
      setForm({ name: "", mobile: "", district: "", roleInterest: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed.";
      setResult({ ok: false, message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Full name"
          value={form.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          placeholder="Example: Akhil Kumar"
          autoComplete="name"
        />
        <Field
          label="Mobile"
          value={form.mobile}
          onChange={(v) => setForm((p) => ({ ...p, mobile: v }))}
          placeholder="Example: 98XXXXXXXX"
          inputMode="numeric"
          autoComplete="tel"
        />
        <Field
          label="District"
          value={form.district}
          onChange={(v) => setForm((p) => ({ ...p, district: v }))}
          placeholder="Example: Lucknow"
        />
        <Field
          label="Role of interest"
          value={form.roleInterest}
          onChange={(v) => setForm((p) => ({ ...p, roleInterest: v }))}
          placeholder="Example: Organization work / Outreach"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
        <div className="text-xs text-white/70">
          Your information is stored securely for organizational contact.
        </div>
      </div>

      {result?.ok ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Your request has been received. A relevant team member will contact you soon.
        </div>
      ) : null}

      {result && !result.ok ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {result.message}
        </div>
      ) : null}
    </form>
  );
}

function Field(
  props: Readonly<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    autoComplete?: string;
  }>
) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{props.label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-black outline-none"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        inputMode={props.inputMode}
        autoComplete={props.autoComplete}
      />
    </label>
  );
}
