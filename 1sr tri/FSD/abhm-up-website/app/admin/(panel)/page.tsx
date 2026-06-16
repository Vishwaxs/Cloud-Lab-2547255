"use client";

import Card from "@/components/Card";
import Link from "next/link";

export default function AdminPage() {
  const contentSections = [
    {
      title: "News & Announcements",
      description: "Create, edit, and manage news articles with images, dates, times, and locations",
      href: "/admin/news",
      icon: "📰",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Events",
      description: "Manage upcoming events with dates, times, locations, and event details",
      href: "/admin/events",
      icon: "📅",
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Leaders",
      description: "Add and manage historic and current organizational leaders",
      href: "/admin/leaders",
      icon: "👥",
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "Focus Areas",
      description: "Edit the core principles and focus areas displayed on homepage",
      href: "/admin/focus-areas",
      icon: "🎯",
      color: "bg-orange-50 border-orange-200",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <div className="text-xl font-bold text-black">Admin Dashboard</div>
        <p className="mt-2 text-sm text-black/80">
          Welcome to the ABHM (U.P.) content management system. Use the sections below to manage all website content including text, images, and structured data.
        </p>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-black mb-4">Content Management</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {contentSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className={`${section.color} hover:shadow-lg transition-all duration-300 cursor-pointer h-full`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{section.icon}</div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-black">{section.title}</div>
                    <p className="mt-1 text-sm text-black/80">{section.description}</p>
                  </div>
                  <svg className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-gray-50">
          <div className="text-sm font-semibold text-black">Role-based Access</div>
          <div className="mt-2 text-sm text-black/80">
            Only authorized users can add or edit content.
          </div>
        </Card>
        <Card className="bg-gray-50">
          <div className="text-sm font-semibold text-black">Draft & Publish</div>
          <div className="mt-2 text-sm text-black/80">
            Save content as draft or publish directly to the website.
          </div>
        </Card>
        <Card className="bg-gray-50">
          <div className="text-sm font-semibold text-black">Bilingual Support</div>
          <div className="mt-2 text-sm text-black/80">
            Add content in both English and Hindi for the language toggle.
          </div>
        </Card>
      </div>
    </div>
  );
}

