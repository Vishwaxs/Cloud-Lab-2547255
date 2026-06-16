import Container from "./Container";

export default function PageTitle({
  title,
  subtitle,
  tone = "light",
}: Readonly<{ title: string; subtitle?: string; tone?: "light" | "dark" }>) {
  const isDark = tone === "dark";

  return (
    <div>
      <Container className="py-10">
        <div className="max-w-3xl">
          <div
            className={
              isDark
                ? "inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-black/80"
                : "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm"
            }
          >
            <span
              className={
                isDark
                  ? "h-2 w-2 rounded-full bg-(--abhm-deep-red)"
                  : "h-2 w-2 rounded-full bg-white/80"
              }
            />
            Official Update
          </div>
          <h1
            className={
              isDark
                ? "mt-4 text-3xl font-semibold tracking-tight text-black md:text-4xl"
                : "mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl"
            }
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={
                isDark
                  ? "mt-3 text-base leading-relaxed text-black/70"
                  : "mt-3 text-base leading-relaxed text-white/85"
              }
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
