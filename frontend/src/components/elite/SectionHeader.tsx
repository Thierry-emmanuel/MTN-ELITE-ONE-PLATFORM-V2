import { ArrowRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  cta?: string;
  ctaHref?: string;
  className?: string;
  size?: "default" | "compact";
  /** Align eyebrow + title center instead of left */
  center?: boolean;
}

export const SectionHeader = ({
  eyebrow,
  title,
  cta,
  ctaHref = "#",
  className = "",
  size = "default",
  center = false,
}: Props) => (
  <div
    className={`flex ${
      center ? "flex-col items-center text-center" : "items-end justify-between"
    } gap-4 ${size === "compact" ? "mb-5" : "mb-7"} ${className}`}
  >
    <div className={center ? "flex flex-col items-center" : ""}>
      {eyebrow && (
        <div className={`flex items-center gap-2 mb-2 ${center ? "justify-center" : ""}`}>
          {/* Animated accent bar */}
          <div className="relative h-px w-8 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-accent" />
            <div
              className="absolute inset-0 bg-white/60"
              style={{ animation: "ticker 2.4s ease-in-out infinite" }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[.28em] text-accent font-semibold">
            {eyebrow}
          </span>
        </div>
      )}
      <h2
        className={
          size === "compact"
            ? "font-display text-xl md:text-2xl uppercase tracking-tight leading-tight"
            : "font-display text-2xl md:text-3xl uppercase tracking-tight leading-tight"
        }
      >
        {title}
      </h2>
    </div>

    {cta && !center && (
      <a
        href={ctaHref}
        className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group shrink-0 pb-0.5"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </a>
    )}
  </div>
);