import { ArrowRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  cta?: string;
  className?: string;
}
export const SectionHeader = ({ eyebrow, title, cta, className = "" }: Props) => (
  <div className={`flex items-end justify-between gap-4 mb-6 ${className}`}>
    <div>
      {eyebrow && (
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-8 bg-accent" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-accent font-medium">{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight">{title}</h2>
    </div>
    {cta && (
      <a href="#" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors group">
        {cta}
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </a>
    )}
  </div>
);
