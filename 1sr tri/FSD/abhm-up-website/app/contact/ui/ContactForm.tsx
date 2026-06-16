"use client";

import { useMemo, useState } from "react";
import Button from "@/components/Button";

type FormState = {
  name: string;
  mobile: string;
  district: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    mobile: "",
    district: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: true } | { ok: false; message: string }>(null);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.mobile.trim().length >= 10 &&
      form.message.trim().length >= 10
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        district: form.district.trim() ? form.district : undefined,
        message: form.message,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Request failed. Please try again.");
      }

      setResult({ ok: true });
      setForm({ name: "", mobile: "", district: "", message: "" });
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
          placeholder="Example: Rahul Kumar"
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
          label="District (optional)"
          value={form.district}
          onChange={(v) => setForm((p) => ({ ...p, district: v }))}
          placeholder="Example: Lucknow"
        />
        <div className="md:col-span-2">
          <label className="block">
            <span className="text-sm font-semibold text-white">Message</span>
            <textarea
              className="mt-2 h-28 w-full resize-none rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-black outline-none"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Write your message briefly (at least 10 characters)."
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Sending…" : "Send message"}
        </Button>
        <div className="text-xs text-white/70">
          Please avoid unnecessary/offensive content; messages may be forwarded after verification.
        </div>
      </div>

      {result?.ok ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Your message has been received. The relevant unit may contact you if needed.
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
