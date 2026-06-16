import { connectDB } from "@/lib/db/mongodb";
import { Leader } from "@/models/Leader";
import { FocusArea } from "@/models/FocusArea";
import { Event } from "@/models/Event";
import { NewsPost } from "@/models/NewsPost";
import { Announcement } from "@/models/Announcement";
import HeroAndWelcome from "@/components/HeroAndWelcome";
import FocusAreasSection from "@/components/FocusAreasSection";
import LeadersSection from "@/components/LeadersSection";
import EventsSection from "@/components/EventsSection";
import DownloadsSection from "@/components/DownloadsSection";
import AnnouncementRibbon from "@/components/AnnouncementRibbon";

function toSerializableDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  return String(value);
}

async function getHomePageData() {
  try {
    await connectDB();

    const now = new Date();
    
    const [leaders, focusAreas, events, news, announcements] = await Promise.all([
      Leader.find({ isActive: true }).sort({ order: 1 }).limit(8).lean(),
      FocusArea.find({ isActive: true }).sort({ order: 1 }).limit(6).lean(),
      Event.find({ status: "published" }).sort({ eventDate: -1 }).limit(5).lean(),
      NewsPost.find({ status: "published" })
        .sort({ publishedAt: -1, updatedAt: -1 })
        .limit(5)
        .select({
          title: 1,
          titleHi: 1,
          slug: 1,
          excerpt: 1,
          excerptHi: 1,
          publishDate: 1,
          eventTime: 1,
          location: 1,
          locationHi: 1,
          publishedAt: 1,
          updatedAt: 1,
        })
        .lean(),
      Announcement.find({
        status: "published",
        $and: [
          { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
          { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
        ],
      })
        .sort({ publishedAt: -1, updatedAt: -1 })
        .limit(5)
        .select({
          title: 1,
          titleHi: 1,
          href: 1,
          publishDate: 1,
          eventTime: 1,
          location: 1,
          locationHi: 1,
          publishedAt: 1,
          updatedAt: 1,
        })
        .lean(),
    ]);

    return {
      leaders: leaders.map((l) => ({
        ...l,
        _id: l._id.toString(),
      })),
      focusAreas: focusAreas.map((f) => ({
        ...f,
        _id: f._id.toString(),
      })),
      events: events.map((e) => ({
        ...e,
        _id: e._id.toString(),
        eventDate: e.eventDate?.toISOString(),
      })),
      news: news.map((n) => ({
        ...n,
        _id: n._id.toString(),
        publishDate: toSerializableDate(n.publishDate),
        publishedAt: toSerializableDate(n.publishedAt),
        updatedAt: toSerializableDate(n.updatedAt),
      })),
      announcements: announcements.map((a) => ({
        ...a,
        _id: a._id.toString(),
        publishDate: toSerializableDate(a.publishDate),
        publishedAt: toSerializableDate(a.publishedAt),
        updatedAt: toSerializableDate(a.updatedAt),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return {
      leaders: [],
      focusAreas: [],
      events: [],
      news: [],
      announcements: [],
    };
  }
}

export default async function Home() {
  const { leaders, focusAreas, events, news, announcements } = await getHomePageData();

  const ribbonItems =
    announcements.length > 0
      ? announcements
      : news.map((n) => ({
          _id: n._id,
          title: n.title,
          titleHi: (n as { titleHi?: string }).titleHi,
          href: `/news/${n.slug}`,
          publishDate: n.publishDate,
          eventTime: n.eventTime,
          location: n.location,
          locationHi: (n as { locationHi?: string }).locationHi,
          publishedAt: n.publishedAt,
          updatedAt: n.updatedAt,
        }));

  return (
    <div>
      <AnnouncementRibbon items={ribbonItems} />
      <HeroAndWelcome />
      <FocusAreasSection focusAreas={focusAreas} />
      <LeadersSection leaders={leaders} />
      <EventsSection events={events} newsItems={news} />
      <DownloadsSection />
    </div>
  );
}
