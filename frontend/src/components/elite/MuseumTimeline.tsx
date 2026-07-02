import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Award, Trophy, Star, Shield, Medal, Monitor, Zap, Globe2 } from 'lucide-react';

interface TimelineEvent {
  year: string; title: string; era: 'foundations' | 'golden' | 'generation' | 'modern';
  description: string; details: string[]; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  statLabel?: string; statValue?: string;
}

const ERAS = [
  { id: 'all',         label: 'Toutes les Époques', color: '#FCD116' },
  { id: 'foundations', label: '1950–1970',           color: '#008751' },
  { id: 'golden',      label: '1970–1990',           color: '#FCD116' },
  { id: 'generation',  label: '1990–2010',           color: '#60A5FA' },
  { id: 'modern',      label: '2010–Présent',        color: '#CE1126' },
] as const;

type EraId = typeof ERAS[number]['id'];
const ERA_ACCENT: Record<string, string> = { foundations: '#008751', golden: '#FCD116', generation: '#60A5FA', modern: '#CE1126' };

const TIMELINE_DATA: TimelineEvent[] = [
  { year: '1950', era: 'foundations', icon: Award, title: 'Naissance du Championnat National',
    description: "Les premières rencontres officielles s'organisent au Cameroun, jetant les bases d'une passion nationale.",
    details: ['Création des premiers clubs historiques', 'Développement des terrains municipaux', 'Structuration de la Fédération Camerounaise'], statLabel: 'Clubs fondateurs', statValue: '8' },
  { year: '1972', era: 'golden', icon: Globe2, title: 'La CAN à domicile',
    description: "Le Cameroun accueille sa première Coupe d'Afrique des Nations. La ferveur est gravée dans le marbre de l'histoire.",
    details: ['Inauguration des stades de Yaoundé et Douala', "Éclosion de la première génération de stars locales", 'Cameroun 3e de la compétition'], statLabel: 'Stades inaugurés', statValue: '2' },
  { year: '1982', era: 'golden', icon: Star, title: 'Le Premier Mondial Historique',
    description: "Menés par des joueurs légendaires du championnat national, les Lions surprennent le monde entier en Espagne.",
    details: ["Match nul contre l'Italie, future championne du monde", "Révélation de Thomas N'Kono au monde", 'Invaincus en phase de groupes'], statLabel: 'Matchs sans défaite', statValue: '3' },
  { year: '1990', era: 'golden', icon: Trophy, title: "L'Épopée d'Italie & la danse de Roger Milla",
    description: "Le Cameroun devient la première nation africaine en quarts de finale de Coupe du Monde. Un exploit mythique.",
    details: ["Victoire choc contre l'Argentine (1-0)", '4 buts légendaires de Roger Milla à 38 ans', 'Communion historique de tout un peuple'], statLabel: 'Buts de Milla', statValue: '4' },
  { year: '2000', era: 'generation', icon: Medal, title: 'Le Sacre Olympique de Sydney',
    description: "La génération dorée décroche la médaille d'or olympique, affirmant la domination du football camerounais en Afrique.",
    details: ["Victoire contre l'Espagne aux tirs au but", "Double champion d'Afrique en titre", 'Une génération entrée dans la légende'], statLabel: 'Titre olympique', statValue: '🥇' },
  { year: '2017', era: 'generation', icon: Shield, title: '5e Sacre Africain — CAN 2017',
    description: "Les Lions décrochent leur cinquième titre continental au Gabon, un triomphe collectif inattendu.",
    details: ["Victoire 2-1 contre l'Égypte en finale", "5e titre de champion d'Afrique", 'Vincent Aboubakar, héros de la finale'], statLabel: 'Titres africains', statValue: '5' },
  { year: '2021', era: 'modern', icon: Zap, title: 'La CAN à Domicile',
    description: "Hôte de la 33e édition, le Cameroun investit dans ses infrastructures pour une compétition de prestige.",
    details: ['Nouveaux stades à Yaoundé, Douala, Garoua', '24 nations participantes', "Record d'affluence pour plusieurs rencontres"], statLabel: 'Nouveaux stades', statValue: '5' },
  { year: '2025', era: 'modern', icon: Monitor, title: 'La Révolution Numérique',
    description: "Modernisation complète de la ligue : professionnalisme, données en temps réel, couverture internationale.",
    details: ['Digitalisation avec la plateforme MTN Elite One', 'Statistiques en temps réel', 'Diffusion en streaming international'], statLabel: 'Clubs professionnels', statValue: '16' },
];

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const Icon = event.icon;
  const accent = ERA_ACCENT[event.era];
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col md:flex-row items-center gap-5 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:flex h-12 w-12 rounded-full border items-center justify-center shrink-0"
        style={{ background: `radial-gradient(circle, ${accent}18, #06090a)`, borderColor: `${accent}55` }}>
        <span className="font-serif italic text-xs" style={{ color: accent }}>{event.year.slice(-2)}</span>
      </div>
      <div className="w-full md:w-[44%] group">
        <div className="md:hidden inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
          <Icon className="h-3 w-3" /> {event.year}
        </div>
        <div className="border p-6 space-y-3 transition-colors duration-400" style={{ borderColor: `${accent}25`, background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 flex items-center justify-center shrink-0" style={{ background: `${accent}14`, border: `1px solid ${accent}35` }}>
              <Icon className="h-4 w-4" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-serif italic text-[11px] text-white/40 mb-0.5">{event.year}</p>
              <h3 className="font-display text-lg text-white leading-snug">{event.title}</h3>
            </div>
            {event.statValue && (
              <span className="ml-auto font-display text-base font-black shrink-0" style={{ color: accent }}>{event.statValue}</span>
            )}
          </div>
          <p className="text-sm text-white/55 leading-relaxed">{event.description}</p>
          <ul className="space-y-1.5 pt-3 border-t" style={{ borderColor: `${accent}18` }}>
            {event.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground/70">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: accent }} />{d}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="hidden md:block w-[44%]" />
    </motion.div>
  );
}

export const MuseumTimeline = () => {
  const [selectedEra, setSelectedEra] = useState<EraId>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const filtered = selectedEra === 'all' ? TIMELINE_DATA : TIMELINE_DATA.filter(e => e.era === selectedEra);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-10 -mx-1 px-1">
        {ERAS.map(era => {
          const active = selectedEra === era.id;
          return (
            <button key={era.id} onClick={() => setSelectedEra(era.id as EraId)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shrink-0 border"
              style={active ? { background: era.color, borderColor: era.color, color: '#06090a' } : { color: era.color, borderColor: `${era.color}35` }}>
              {era.label}
            </button>
          );
        })}
      </div>

      <div className="relative" ref={containerRef}>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 hidden md:block w-px overflow-hidden">
          <motion.div className="w-full h-full origin-top" style={{ scaleY: lineScaleY, background: 'linear-gradient(to bottom, #008751, #FCD116, #CE1126)', opacity: 0.3 }} />
        </div>
        <div className="space-y-12">
          {filtered.map((event, idx) => <TimelineCard key={`${event.year}-${event.title}`} event={event} index={idx} />)}
        </div>
      </div>
    </div>
  );
};
