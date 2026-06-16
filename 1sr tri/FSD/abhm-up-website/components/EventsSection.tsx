"use client";

import Link from "next/link";
import Card from "@/components/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/motion/Reveal";

type Event = {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  locationHi?: string;
  status: string;
};

type NewsItem = {
  _id: string;
  title: string;
  titleHi?: string;
  excerpt?: string;
  excerptHi?: string;
  slug: string;
  publishDate?: string;
  eventTime?: string;
  location?: string;
  locationHi?: string;
  publishedAt?: string;
  updatedAt?: string;
};

type EventsSectionProps = {
  events: Event[];
  newsItems?: NewsItem[];
};

function formatDateIso(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export default function EventsSection({ events, newsItems = [] }: EventsSectionProps) {
  const { t, language } = useLanguage();
  const publishedEvents = events.filter((e) => e.status === "published").slice(0, 3);
  const publishedNews = newsItems.slice(0, 3);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{t("news.title")}</h2>
              <p className="mt-1 text-sm opacity-90">{t("news.subtitle")}</p>
            </div>
            <Link className="text-sm text-white underline opacity-90 hover:opacity-100" href="/news">
              {t("news.viewAll")}
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <Card className="group bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t("news.announcements")}</h3>
                <Link className="text-sm text-white underline opacity-90 hover:opacity-100 transition-opacity" href="/news">
                  {t("news.viewAll")}
                </Link>
              </div>
              {publishedNews.length === 0 ? (
                <p className="mt-4 text-sm opacity-90">{t("news.noItems")}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {publishedNews.map((item) => {
                    const displayTitle =
                      language === "hi" && item.titleHi ? item.titleHi : item.title;
                    const displayExcerpt =
                      language === "hi" && item.excerptHi
                        ? item.excerptHi
                        : item.excerpt;
                    const displayLocation =
                      language === "hi" && item.locationHi
                        ? item.locationHi
                        : item.location;

                    const displayDate =
                      formatDateIso(item.publishDate) ??
                      formatDateIso(item.publishedAt) ??
                      formatDateIso(item.updatedAt);

                    return (
                      <div key={item._id} className="border-t border-white/20 pt-3">
                        <Link
                          className="text-sm font-semibold hover:underline"
                          href={`/news/${item.slug}`}
                        >
                          {displayTitle}
                        </Link>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90">
                          {displayDate ? (
                            <div>
                              <span className="font-semibold">Date:</span> {displayDate}
                            </div>
                          ) : null}
                          {item.eventTime ? (
                            <div>
                              <span className="font-semibold">Time:</span> {item.eventTime}
                            </div>
                          ) : null}
                          {displayLocation ? (
                            <div>
                              <span className="font-semibold">Location:</span> {displayLocation}
                            </div>
                          ) : null}
                        </div>

                        {displayExcerpt ? (
                          <div className="mt-2 text-xs leading-relaxed opacity-85">
                            {displayExcerpt}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="group bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t("events.upcoming")}</h3>
                <Link className="text-sm text-white underline opacity-90 hover:opacity-100 transition-opacity" href="/events">
                  {t("news.viewAll")}
                </Link>
              </div>
              {publishedEvents.length === 0 ? (
                <p className="mt-4 text-sm opacity-90">{t("events.noItems")}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {publishedEvents.map((event) => {
                    const displayTitle =
                      language === "hi" && event.titleHi ? event.titleHi : event.title;
                    const displayLocation =
                      language === "hi" && event.locationHi
                        ? event.locationHi
                        : event.location;

                    const displayDate = formatDateIso(event.eventDate);

                    return (
                      <div key={event._id} className="border-t border-white/20 pt-3">
                        <div className="text-sm font-semibold">{displayTitle}</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90">
                          {displayDate ? (
                            <div>
                              <span className="font-semibold">Date:</span> {displayDate}
                            </div>
                          ) : null}
                          {event.eventTime ? (
                            <div>
                              <span className="font-semibold">Time:</span> {event.eventTime}
                            </div>
                          ) : null}
                          {displayLocation ? (
                            <div>
                              <span className="font-semibold">Location:</span> {displayLocation}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
