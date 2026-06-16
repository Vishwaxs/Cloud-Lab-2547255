"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "./Container";
import Button from "./Button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PublicSiteSettings } from "@/lib/site-settings/public";
import type { SocialLink } from "@/models/SiteSettings";

function normalizeSocialKey(label: string) {
  const v = label.trim().toLowerCase();
  if (v === "x" || v.includes("twitter")) return "twitter";
  if (v.includes("facebook")) return "facebook";
  if (v.includes("youtube")) return "youtube";
  if (v.includes("instagram")) return "instagram";
  return v;
}

function getSocialUrl(links: SocialLink[] | undefined, key: string) {
  if (!links || links.length === 0) return undefined;
  const normalizedKey = key.trim().toLowerCase();
  const found = links.find((l) => normalizeSocialKey(l.label) === normalizedKey);
  return found?.url;
}

export default function SiteFooter({
  settings,
}: {
  settings: PublicSiteSettings | null;
}) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const socialLinks = settings?.socialLinks;
  const facebookUrl = getSocialUrl(socialLinks, "facebook") || "https://facebook.com";
  const twitterUrl = getSocialUrl(socialLinks, "twitter") || "https://twitter.com";
  const youtubeUrl = getSocialUrl(socialLinks, "youtube") || "https://youtube.com";
  const instagramUrl = getSocialUrl(socialLinks, "instagram") || "https://instagram.com";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <footer className="border-t border-white/20 bg-gradient-to-r from-[var(--abhm-saffron)] to-[var(--abhm-orange)]">
      <div className="h-0.5 w-full bg-white/30" />
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="text-lg font-bold text-white">{t("footer.org")}</div>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              {t("footer.description")}
            </p>
            <div className="mt-6">
              <div className="text-sm font-semibold text-white">{t("footer.followUs")}</div>
              <div className="mt-3 flex gap-3">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                  aria-label="YouTube"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t("footer.usefulLinks")}</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/">
                  {t("header.nav.home")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/about">
                  {t("header.nav.about")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/organization">
                  {t("header.nav.organization")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/documents">
                  {t("header.nav.documents")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/news">
                  {t("header.nav.news")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/events">
                  {t("header.nav.events")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/join">
                  {t("header.nav.membership")}
                </Link>
              </li>
              <li>
                <Link className="text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block" href="/contact">
                  {t("header.nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t("footer.subscribe")}</div>
            <p className="mt-2 text-sm text-white/90">{t("footer.subscribeDesc")}</p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.emailPlaceholder")}
                  required
                  className="rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <Button type="submit" className="w-full transition-all duration-300 hover:scale-105">
                  {submitted ? t("footer.btnSubscribed") : t("footer.btnSubscribe")}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-6">
          <div className="flex flex-col gap-4 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
            <div>
              © {year} {t("footer.copyright")}
            </div>
            <div className="flex gap-4">
              <Link className="hover:text-white" href="/documents">
                {t("header.nav.documents")}
              </Link>
              <Link className="hover:text-white" href="/leadership">
                {t("header.nav.leadership")}
              </Link>
              <Link className="hover:text-white" href="/contact">
                {t("header.nav.contact")}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
