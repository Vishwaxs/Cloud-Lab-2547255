"use client";

import { useId, useState } from "react";
import { adminFetch } from "@/lib/security/adminFetch";

type UploadedFile = {
  url: string;
  filename: string;
  originalName: string;
  type: string;
  size: number;
};

type FileUploadProps = {
  label: string;
  fileUrl: string;
  onChange: (url: string) => void;
  accept?: string;
  hint?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function FileUpload({
  label,
  fileUrl,
  onChange,
  accept = "application/pdf,.pdf",
  hint = "PDF",
}: Readonly<FileUploadProps>) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Upload failed");
      }

      const uploaded = (data?.files?.[0] ?? null) as UploadedFile | null;
      if (!uploaded?.url) throw new Error("Upload failed");

      onChange(uploaded.url);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload file"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-black" htmlFor={inputId}>
          {label}
        </label>
        {fileUrl ? (
          <button
            type="button"
            className="rounded-md border border-black/10 bg-white px-3 py-1 text-xs font-semibold hover:bg-black/5"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        ) : null}
      </div>

      {fileUrl ? (
        <div className="rounded-lg border border-black/10 bg-black/5 p-3">
          <div className="text-xs font-semibold text-black/70">Current</div>
          <a className="mt-1 block text-sm font-semibold text-black underline" href={fileUrl} target="_blank" rel="noreferrer">
            {fileUrl}
          </a>
        </div>
      ) : null}

      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <label htmlFor={inputId}>
        <div className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-black/20 bg-white px-4 py-3 text-sm cursor-pointer hover:border-black/40 hover:bg-black/5 transition-colors">
          {uploading ? (
            <>
              <span className="text-black/60">Uploading…</span>
            </>
          ) : (
            <>
              <span className="text-black">{fileUrl ? "Replace File" : "Choose File"}</span>
              <span className="text-xs text-black/60">({hint})</span>
            </>
          )}
        </div>
      </label>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
      ) : null}
    </div>
  );
}
