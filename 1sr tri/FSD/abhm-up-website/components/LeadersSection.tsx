"use client";

import Link from "next/link";
import Card from "@/components/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/motion/Reveal";

type Leader = {
  _id: string;
  name: string;
  nameHi?: string;
  role: string;
  roleHi?: string;
  imageUrl?: string;
};

type LeadersSectionProps = {
  leaders: Leader[];
};

export default function LeadersSection({ leaders }: LeadersSectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">{t("leaders.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm opacity-90">
            {t("leaders.subtitle")}
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {leaders.slice(0, 4).map((leader) => {
            const displayName = language === "hi" && leader.nameHi ? leader.nameHi : leader.name;
            const displayRole = language === "hi" && leader.roleHi ? leader.roleHi : leader.role;
            
            return (
              <Reveal key={leader._id} delay={0.02}>
                <Card className="group bg-white/10 backdrop-blur-sm border-white/20 text-center text-white hover:bg-white/15 hover:-translate-y-1 hover:shadow-lg/10 transition-all duration-300 cursor-pointer">
                {leader.imageUrl ? (
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
                    <img
                      src={leader.imageUrl}
                      alt={displayName}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-2xl font-bold transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
                    {displayName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                )}
                <h3 className="mt-4 font-semibold">{displayName}</h3>
                <p className="mt-1 text-sm opacity-90">{displayRole}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.12}>
          <div className="mt-8 text-center">
            <Link className="text-sm text-white underline opacity-90 hover:opacity-100" href="/leadership">
              {t("leaders.viewAll")}
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
