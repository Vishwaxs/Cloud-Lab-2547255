"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type RibbonItem = {
  _id: string;
  title: string;
  titleHi?: string;
  href: string;
  publishDate?: string;
  eventTime?: string;
  location?: string;
  locationHi?: string;
  publishedAt?: string;
  updatedAt?: string;
};

function formatDateIso(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function AnnouncementRibbon({
  items,
}: Readonly<{ items: RibbonItem[] }>) {
  const { lang } = useLanguage();

  if (!items || items.length === 0) return null;

  const first = items[0];
  const displayDate =
    formatDateIso(first.publishDate) ??
    formatDateIso(first.publishedAt) ??
    formatDateIso(first.updatedAt);

  const title = lang === "hi" && first.titleHi ? first.titleHi : first.title;
  const location = lang === "hi" && first.locationHi ? first.locationHi : first.location;

  return (
    <div className="border-b border-white/20 bg-white/10 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/90">
          <span className="h-2 w-2 rounded-full bg-white/80" />
          Announcement
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90">
          <Link href={first.href} className="font-semibold hover:underline">
            {title}
          </Link>
          {displayDate ? (
            <span className="text-xs text-white/75">
              <span className="font-semibold">Date:</span> {displayDate}
            </span>
          ) : null}
          {first.eventTime ? (
            <span className="text-xs text-white/75">
              <span className="font-semibold">Time:</span> {first.eventTime}
            </span>
          ) : null}
          {location ? (
            <span className="text-xs text-white/75">
              <span className="font-semibold">Location:</span> {location}
            </span>
          ) : null}
        </div>

        <Link
          className="text-xs font-semibold text-white/90 underline underline-offset-4 hover:text-white"
          href="/news"
        >
          View all
        </Link>
      </div>
    </div>
  );
}
