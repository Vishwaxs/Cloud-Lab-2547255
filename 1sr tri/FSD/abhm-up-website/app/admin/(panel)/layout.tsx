import Container from "@/components/Container";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import LogoutButton from "./LogoutButton";
import SessionRefresh from "./SessionRefresh";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-[70vh] bg-[#fffdf9] text-black">
      <SessionRefresh />
      <div className="border-b border-black/10 bg-white">
        <div className="h-1 w-full bg-[var(--abhm-deep-red)]" />
        <Container className="py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-semibold text-black">Admin Dashboard</div>
              <div className="text-sm text-black/80">{session.email} • {session.role}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex flex-wrap gap-2 text-sm">
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin">Overview</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/leaders">Leaders</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/news">News</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/announcements">Announcements</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/events">Events</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/documents">Documents</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/memberships">Membership</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/settings">Site Settings</Link>
              <Link className="rounded-md px-3 py-2 text-black hover:bg-black/5" href="/admin/profile">Profile</Link>
              </nav>
              <LogoutButton />
            </div>
          </div>
        </Container>
      </div>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
