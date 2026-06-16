"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DownloadsSection() {
  const { t } = useLanguage();

  return (
    <Container className="py-12">
      <Card className="group bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("downloads.title")}</h3>
            <p className="mt-1 text-sm opacity-90">{t("downloads.subtitle")}</p>
          </div>
          <Button href="/documents" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 transition-all duration-300 hover:scale-105">
            {t("downloads.btn")}
          </Button>
        </div>
      </Card>
    </Container>
  );
}
