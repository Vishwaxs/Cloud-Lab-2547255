"use client";

import { m, useReducedMotion } from "framer-motion";

export default function MicroMotion({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
