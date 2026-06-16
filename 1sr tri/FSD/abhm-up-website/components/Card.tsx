import { cn } from "./cn";

export default function Card({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={cn("rounded-xl border p-5", className)}>
      {children}
    </div>
  );
}
