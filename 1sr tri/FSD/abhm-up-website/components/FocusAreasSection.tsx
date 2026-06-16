"use client";

import Card from "@/components/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/motion/Reveal";

type FocusArea = {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  icon?: string;
};

type FocusAreasSectionProps = {
  focusAreas: FocusArea[];
};

export default function FocusAreasSection({ focusAreas }: FocusAreasSectionProps) {
  const { t, language } = useLanguage();

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">{t("focus.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm opacity-90">
            {t("focus.subtitle")}
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((area) => {
            const displayTitle = language === "hi" && area.titleHi ? area.titleHi : area.title;
            const displayDescription = language === "hi" && area.descriptionHi ? area.descriptionHi : area.description;
            
            return (
              <Reveal key={area._id} delay={0.02}>
                <Card className="group bg-white/10 backdrop-blur-sm border-white/20 text-center text-white hover:bg-white/15 hover:-translate-y-1 hover:shadow-lg/10 transition-all duration-300 cursor-pointer">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-3xl opacity-90 transition-transform duration-300 group-hover:opacity-100">
                    {area.icon || "◆"}
                  </div>
                <h3 className="mt-4 text-lg font-semibold">{displayTitle}</h3>
                {displayDescription && (
                  <p className="mt-2 text-sm leading-relaxed opacity-90">{displayDescription}</p>
                )}
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
