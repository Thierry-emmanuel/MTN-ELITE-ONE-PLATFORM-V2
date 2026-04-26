import { ArrowRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  cta?: string;
  ctaHref?: string;
  className?: string;
}

export const SectionHeader = ({ eyebrow, title, cta, ctaHref = "#", className = "" }: Props) => (
  <div className={`flex items-end justify-between gap-4 mb-6 ${className}`}>
    <div>
      {eyebrow && (
        <div className="flex items-center gap-2.5 mb-2.5">
          {/* Animated accent bar */}
          <div className="relative h-px w-10 overflow-hidden">
            <div className="absolute inset-0 bg-accent" />
            <div className="absolute inset-0 bg-white/60 animate-[ticker_2s_ease-in-out_infinite]" />
          </div>
          <span className="text-[11px] uppercase tracking-[.25em] text-accent font-semibold">{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight leading-tight">{title}</h2>
    </div>
    {cta && (
      <a
        href={ctaHref}
        className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors group shrink-0"
      >
        {cta}
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </a>
    )}
  </div>
);