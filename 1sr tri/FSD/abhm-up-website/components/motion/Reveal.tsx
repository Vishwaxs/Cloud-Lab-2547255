"use client";

import { useRef } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/components/cn";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
}: Readonly<RevealProps>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      ref={ref}
      className={cn(className)}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y }}
      animate={
        reduceMotion || isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y }
      }
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </m.div>
  );
}
