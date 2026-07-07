import { memo } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// ─── Reveal-on-scroll wrapper ───────────────────────────────────────────────────

export const Reveal = memo(({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
));
Reveal.displayName = 'Reveal';

// ─── Museum wing heading — "Salle 0X" gallery-room numbering ───────────────────

interface SectionHeadingProps {
  icon: LucideIcon;
  room: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  action?: React.ReactNode;
}

export const SectionHeading = memo(({ icon: Icon, room, title, subtitle, accentColor = '#FCD116', action }: SectionHeadingProps) => (
  <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} />
        <span className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: accentColor }}>{room}</span>
      </div>
      <h2 className="font-serif italic text-3xl lg:text-4xl text-white leading-tight tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-white/50 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
    {action}
  </div>
));
SectionHeading.displayName = 'SectionHeading';

// ─── Vitrine — the museum's glass display-case panel ───────────────────────────

interface VitrinePanelProps {
  className?: string;
  children: React.ReactNode;
  accentColor?: string;
}

export const VitrinePanel = memo(({ className = '', children, accentColor }: VitrinePanelProps) => (
  <div
    className={`border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors duration-300 ${className}`}
    style={accentColor ? { borderTopColor: `${accentColor}55`, borderTopWidth: 2 } : undefined}
  >
    {children}
  </div>
));
VitrinePanel.displayName = 'VitrinePanel';

// ─── Section shell — consistent vertical rhythm, "corridor" tone, anchor id ────

interface ClubSectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  tone?: 'default' | 'corridor';
}

export const ClubSection = memo(({ id, className = '', children, tone = 'default' }: ClubSectionProps) => (
  <section
    id={id}
    className={`scroll-mt-32 py-14 lg:py-20 border-b border-white/5 ${className}`}
    style={tone === 'corridor' ? { background: 'linear-gradient(180deg, #06090a, #0a0f0d)' } : { background: '#06090a' }}
  >
    <div className="container">{children}</div>
  </section>
));
ClubSection.displayName = 'ClubSection';
