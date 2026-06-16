"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/security/adminFetch";

type UploadedImage = {
  url: string;
  filename: string;
  originalName: string;
};

type ImageUploadProps = {
  label: string;
  images: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxImages?: number;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export default function ImageUpload({
  label,
  images,
  onChange,
  multiple = false,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add files to form data
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      const uploadedUrls = data.files.map((f: UploadedImage) => f.url);

      if (multiple) {
        // Add to existing images
        const newImages = [...images, ...uploadedUrls].slice(0, maxImages);
        onChange(newImages);
      } else {
        // Replace single image
        onChange(uploadedUrls.slice(0, 1));
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }

  const canAddMore = multiple ? images.length < maxImages : images.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-black">{label}</label>
        {multiple && (
          <span className="text-xs text-black/60">
            {images.length} / {maxImages} images
          </span>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-black/15"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${label}`}
            disabled={uploading}
          />
          <label htmlFor={`image-upload-${label}`}>
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-black/20 bg-white px-4 py-3 text-sm cursor-pointer hover:border-black/40 hover:bg-black/5 transition-colors">
              {uploading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-black/60">Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-black">
                    {multiple ? "Add Images" : "Choose Image"}
                  </span>
                  <span className="text-xs text-black/60">
                    (PNG, JPG, GIF)
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      <p className="text-xs text-black/60">
        {multiple
          ? `Upload up to ${maxImages} images. Click on an image to remove it.`
          : "Upload a single image. Click to replace."}
      </p>
    </div>
  );
}
