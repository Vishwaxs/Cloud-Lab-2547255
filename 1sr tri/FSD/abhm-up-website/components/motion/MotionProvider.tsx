"use client";

import { LazyMotion, domAnimation } from "framer-motion";

export default function MotionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
