import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Quote, ChevronRight, Award, Trophy, Star,
  Shield, Medal, Monitor, Zap, Globe2,
} from 'lucide-react';
import { PageHero } from '@/components/elite/FootballPrimitives';
import PageLayout from '@/layout/PageLayout';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimelineEvent {
  year: string;
  title: string;
  era: 'foundations' | 'golden' | 'generation' | 'modern';
  description: string;
  details: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  statLabel?: string;
  statValue?: string;
}

// ─── Era config ───────────────────────────────────────────────────────────────
const ERAS = [
  { id: 'all',         label: 'Toutes les Époques', color: 'text-white' },
  { id: 'foundations', label: '1950–1970',           color: 'text-[#008751]' },
  { id: 'golden',      label: '1970–1990',           color: 'text-[#FCD116]' },
  { id: 'generation',  label: '1990–2010',           color: 'text-[#60A5FA]' },
  { id: 'modern',      label: '2010–Présent',        color: 'text-[#CE1126]' },
] as const;

type EraId = typeof ERAS[number]['id'];

const ERA_ACCENT: Record<string, string> = {
  foundations: '#008751',
  golden:      '#FCD116',
  generation:  '#60A5FA',
  modern:      '#CE1126',
};

// ─── Timeline data ─────────────────────────────────────────────────────────────
const TIMELINE_DATA: TimelineEvent[] = [
  {
    year: '1950', era: 'foundations', icon: Award,
    accentColor: '#008751',
    title: 'Naissance du Championnat National',
    description: "Les premières rencontres officielles s'organisent au Cameroun, jetant les bases d'une passion nationale qui va s'embraser sur toute la décennie.",
    details: ['Création des premiers clubs historiques', 'Développement des terrains municipaux', 'Structuration de la Fédération Camerounaise de Football'],
    statLabel: 'Clubs fondateurs', statValue: '8',
  },
  {
    year: '1972', era: 'golden', icon: Globe2,
    accentColor: '#FCD116',
    title: "La CAN à domicile",
    description: "Le Cameroun accueille sa première Coupe d'Afrique des Nations. Bien que la victoire finale échappe aux Lions, la ferveur est gravée dans le marbre de l'histoire.",
    details: ['Inauguration des stades de Yaoundé et Douala', 'Éclosion de la première génération de stars locales', "Cameroun 3e de la compétition"],
    statLabel: 'Stades inaugurés', statValue: '2',
  },
  {
    year: '1982', era: 'golden', icon: Star,
    accentColor: '#FCD116',
    title: "Le Premier Mondial Historique",
    description: "Menés par des joueurs légendaires issus du championnat national, les Lions Indomptables surprennent le monde entier en Espagne. Une révélation.",
    details: ["Match nul historique contre l'Italie, future championne du monde", "Révélation de Thomas N'Kono au monde entier", '6 points en phase de groupes sans défaite'],
    statLabel: 'Matchs sans défaite', statValue: '3',
  },
  {
    year: '1990', era: 'golden', icon: Trophy,
    accentColor: '#FCD116',
    title: "L'Épopée d'Italie & La Danse de Roger Milla",
    description: "Le Cameroun devient la première nation africaine à atteindre les quarts de finale de la Coupe du Monde. Un exploit mythique qui change à jamais le football mondial.",
    details: ["Victoire choc contre l'Argentine de Maradona en ouverture (1-0)", '4 buts légendaires de Roger Milla à 38 ans', 'Communion historique de tout un peuple uni derrière ses Lions'],
    statLabel: 'Buts de Milla', statValue: '4',
  },
  {
    year: '2000', era: 'generation', icon: Medal,
    accentColor: '#60A5FA',
    title: "Le Sacre Olympique de Sydney",
    description: "La génération dorée de Samuel Eto'o et Patrick Mboma décroche la médaille d'or olympique en Australie, affirmant la domination absolue du football camerounais en Afrique.",
    details: ["Victoire mémorable contre l'Espagne en finale aux tirs au but", "Double champion d'Afrique en titre (2000 & 2002)", "Naissance de la légende Samuel Eto'o sur la scène mondiale"],
    statLabel: 'Titre olympique', statValue: '🥇',
  },
  {
    year: '2017', era: 'generation', icon: Shield,
    accentColor: '#60A5FA',
    title: "5e Sacre Africain — CAN 2017",
    description: "Hugo Broos mène les Lions à leur cinquième titre continental au Gabon. Un triomphe collectif incroyable qui repousse toutes les attentes après une qualification difficile.",
    details: ['Victoire 2-1 contre l\'Égypte en finale', '5e titre de champion d\'Afrique pour le Cameroun', 'Vincent Aboubakar, héros de la finale'],
    statLabel: 'Titres africains', statValue: '5',
  },
  {
    year: '2021', era: 'modern', icon: Zap,
    accentColor: '#CE1126',
    title: "La CAN à Domicile — Un Pays en Fête",
    description: "Hôte de la 33e édition de la Coupe d'Afrique des Nations, le Cameroun investit massivement dans ses infrastructures et présente une compétition de prestige mondial.",
    details: ['Nouveaux stades ultra-modernes à Yaoundé, Douala, Garoua', '24 nations participantes, meilleure édition de l\'histoire', 'Record d\'affluence pour plusieurs rencontres'],
    statLabel: 'Nouveaux stades', statValue: '5',
  },
  {
    year: '2025', era: 'modern', icon: Monitor,
    accentColor: '#CE1126',
    title: "La Révolution Numérique de la MTN Elite One",
    description: "Modernisation complète de la ligue : professionnalisme intégral, données en temps réel, couverture internationale. La Elite One entre dans l'ère digitale.",
    details: ['Digitalisation complète avec la plateforme MTN Elite One', 'Statistiques en temps réel et suivi GPS des joueurs', 'Diffusion en streaming international des matchs'],
    statLabel: 'Clubs professionnels', statValue: '16',
  },
];

// ─── Timeline event card ───────────────────────────────────────────────────────
function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const Icon = event.icon;
  const isEven = index % 2 === 0;
  const accent = event.accentColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* ── Year node (desktop) ───────────────────────────────────── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:flex h-14 w-14 rounded-full border-2 items-center justify-center shrink-0 shadow-2xl"
        style={{
          background: `radial-gradient(circle, ${accent}22, #0a0a0a)`,
          borderColor: `${accent}60`,
          boxShadow: `0 0 24px ${accent}40`,
        }}
      >
        <span
          className="font-display font-black text-sm tabular-nums"
          style={{ color: accent }}
        >
          {event.year.slice(-2)}
        </span>
      </div>

      {/* ── Content card ──────────────────────────────────────────── */}
      <div className="w-full md:w-[44%] group">
        {/* Mobile year */}
        <div
          className="md:hidden inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest font-mono border"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}12` }}
        >
          <Icon className="h-3 w-3" /> {event.year}
        </div>

        <div
          className="rounded-2xl border bg-gradient-to-b from-white/[0.05] to-transparent p-6 sm:p-7 space-y-4 transition-all duration-400 hover:shadow-2xl"
          style={{ borderColor: `${accent}30` }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}70`;
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px ${accent}18`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}30`;
            (e.currentTarget as HTMLDivElement).style.boxShadow = '';
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
            >
              <Icon className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white leading-snug">
                {event.title}
              </h3>
              {event.statLabel && event.statValue && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>
                    {event.statLabel} :
                  </span>
                  <span className="font-display text-base font-black" style={{ color: accent }}>
                    {event.statValue}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed">{event.description}</p>

          {/* Details */}
          <ul className="space-y-1.5 pt-3 border-t" style={{ borderColor: `${accent}20` }}>
            {event.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground/70">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: accent }} />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Spacer */}
      <div className="hidden md:block w-[44%]" />
    </motion.div>
  );
}

// ─── Pulsing era label ─────────────────────────────────────────────────────────
function EraLabel({ text, color }: { text: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 py-4 md:justify-center"
    >
      <div className="flex-1 md:flex-none md:w-40 h-px" style={{ background: `${color}40` }} />
      <span
        className="text-[10px] font-black uppercase tracking-[0.22em] shrink-0"
        style={{ color }}
      >
        {text}
      </span>
      <div className="flex-1 md:flex-none md:w-40 h-px" style={{ background: `${color}40` }} />
    </motion.div>
  );
}

// ─── HistoryPage ───────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [selectedEra, setSelectedEra] = useState<EraId>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Group events by era for labelled sections
  const filteredEvents = selectedEra === 'all'
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter(e => e.era === selectedEra);

  // Determine which era labels to show
  const showEraLabels = selectedEra === 'all';
  let lastEra = '';

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Histoire"
        title="Musée du Football"
        subtitle="Un voyage immersif à travers la légende et l'histoire des Lions Indomptables"
        accentColor="red"
      />

      {/* ── Cameroun flag accent bar ─────────────────────────────────────── */}
      <div className="h-[3px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />

      {/* ── Era Navigation ───────────────────────────────────────────────── */}
      <div className="border-b border-border/40 sticky top-[62px] bg-background/95 backdrop-blur-xl z-20">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {ERAS.map(era => {
              const active = selectedEra === era.id;
              const accent = era.id === 'all' ? '#ffffff' : ERA_ACCENT[era.id] ?? '#ffffff';
              return (
                <button
                  key={era.id}
                  id={`era-${era.id}`}
                  onClick={() => setSelectedEra(era.id as EraId)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 border ${
                    active ? 'text-black' : 'bg-white/[0.02] border-border/40 hover:bg-white/[0.05]'
                  }`}
                  style={active
                    ? { background: accent, borderColor: accent, boxShadow: `0 0 16px ${accent}50` }
                    : { color: accent }}
                >
                  {era.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <div className="container py-14 relative" ref={containerRef}>

        {/* Animated centre line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 hidden md:block w-px overflow-hidden">
          <motion.div
            className="w-full h-full origin-top"
            style={{
              scaleY: lineScaleY,
              background: 'linear-gradient(to bottom, #008751, #FCD116, #CE1126)',
              opacity: 0.25,
            }}
          />
        </div>

        <div className="space-y-14">
          {filteredEvents.map((event, idx) => {
            const showLabel = showEraLabels && event.era !== lastEra;
            if (showLabel) lastEra = event.era;
            const eraConf = ERAS.find(e => e.id === event.era);
            const accentCol = ERA_ACCENT[event.era] ?? '#FCD116';

            return (
              <div key={`${event.year}-${event.title}`}>
                {showLabel && eraConf && (
                  <EraLabel text={eraConf.label} color={accentCol} />
                )}
                <TimelineCard event={event} index={idx} />
              </div>
            );
          })}
        </div>

        {/* ── Closing quote ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-2xl mx-auto rounded-3xl border border-[#FCD116]/20 bg-black/70 p-10 text-center space-y-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(252,209,22,0.06),transparent_65%)] pointer-events-none" />
          {/* Cameroun tricolour */}
          <div className="flex justify-center gap-2 mb-2">
            {['#008751', '#FCD116', '#CE1126'].map(c => (
              <div key={c} className="h-1 w-8 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <Quote className="h-8 w-8 text-[#FCD116] mx-auto opacity-50" />
          <p className="font-display text-xl italic text-white/90 leading-relaxed">
            &ldquo;Le football au Cameroun n&apos;est pas seulement un sport, c&apos;est une religion,
            un ciment social qui unit le pays tout entier sous le même drapeau tricolore.&rdquo;
          </p>
          <div className="text-xs text-muted-foreground/50 uppercase tracking-widest font-bold font-mono">
            — Légende du Football Camerounais
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
