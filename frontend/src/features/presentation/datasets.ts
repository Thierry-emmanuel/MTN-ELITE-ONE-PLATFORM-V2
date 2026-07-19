/**
 * Dataset adapters — how a module joins the Presentation Engine: one small
 * mapping function from its EXISTING backend response to the Dataset
 * contract. Zero recomputation (points, scores, ranks arrive backend-made);
 * branding flows from the Phase-5 competition/season configuration.
 */
import type { Dataset, DatasetBranding } from './engine';
import type { MatchRow, ScorerRow, StandingRow } from '@/features/intelligence/intelligence.api';
import { nameOf } from '@/features/intelligence/engine';

export function standingsDataset(rows: StandingRow[], branding: DatasetBranding): Dataset {
  return {
    id: `classement-${branding.seasonName ?? 'saison'}`.toLowerCase().replace(/\s+/g, '-'),
    title: 'Classement',
    subtitle: 'Points, différence et forme — calculés par le moteur officiel',
    branding,
    columns: [
      { key: 'position', label: '#', align: 'left' },
      { key: 'club', label: 'Club' },
      { key: 'played', label: 'J', align: 'right' },
      { key: 'points', label: 'Pts', align: 'right' },
      { key: 'gd', label: 'Diff', align: 'right' },
      { key: 'form', label: 'Forme', align: 'right' },
    ],
    rows: rows.map((s) => ({
      position: s.position,
      club: s.club?.name ?? `Club ${s.clubId}`,
      played: s.played,
      points: s.points,
      gd: s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference,
      form: (s.formGuide ?? []).slice(-5).join(' '),
    })),
    emphasize: (_r, i) => (i === 0 ? 'top' : i >= rows.length - 3 ? 'bottom' : undefined),
  };
}

export function fixturesDataset(matches: MatchRow[], branding: DatasetBranding): Dataset {
  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return {
    id: `calendrier-${branding.matchday ? `j${branding.matchday}` : 'saison'}`,
    title: 'Calendrier',
    subtitle: 'Prochaines affiches officielles',
    branding,
    columns: [
      { key: 'round', label: 'J', align: 'left' },
      { key: 'fixture', label: 'Affiche' },
      { key: 'date', label: 'Date', align: 'right' },
      { key: 'time', label: 'Heure', align: 'right' },
    ],
    rows: upcoming.map((m) => {
      const d = new Date(m.scheduledAt);
      return {
        round: m.round,
        fixture: `${m.homeClub?.name ?? '?'} — ${m.awayClub?.name ?? '?'}`,
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
    }),
  };
}

export function resultsDataset(matches: MatchRow[], branding: DatasetBranding): Dataset {
  const done = matches
    .filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  return {
    id: `resultats-${branding.matchday ? `j${branding.matchday}` : 'saison'}`,
    title: 'Résultats',
    subtitle: 'Scores officiels — moteur de match FootballOS',
    branding,
    columns: [
      { key: 'round', label: 'J', align: 'left' },
      { key: 'home', label: 'Domicile' },
      { key: 'score', label: 'Score', align: 'center' },
      { key: 'away', label: 'Extérieur' },
    ],
    rows: done.map((m) => ({
      round: m.round,
      home: m.homeClub?.name ?? '?',
      score: `${m.homeScore ?? '–'} : ${m.awayScore ?? '–'}`,
      away: m.awayClub?.name ?? '?',
    })),
  };
}

export function scorersDataset(rows: ScorerRow[], branding: DatasetBranding): Dataset {
  return {
    id: 'buteurs',
    title: "Course au Soulier d'or",
    branding,
    columns: [
      { key: 'rank', label: '#', align: 'left' },
      { key: 'player', label: 'Joueur' },
      { key: 'club', label: 'Club' },
      { key: 'goals', label: 'Buts', align: 'right' },
    ],
    rows: rows.map((s, i) => ({ rank: i + 1, player: nameOf(s), club: s.clubName ?? s.club?.name ?? '', goals: s.goals ?? 0 })),
    emphasize: (_r, i) => (i === 0 ? 'top' : undefined),
  };
}
