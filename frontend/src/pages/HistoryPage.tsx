import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote, ChevronRight, Award, Trophy, Star, Shield, Medal, Monitor } from 'lucide-react';
import { PageHero } from '@/components/elite/FootballPrimitives';
import PageLayout from '@/layout/PageLayout';

interface TimelineEvent {
  year: string;
  title: string;
  era: string;
  description: string;
  details: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const ERAS = [
  { id: 'all',         label: 'Toutes les Époques' },
  { id: 'foundations', label: '1950–1970'           },
  { id: 'golden',      label: '1970–1990'           },
  { id: 'generation',  label: '1990–2010'           },
  { id: 'modern',      label: '2010–Présent'        },
] as const;

const TIMELINE_DATA: TimelineEvent[] = [
  {
    year: '1950',
    era: 'foundations',
    title: 'Création du premier championnat local',
    description: "Les premières rencontres officielles s'organisent au Cameroun, jetant les bases d'une passion nationale qui va s'embraser.",
    details: ['Naissance des clubs historiques', 'Développement des terrains municipaux', 'Structuration de la fédération'],
    icon: Award,
  },
  {
    year: '1972',
    era: 'golden',
    title: "La Coupe d'Afrique à domicile",
    description: "Le Cameroun accueille sa première Coupe d'Afrique des Nations. Bien que la victoire finale échappe aux Lions, la ferveur est scellée.",
    details: ['Inauguration des stades de Yaoundé et Douala', 'Éclosion de la première génération de stars locales'],
    icon: Shield,
  },
  {
    year: '1982',
    era: 'golden',
    title: 'Première Coupe du Monde historique',
    description: "Menés par des joueurs légendaires issus du championnat national, les Lions Indomptables surprennent le monde en restant invaincus en Espagne.",
    details: ["Match nul mémorable contre l'Italie future championne", "Révélation de Thomas N'Kono au monde entier"],
    icon: Star,
  },
  {
    year: '1990',
    era: 'golden',
    title: "L'Épopée Mondiale & La Danse de Roger Milla",
    description: "Le Cameroun devient la première nation africaine à atteindre les quarts de finale du Mondial en Italie. Un exploit mythique qui change le football mondial.",
    details: ["Victoire contre l'Argentine de Maradona en ouverture", '4 buts légendaires de Roger Milla à 38 ans', 'Communion historique de tout un peuple'],
    icon: Trophy,
  },
  {
    year: '2000',
    era: 'generation',
    title: 'Le Sacre Olympique de Sydney',
    description: "La génération dorée de Samuel Eto'o et Patrick Mboma décroche la médaille d'or olympique en Australie, affirmant la domination du football camerounais.",
    details: ["Victoire mémorable contre l'Espagne en finale", 'Double champion d\'Afrique en titre (2000 & 2002)'],
    icon: Medal,
  },
  {
    year: '2021',
    era: 'modern',
    title: "La Rénovation de l'Elite One",
    description: "Modernisation des infrastructures de la ligue, introduction du professionnalisme intégral et digitalisation complète du suivi des matches.",
    details: ['Nouveaux stades ultra-modernes', 'Amélioration de la couverture télévisuelle', 'Lancement de la plateforme MTN Elite One'],
    icon: Monitor,
  },
];

export default function HistoryPage() {
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredEvents = selectedEra === 'all'
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter(e => e.era === selectedEra);

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Musée"
        title="Musée du Football"
        subtitle="Un voyage immersif à travers la légende et l'histoire des Lions Indomptables"
        accentColor="red"
      />

      {/* ─── Era Navigation ─────────────────────────────────────── */}
      <div className="border-b border-border/40 sticky top-[62px] bg-background/95 backdrop-blur-xl z-20">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {ERAS.map(era => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  selectedEra === era.id
                    ? 'bg-[#CE1126] text-white shadow-[0_0_16px_rgba(206,17,38,0.35)]'
                    : 'bg-white/[0.02] text-muted-foreground border border-border/40 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {era.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Chronological Vertical Timeline ────────────────────── */}
      <div className="container py-14 relative" ref={containerRef}>
        {/* Centre line (desktop only) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-[#CE1126] to-[#008751] -translate-x-1/2 hidden md:block opacity-30" />

        <div className="space-y-16">
          {filteredEvents.map((event, idx) => {
            const isEven = idx % 2 === 0;
            const Icon = event.icon;

            return (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`relative flex flex-col md:flex-row items-center justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Year marker — desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-surface-elevated border-2 border-border/60 flex items-center justify-center font-display font-black text-sm text-accent shadow-xl z-10 hidden md:flex">
                  {event.year.slice(-2)}
                </div>

                {/* Content card */}
                <div className="w-full md:w-[45%] rounded-3xl border border-border/50 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8 space-y-4 hover:border-white/20 transition-all duration-300 shadow-xl">
                  {/* Mobile year badge */}
                  <span className="md:hidden inline-block text-xs font-black px-2.5 py-1 rounded-full bg-accent/15 text-accent uppercase tracking-widest font-mono mb-2">
                    {event.year}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white leading-tight">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-sm text-white/65 leading-relaxed pt-1">
                    {event.description}
                  </p>

                  <ul className="space-y-1.5 pt-3 border-t border-border/30">
                    {event.details.map((detail, dIdx) => (
                      <li key={dIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacer for desktop alternating layout */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            );
          })}
        </div>

        {/* ─── Closing quote block ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 max-w-2xl mx-auto rounded-3xl border border-[#FCD116]/20 bg-black/60 p-8 text-center space-y-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(252,209,22,0.05),transparent_60%)] pointer-events-none" />
          <Quote className="h-8 w-8 text-accent mx-auto opacity-40" />
          <p className="font-display text-lg italic text-white/90 leading-relaxed">
            &ldquo;Le football au Cameroun n&apos;est pas seulement un sport, c&apos;est une religion,
            un ciment social qui unit le pays tout entier sous le même drapeau tricolore.&rdquo;
          </p>
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            — Légende du Football Camerounais
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
