"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const nav = [
  { href: "/", labelKey: "header.nav.home" },
  { href: "/about", labelKey: "header.nav.about" },
  { href: "/leadership", labelKey: "header.nav.leadership" },
  { href: "/organization", labelKey: "header.nav.organization" },
  { href: "/news", labelKey: "header.nav.news" },
  { href: "/events", labelKey: "header.nav.events" },
  { href: "/documents", labelKey: "header.nav.documents" },
  { href: "/join", labelKey: "header.nav.membership" },
  { href: "/contact", labelKey: "header.nav.contact" },
];

type SessionData = {
  userId: string;
  email: string;
  role: string;
} | null;

type NewsItem = {
  _id: string;
  title: string;
  titleHi?: string;
  slug: string;
  publishedAt?: string;
};

export default function SiteHeaderClient({ session }: { session: SessionData }) {
  const { t, lang } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/public/latest-news");
        if (res.ok) {
          const data = await res.json();
          setNewsItems(data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
    }
    fetchNews();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-[var(--abhm-saffron)] to-[var(--abhm-orange)] shadow-lg">
      <div className="h-1 w-full bg-white/30" />

      <div className="border-b border-white/20 bg-white/10">
        <div className="overflow-hidden">
          <Container className="py-1">
            <div className="relative">
              <div className="abhm-marquee gap-8 text-xs text-white/90 transition-transform duration-300">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-semibold">{t("header.announcement")}</span>
                  {newsItems.length > 0 ? (
                    newsItems.map((item, idx) => (
                      <span key={item._id} className="flex items-center gap-2">
                        <Link className="hover:underline" href={`/news/${item.slug}`}>
                          {lang === "hi" && item.titleHi ? item.titleHi : item.title}
                        </Link>
                        {idx < newsItems.length - 1 && <span className="text-white/40">•</span>}
                      </span>
                    ))
                  ) : (
                    <Link className="hover:underline" href="/news">
                      {t("header.nav.news")} & {t("news.announcements")}
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2 whitespace-nowrap" aria-hidden="true">
                  <span className="font-semibold">{t("header.announcement")}</span>
                  {newsItems.length > 0 ? (
                    newsItems.map((item, idx) => (
                      <span key={`dup-${item._id}`} className="flex items-center gap-2">
                        <Link className="hover:underline" href={`/news/${item.slug}`} tabIndex={-1}>
                          {lang === "hi" && item.titleHi ? item.titleHi : item.title}
                        </Link>
                        {idx < newsItems.length - 1 && <span className="text-white/40">•</span>}
                      </span>
                    ))
                  ) : (
                    <Link className="hover:underline" href="/news" tabIndex={-1}>
                      {t("header.nav.news")} & {t("news.announcements")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <Link href="/" className="text-xl font-semibold tracking-tight text-white transition-all duration-300 hover:text-white/90 hover:scale-105 inline-block">
                {t("header.title")}
              </Link>
              <div className="text-sm text-white/80 transition-opacity duration-300">
                {t("header.subtitle")}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border-2 border-white/30 bg-white/10 text-white transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
              {session ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  className="flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Admin Login</span>
                </Link>
              )}
              <LanguageToggle />
              </div>
              
              {/* Mobile Language Toggle */}
              <div className="md:hidden">
                <LanguageToggle />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-wrap gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Navigation Menu */}
          <nav
            className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-1 py-2 border-t border-white/20">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 hover:translate-x-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              
              {/* Mobile Admin Link */}
              {session ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 hover:translate-x-2 border-t border-white/20 mt-2 pt-3"
                >
                  📊 Dashboard
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 hover:translate-x-2 border-t border-white/20 mt-2 pt-3"
                >
                  🔐 Admin Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}
