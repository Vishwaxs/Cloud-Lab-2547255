"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/security/adminFetch";

type SocialLink = { label: string; url: string };

type SiteSettings = {
  hero: {
    title: string;
    titleHi?: string;
    subtitle?: string;
    subtitleHi?: string;
    description?: string;
    descriptionHi?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    imageUrl?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    addressHi?: string;
  };
  socialLinks?: SocialLink[];
};

function emptySettings(): SiteSettings {
  return {
    hero: {
      title: "Akhil Bharat Hindu Mahasabha (U.P.)",
      subtitle: "Official Website",
      description: "",
      primaryCtaLabel: "Join Now",
      primaryCtaHref: "https://example.com",
      secondaryCtaLabel: "Learn More",
      secondaryCtaHref: "https://example.com",
    },
    contact: {
      email: "",
      phone: "",
      address: "",
      addressHi: "",
    },
    socialLinks: [],
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

export default function SettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(emptySettings());

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch("/api/admin/site-settings", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load settings");

        const next: SiteSettings = data?.settings
          ? {
              hero: {
                title: data.settings.hero?.title ?? "",
                titleHi: data.settings.hero?.titleHi ?? "",
                subtitle: data.settings.hero?.subtitle ?? "",
                subtitleHi: data.settings.hero?.subtitleHi ?? "",
                description: data.settings.hero?.description ?? "",
                descriptionHi: data.settings.hero?.descriptionHi ?? "",
                primaryCtaLabel: data.settings.hero?.primaryCtaLabel ?? "",
                primaryCtaHref: data.settings.hero?.primaryCtaHref ?? "",
                secondaryCtaLabel: data.settings.hero?.secondaryCtaLabel ?? "",
                secondaryCtaHref: data.settings.hero?.secondaryCtaHref ?? "",
                imageUrl: data.settings.hero?.imageUrl ?? "",
              },
              contact: {
                email: data.settings.contact?.email ?? "",
                phone: data.settings.contact?.phone ?? "",
                address: data.settings.contact?.address ?? "",
                addressHi: data.settings.contact?.addressHi ?? "",
              },
              socialLinks: Array.isArray(data.settings.socialLinks) ? data.settings.socialLinks : [],
            }
          : emptySettings();

        if (alive) setSettings(next);
      } catch (e: unknown) {
        if (alive) setError(getErrorMessage(e, "Failed to load settings"));
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const canSave = useMemo(() => {
    return settings.hero.title.trim().length >= 3;
  }, [settings.hero.title]);

  async function save() {
    if (!canSave || saving) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminFetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save");

      setSuccess("Saved successfully.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to save"));
    } finally {
      setSaving(false);
    }
  }

  function updateHero(field: keyof SiteSettings["hero"], value: string) {
    setSettings((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  }

  function updateContact(field: keyof NonNullable<SiteSettings["contact"]>, value: string) {
    setSettings((prev) => ({ ...prev, contact: { ...(prev.contact ?? {}), [field]: value } }));
  }

  function updateSocialLink(index: number, field: keyof SocialLink, value: string) {
    setSettings((prev) => {
      const next = [...(prev.socialLinks ?? [])];
      next[index] = { ...(next[index] ?? { label: "", url: "" }), [field]: value };
      return { ...prev, socialLinks: next };
    });
  }

  function addSocialLink() {
    setSettings((prev) => ({ ...prev, socialLinks: [...(prev.socialLinks ?? []), { label: "", url: "" }] }));
  }

  function removeSocialLink(index: number) {
    setSettings((prev) => {
      const next = [...(prev.socialLinks ?? [])];
      next.splice(index, 1);
      return { ...prev, socialLinks: next };
    });
  }

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-black/70">Loading settings…</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <div className="text-sm text-red-800">{error}</div>
        </Card>
      ) : null}

      {success ? (
        <Card className="border-green-200 bg-green-50">
          <div className="text-sm text-green-800">{success}</div>
        </Card>
      ) : null}

      <Card>
        <div className="text-base font-bold text-black">Hero Section</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Title (English)</span>
            <input value={settings.hero.title} onChange={(e) => updateHero("title", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Title (Hindi)</span>
            <input value={settings.hero.titleHi ?? ""} onChange={(e) => updateHero("titleHi", e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-black/80">Subtitle (English)</span>
            <input value={settings.hero.subtitle ?? ""} onChange={(e) => updateHero("subtitle", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Subtitle (Hindi)</span>
            <input value={settings.hero.subtitleHi ?? ""} onChange={(e) => updateHero("subtitleHi", e.target.value)} />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-black/80">Description (English)</span>
            <textarea rows={4} value={settings.hero.description ?? ""} onChange={(e) => updateHero("description", e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-black/80">Description (Hindi)</span>
            <textarea rows={4} value={settings.hero.descriptionHi ?? ""} onChange={(e) => updateHero("descriptionHi", e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-black/80">Primary CTA Label</span>
            <input value={settings.hero.primaryCtaLabel ?? ""} onChange={(e) => updateHero("primaryCtaLabel", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Primary CTA URL</span>
            <input value={settings.hero.primaryCtaHref ?? ""} onChange={(e) => updateHero("primaryCtaHref", e.target.value)} placeholder="https://…" />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-black/80">Secondary CTA Label</span>
            <input value={settings.hero.secondaryCtaLabel ?? ""} onChange={(e) => updateHero("secondaryCtaLabel", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Secondary CTA URL</span>
            <input value={settings.hero.secondaryCtaHref ?? ""} onChange={(e) => updateHero("secondaryCtaHref", e.target.value)} placeholder="https://…" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-black/80">Hero Image URL (optional)</span>
            <input value={settings.hero.imageUrl ?? ""} onChange={(e) => updateHero("imageUrl", e.target.value)} placeholder="https://…" />
          </label>
        </div>
      </Card>

      <Card>
        <div className="text-base font-bold text-black">Contact Info</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Email</span>
            <input value={settings.contact?.email ?? ""} onChange={(e) => updateContact("email", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-black/80">Phone</span>
            <input value={settings.contact?.phone ?? ""} onChange={(e) => updateContact("phone", e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-black/80">Address (English)</span>
            <textarea rows={3} value={settings.contact?.address ?? ""} onChange={(e) => updateContact("address", e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-black/80">Address (Hindi)</span>
            <textarea rows={3} value={settings.contact?.addressHi ?? ""} onChange={(e) => updateContact("addressHi", e.target.value)} />
          </label>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-black">Social Links</div>
          <Button type="button" variant="outline" onClick={addSocialLink}>
            Add link
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {(settings.socialLinks ?? []).length === 0 ? (
            <div className="text-sm text-black/70">No social links yet.</div>
          ) : null}

          {(settings.socialLinks ?? []).map((l, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-black/80">Label</span>
                <input value={l.label} onChange={(e) => updateSocialLink(idx, "label", e.target.value)} placeholder="Facebook" />
              </label>
              <label className="block md:col-span-3">
                <span className="text-sm font-semibold text-black/80">URL</span>
                <input value={l.url} onChange={(e) => updateSocialLink(idx, "url", e.target.value)} placeholder="https://…" />
              </label>
              <div className="md:col-span-5">
                <Button type="button" variant="outline" onClick={() => removeSocialLink(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" disabled={!canSave || saving} onClick={save}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
        <div className="text-xs text-black/60">Changes save to MongoDB and can be wired to frontend safely with fallbacks.</div>
      </div>
    </div>
  );
}
