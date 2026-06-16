import { getPublicSiteSettings } from "@/lib/site-settings/public";
import HeroAndWelcomeClient from "@/components/HeroAndWelcomeClient";

export default async function HeroAndWelcome() {
  const settings = await getPublicSiteSettings();
  return <HeroAndWelcomeClient heroOverride={settings?.hero ?? null} />;
}
