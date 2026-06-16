"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import MotionProvider from "@/components/motion/MotionProvider";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LanguageProvider>
      <MotionProvider>{children}</MotionProvider>
    </LanguageProvider>
  );
}
