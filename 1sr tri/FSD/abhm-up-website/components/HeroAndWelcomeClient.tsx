"use client";

import Button from "@/components/Button";
import Container from "@/components/Container";
import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/motion/Reveal";
import MicroMotion from "@/components/motion/MicroMotion";
import type { HeroSettings } from "@/models/SiteSettings";

type Props = {
  heroOverride?: Partial<HeroSettings> | null;
};

export default function HeroAndWelcomeClient({ heroOverride }: Props) {
  const { t, lang } = useLanguage();

  const title =
    (lang === "hi" ? heroOverride?.titleHi : heroOverride?.title) ||
    t("hero.title");
  const subtitle =
    (lang === "hi" ? heroOverride?.subtitleHi : heroOverride?.subtitle) ||
    t("hero.subtitle");
  const description =
    (lang === "hi" ? heroOverride?.descriptionHi : heroOverride?.description) ||
    t("hero.description");

  const primaryCtaLabel = heroOverride?.primaryCtaLabel || t("hero.btn.join");
  const primaryCtaHref = heroOverride?.primaryCtaHref || "/join";

  const secondaryCtaLabel = heroOverride?.secondaryCtaLabel || t("hero.btn.ideology");
  const secondaryCtaHref = heroOverride?.secondaryCtaHref || "/about";

  return (
    <>
      {/* Hero Section */}
      <div className="py-16 md:py-24">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/95 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                {subtitle}
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                {title}
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/90 md:text-xl">
                {description}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <MicroMotion>
                  <Button
                    href={primaryCtaHref}
                    className="bg-white text-(--abhm-deep-red) hover:bg-white/95 shadow-sm"
                  >
                    {primaryCtaLabel}
                  </Button>
                </MicroMotion>
                <MicroMotion>
                  <Button
                    href={secondaryCtaHref}
                    variant="outline"
                    className="border-2 border-white/70 bg-transparent text-white hover:bg-white/10"
                  >
                    {secondaryCtaLabel}
                  </Button>
                </MicroMotion>
              </div>
            </div>
          </Reveal>
        </Container>
      </div>

      {/* Welcome Section */}
      <Container className="py-12">
        <Reveal delay={0.08}>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              {t("welcome.title")}
            </h2>
            <p className="mt-6 text-center text-base leading-relaxed text-white/90 md:text-lg">
              {t("welcome.description")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <MicroMotion>
                <Button
                  href="/about"
                  variant="outline"
                  className="border-2 border-white/70 bg-transparent text-white hover:bg-white/10"
                >
                  {t("welcome.btn.about")}
                </Button>
              </MicroMotion>
              <MicroMotion>
                <Button
                  href="/leadership"
                  variant="outline"
                  className="border-2 border-white/70 bg-transparent text-white hover:bg-white/10"
                >
                  {t("welcome.btn.leadership")}
                </Button>
              </MicroMotion>
              <MicroMotion>
                <Button
                  href="/contact"
                  variant="outline"
                  className="border-2 border-white/70 bg-transparent text-white hover:bg-white/10"
                >
                  {t("welcome.btn.contact")}
                </Button>
              </MicroMotion>
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
