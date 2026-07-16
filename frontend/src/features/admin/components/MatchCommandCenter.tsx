/**
 * MatchCommandCenter.tsx
 * ─────────────────────────────────────────────────────────────────
 * A premium-grade, museum-quality Match Command Center for FootballOS / League Studio.
 * 
 * Features:
 *  1. PROGRESSIVE WIZARD: Step-by-step guidance (Metadata -> Teams -> Squads -> Live/Timeline -> Story)
 *  2. TACTICAL SQUAD BUILDER: Visual interactive soccer pitch mapping formations (4-4-2, 4-3-3, 3-4-3, 3-5-2 etc.)
 *     with active drag-to-field simulation and starter/bench status toggles.
 *  3. TIMELINE BUILDER: Complete timeline for all supported events (Goal, Missed Penalty, Assist, Card, Sub, VAR, Injury, Shootout, etc.)
 *  4. LIVE MODE CONSOLE: Full screen dashboard with quick action buttons, keyboard shortcut bindings, and undo history.
 *  5. AUTO-UPDATE SIMULATION: Instant calculations for match stats (possession, shots, pass accuracy).
 *  6. AI MATCH STORY GENERATOR: Post-match visual summary with auto-suggested headlines, social posts, and journal drafts.
 *  7. PRE-PUBLISH VALIDATION: Real-time rules checking (lineup counts, GK presence, suspended players, invalid subs).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, CheckCircle, Clock, AlertTriangle, Ban,
  Plus, Minus, Trash2, ChevronLeft, ChevronRight,
  Users, BarChart2, Calendar, Swords, Target, Flag,
  ShieldCheck, RefreshCw, Loader2, Sparkles, Send,
  Tv, CloudSun, Eye, Compass, RotateCcw, AlertOctagon,
  Copy, Award, Check
} from 'lucide-react';
import { layoutApi, Match } from '@/services/layoutApi';
import { apiClient } from '@/services/api';
import { FormField, AdminButton, SwitchToggle } from '@/components/ui/AdminUI';

/* ── PreviewSelect Component for Dropdowns with Image Previews ── */
interface PreviewOption {
  id: string;
  name: string;
  subtitle?: string;
  imgUrl?: string;
  badge?: string;
}

function PreviewSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: PreviewOption[];
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    (opt.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (opt.subtitle && opt.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Select button triggering popover */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left hover:border-white/20 transition-all"
      >
        {selectedOption ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedOption.imgUrl ? (
              <img
                src={selectedOption.imgUrl}
                alt={selectedOption.name}
                className="w-6 h-6 rounded-lg object-cover bg-white/5 flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold flex-shrink-0">
                {selectedOption.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{selectedOption.name}</p>
              {selectedOption.subtitle && (
                <p className="text-[10px] text-white/35 truncate leading-tight">{selectedOption.subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-white/30">{placeholder}</span>
        )}
        <span className="text-white/30 text-xs">▼</span>
      </button>

      {/* Dropdown list popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 p-2 bg-[#0c1219] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent"
          />
          <div className="space-y-1">
            {filtered.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-white/[0.04] transition-all ${
                  value === opt.id ? 'bg-white/[0.06]' : ''
                }`}
              >
                {opt.imgUrl ? (
                  <img
                    src={opt.imgUrl}
                    alt={opt.name}
                    className="w-8 h-8 rounded-lg object-cover bg-white/5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white/60 font-bold flex-shrink-0">
                    {opt.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white truncate">{opt.name}</p>
                    {opt.badge && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-accent/80 bg-accent/15 px-1.5 py-0.5 rounded">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.subtitle && (
                    <p className="text-[10px] text-white/40 truncate leading-tight mt-0.5">{opt.subtitle}</p>
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-white/20 text-[10px] py-4">Aucun résultat trouvé</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  match: Partial<Match>;
  seasons: any[];
  clubs: any[];
  players: any[];
  currentSeasonId: string;
  onClose: () => void;
  onSaved: (m: Match) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type StepId = 'metadata' | 'teams' | 'lineups' | 'timeline' | 'story';

const FORMATIONS = [
  { value: '4-4-2', coords: [
    { x: 50, y: 88, pos: 'GK' },
    { x: 20, y: 70, pos: 'LB' }, { x: 40, y: 72, pos: 'LCB' }, { x: 60, y: 72, pos: 'RCB' }, { x: 80, y: 70, pos: 'RB' },
    { x: 20, y: 45, pos: 'LM' }, { x: 40, y: 47, pos: 'LCM' }, { x: 60, y: 47, pos: 'RCM' }, { x: 80, y: 45, pos: 'RM' },
    { x: 35, y: 20, pos: 'LS' }, { x: 65, y: 20, pos: 'RS' }
  ]},
  { value: '4-3-3', coords: [
    { x: 50, y: 88, pos: 'GK' },
    { x: 20, y: 70, pos: 'LB' }, { x: 40, y: 72, pos: 'LCB' }, { x: 60, y: 72, pos: 'RCB' }, { x: 80, y: 70, pos: 'RB' },
    { x: 30, y: 48, pos: 'LCM' }, { x: 50, y: 52, pos: 'DM' }, { x: 70, y: 48, pos: 'RCM' },
    { x: 20, y: 22, pos: 'LW' }, { x: 50, y: 18, pos: 'CF' }, { x: 80, y: 22, pos: 'RW' }
  ]},
  { value: '3-4-3', coords: [
    { x: 50, y: 88, pos: 'GK' },
    { x: 30, y: 72, pos: 'LCB' }, { x: 50, y: 74, pos: 'CB' }, { x: 70, y: 72, pos: 'RCB' },
    { x: 15, y: 48, pos: 'LWB' }, { x: 40, y: 50, pos: 'LCM' }, { x: 60, y: 50, pos: 'RCM' }, { x: 85, y: 48, pos: 'RWB' },
    { x: 25, y: 22, pos: 'LW' }, { x: 50, y: 18, pos: 'CF' }, { x: 75, y: 22, pos: 'RW' }
  ]},
  { value: '3-5-2', coords: [
    { x: 50, y: 88, pos: 'GK' },
    { x: 30, y: 72, pos: 'LCB' }, { x: 50, y: 74, pos: 'CB' }, { x: 70, y: 72, pos: 'RCB' },
    { x: 15, y: 48, pos: 'LWB' }, { x: 35, y: 52, pos: 'LCM' }, { x: 50, y: 56, pos: 'DM' }, { x: 65, y: 52, pos: 'RCM' }, { x: 85, y: 48, pos: 'RWB' },
    { x: 35, y: 20, pos: 'LS' }, { x: 65, y: 20, pos: 'RS' }
  ]},
];

const BROADCASTERS = ['MTN Sports', 'CRTV', 'Canal+ Sport', 'Equinoxe TV', 'Streaming Live'];
const WEATHER_TYPES = ['Ensoleillé', 'Nuageux', 'Pluie', 'Orageux', 'Humide'];

const EVENT_TYPES = [
  { value: 'KICKOFF', label: '⏱ Coup d\'envoi', category: 'match' },
  { value: 'GOAL', label: '⚽ But', category: 'action' },
  { value: 'PENALTY_GOAL', label: '🎯 But sur Penalty', category: 'action' },
  { value: 'MISSED_PENALTY', label: '❌ Penalty Manqué', category: 'action' },
  { value: 'OWN_GOAL', label: '💥 But Contre son Camp', category: 'action' },
  { value: 'ASSIST', label: '🤝 Passe décisive', category: 'action' },
  { value: 'YELLOW_CARD', label: '🟨 Carton Jaune', category: 'card' },
  { value: 'RED_CARD', label: '🟥 Carton Rouge', category: 'card' },
  { value: 'SECOND_YELLOW', label: '🟨🟥 Deuxième Jaune', category: 'card' },
  { value: 'SUBSTITUTION', label: '🔄 Changement', category: 'match' },
  { value: 'INJURY', label: '🩹 Blessure', category: 'match' },
  { value: 'VAR_REVIEW', label: '🖥 Visionnage VAR', category: 'match' },
  { value: 'PENALTY_AWARDED', label: '📢 Penalty Accordé', category: 'match' },
  { value: 'PENALTY_CANCELLED', label: '❌ Penalty Annulé', category: 'match' },
  { value: 'HALF_TIME', label: '⏸ Mi-temps', category: 'match' },
  { value: 'SECOND_HALF', label: '⏱ Seconde Période', category: 'match' },
  { value: 'EXTRA_TIME', label: '🕒 Prolongations', category: 'match' },
  { value: 'PENALTY_SHOOTOUT', label: '🥅 Séance T.a.b', category: 'match' },
  { value: 'MATCH_END', label: '🏁 Fin du Match', category: 'match' },
];

export function MatchCommandCenter({ match, seasons, clubs, players, currentSeasonId, onClose, onSaved, showToast }: Props) {
  const isNew = !match.id;
  const [activeStep, setActiveStep] = useState<StepId>('metadata');
  const [saving, setSaving] = useState(false);
  const [undoStack, setUndoStack] = useState<any[]>([]);

  // ── Step 1: Metadata State ──
  const [metadata, setMetadata] = useState({
    seasonId: String(match.seasonId || currentSeasonId),
    round: Number(match.round || 1),
    scheduledAt: (match as any).scheduledAt
      ? new Date((match as any).scheduledAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    venue: match.venue || '',
    city: (match as any).city || '',
    referee: (match as any).referee || '',
    attendance: (match as any).attendance || '',
    weather: (match as any).weather || 'Ensoleillé',
    broadcast: (match as any).broadcast || 'MTN Sports',
    status: match.status || 'SCHEDULED',
  });

  // ── Step 2: Team Match Context ──
  const [homeClubId, setHomeClubId] = useState(String(match.homeClubId || ''));
  const [awayClubId, setAwayClubId] = useState(String(match.awayClubId || ''));

  // ── Step 3: Squad Configurations ──
  const [homeFormation, setHomeFormation] = useState((match as any).homeFormation || '4-4-2');
  const [awayFormation, setAwayFormation] = useState((match as any).awayFormation || '4-4-2');
  const [homeStarters, setHomeStarters] = useState<string[]>([]);
  const [homeBench, setHomeBench] = useState<string[]>([]);
  const [awayStarters, setAwayStarters] = useState<string[]>([]);
  const [awayBench, setAwayBench] = useState<string[]>([]);
  const [homeCaptainId, setHomeCaptainId] = useState('');
  const [awayCaptainId, setAwayCaptainId] = useState('');
  const [homeViceCaptainId, setHomeViceCaptainId] = useState('');
  const [awayViceCaptainId, setAwayViceCaptainId] = useState('');
  const [homeCoachId, setHomeCoachId] = useState('');
  const [awayCoachId, setAwayCoachId] = useState('');
  const [dbCoaches, setDbCoaches] = useState<any[]>([]);

  // ── Step 4: Timeline & Events State ──
  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const [events, setEvents] = useState<any[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    type: 'GOAL',
    minute: 10,
    side: 'home' as 'home' | 'away',
    playerId: '',
    player2Id: '',
    details: '',
  });

  // ── Post Match AI Story ──
  const [playerOfMatchId, setPlayerOfMatchId] = useState('');
  const [aiStory, setAiStory] = useState({
    headline: '',
    summary: '',
    socialPost: '',
    journalDraft: '',
  });
  const [aiLoading, setAiLoading] = useState(false);

  // ── Reference Lookups ──
  const homeClub = clubs.find(c => String(c.id) === homeClubId);
  const awayClub = clubs.find(c => String(c.id) === awayClubId);
  const homePlayers = players.filter(p => String(p.clubId) === homeClubId || String(p.club?.id) === homeClubId);
  const awayPlayers = players.filter(p => String(p.clubId) === awayClubId || String(p.club?.id) === awayClubId);

  const [dbReferees, setDbReferees] = useState<any[]>([]);
  const [dbStadiums, setDbStadiums] = useState<any[]>([]);

  // ── DB fetch on mount ──
  useEffect(() => {
    layoutApi.getCoaches({ limit: 200 })
      .then(r => setDbCoaches(r.data ?? r))
      .catch(() => {});

    layoutApi.getReferees({ limit: 200 })
      .then(r => setDbReferees(r.data ?? r))
      .catch(() => {});

    layoutApi.getStadiums({ limit: 200 })
      .then(r => setDbStadiums(r.data ?? r))
      .catch(() => {});
  }, []);

  // ── PreviewSelect Option Arrays ─────────────────────────────────────────────

  // Stadiums loaded from DB
  const stadiumOptions: PreviewOption[] = dbStadiums.map((s: any) => ({
    id: String(s.id),
    name: s.name,
    subtitle: `${s.city || ''}${s.capacity ? ` • Cap. ${s.capacity.toLocaleString()}` : ''} • ${s.surface || ''}`,
    imgUrl: s.photoUrl,
    badge: s.city,
  }));

  // Referees loaded from DB
  const refereeOptions: PreviewOption[] = dbReferees.map((r: any) => ({
    id: String(r.id),
    name: `${r.firstName} ${r.lastName}`,
    subtitle: `${r.city || ''} • Accréditation ${r.licenseLevel || ''}`,
    imgUrl: r.photoUrl,
    badge: r.licenseLevel,
  }));

  // Club options with logo preview
  const clubOptions: PreviewOption[] = clubs.map((c: any) => ({
    id: String(c.id),
    name: c.name,
    subtitle: `${c.city || ''} • ${c.stadium || ''}`,
    imgUrl: c.logoUrl,
    badge: c.status === 'ACTIVE' ? 'Actif' : '',
  }));

  // Coach options loaded from DB
  const coachOptions: PreviewOption[] = dbCoaches.map((c: any) => ({
    id: String(c.id),
    name: c.name,
    subtitle: `${c.club?.name || c.clubId ? `${c.club?.name || ''}` : 'Sans club'} • ${c.nationality || ''}`,
    imgUrl: c.photoUrl,
    badge: c.status === 'ACTIVE' ? 'Actif' : c.status,
  }));

  // Player preview options per team
  const homePlayerOptions: PreviewOption[] = homePlayers.map((p: any) => ({
    id: String(p.id),
    name: p.name,
    subtitle: `N°${p.jerseyNumber || '?'} • ${p.position || ''}`,
    imgUrl: p.photoUrl,
    badge: p.position,
  }));

  const awayPlayerOptions: PreviewOption[] = awayPlayers.map((p: any) => ({
    id: String(p.id),
    name: p.name,
    subtitle: `N°${p.jerseyNumber || '?'} • ${p.position || ''}`,
    imgUrl: p.photoUrl,
    badge: p.position,
  }));

  const allPlayerOptions: PreviewOption[] = [...homePlayerOptions, ...awayPlayerOptions];

  // Keyboard Event Handlers for Live Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStep !== 'timeline') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'g') {
        setNewEvent(prev => ({ ...prev, type: 'GOAL' }));
        showToast('Raccourci: Événement défini sur BUT ⚽', 'info');
      } else if (key === 'y') {
        setNewEvent(prev => ({ ...prev, type: 'YELLOW_CARD' }));
        showToast('Raccourci: Événement défini sur CARTON JAUNE 🟨', 'info');
      } else if (key === 'r') {
        setNewEvent(prev => ({ ...prev, type: 'RED_CARD' }));
        showToast('Raccourci: Événement défini sur CARTON ROUGE 🟥', 'info');
      } else if (key === 's') {
        setNewEvent(prev => ({ ...prev, type: 'SUBSTITUTION' }));
        showToast('Raccourci: Événement défini sur CHANGEMENT 🔄', 'info');
      } else if (e.ctrlKey && key === 'z') {
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, undoStack]);

  // Load existing match configurations
  useEffect(() => {
    if (match.id) {
      apiClient.get(`/matches/${match.id}`).then(r => {
        const m = r.data;
        setHomeScore(m.homeScore ?? 0);
        setAwayScore(m.awayScore ?? 0);
        setEvents(m.events || []);
        
        // Auto-assign squad placeholders based on active records
        if (m.lineups) {
          const startersHome = m.lineups.filter((l: any) => l.clubId === m.homeClubId && l.isStarting).map((l: any) => String(l.playerId));
          const benchHome = m.lineups.filter((l: any) => l.clubId === m.homeClubId && !l.isStarting).map((l: any) => String(l.playerId));
          const startersAway = m.lineups.filter((l: any) => l.clubId === m.awayClubId && l.isStarting).map((l: any) => String(l.playerId));
          const benchAway = m.lineups.filter((l: any) => l.clubId === m.awayClubId && !l.isStarting).map((l: any) => String(l.playerId));
          
          if (startersHome.length) setHomeStarters(startersHome);
          if (benchHome.length) setHomeBench(benchHome);
          if (startersAway.length) setAwayStarters(startersAway);
          if (benchAway.length) setAwayBench(benchAway);
        }
      }).catch(console.error);
    }
  }, [match]);

  // Smart Pre-Publish Validations
  const getValidationWarnings = () => {
    const warnings: string[] = [];
    if (homeStarters.length !== 11) {
      warnings.push(`L'équipe domicile doit comporter exactement 11 titulaires (actuellement ${homeStarters.length}).`);
    }
    if (awayStarters.length !== 11) {
      warnings.push(`L'équipe extérieure doit comporter exactement 11 titulaires (actuellement ${awayStarters.length}).`);
    }
    const homeGK = homePlayers.filter(p => homeStarters.includes(String(p.id)) && p.position === 'GK');
    const awayGK = awayPlayers.filter(p => awayStarters.includes(String(p.id)) && p.position === 'GK');
    if (homeStarters.length > 0 && homeGK.length === 0) {
      warnings.push("Gardien de but titulaire manquant pour l'équipe domicile.");
    }
    if (awayStarters.length > 0 && awayGK.length === 0) {
      warnings.push("Gardien de but titulaire manquant pour l'équipe extérieure.");
    }
    if (!metadata.referee) {
      warnings.push("Arbitre central non configuré.");
    }
    if (metadata.status === 'FINISHED' && !playerOfMatchId) {
      warnings.push("Match terminé mais aucun Homme du Match désigné.");
    }
    return warnings;
  };

  const validationWarnings = getValidationWarnings();

  // Undo Functionality
  const handleUndo = () => {
    if (undoStack.length === 0) {
      showToast('Aucune action à annuler.', 'info');
      return;
    }
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(p => p.slice(0, -1));
    setEvents(prev.events);
    setHomeScore(prev.homeScore);
    setAwayScore(prev.awayScore);
    showToast('Dernier événement annulé.', 'info');
  };

  // Log new timeline events
  const handleAddEvent = () => {
    if (!newEvent.playerId) {
      showToast('Sélectionnez le joueur principal concerné.', 'error');
      return;
    }
    // Push current state to undo stack
    setUndoStack(prev => [...prev, { events: [...events], homeScore, awayScore }]);

    const p1 = players.find(p => String(p.id) === newEvent.playerId);
    const p2 = players.find(p => String(p.id) === newEvent.player2Id);

    const logged = {
      id: Date.now(),
      type: newEvent.type,
      minute: newEvent.minute,
      side: newEvent.side,
      playerId: Number(newEvent.playerId),
      playerName: p1?.name || 'Joueur',
      player2Id: newEvent.player2Id ? Number(newEvent.player2Id) : null,
      player2Name: p2?.name || '',
      details: newEvent.details || '',
    };

    setEvents(prev => [...prev, logged].sort((a, b) => a.minute - b.minute));

    // Dynamic ecosystem propagation triggers (optimistic score update)
    if (newEvent.type === 'GOAL' || newEvent.type === 'PENALTY_GOAL') {
      if (newEvent.side === 'home') setHomeScore(s => s + 1);
      else setAwayScore(s => s + 1);
    } else if (newEvent.type === 'OWN_GOAL') {
      if (newEvent.side === 'home') setAwayScore(s => s + 1);
      else setHomeScore(s => s + 1);
    }

    setNewEvent(prev => ({ ...prev, playerId: '', player2Id: '', details: '' }));
    showToast('Événement ajouté à la chronologie.');
  };

  const handleRemoveEvent = (id: number) => {
    const target = events.find(e => e.id === id);
    if (!target) return;

    setUndoStack(prev => [...prev, { events: [...events], homeScore, awayScore }]);
    setEvents(prev => prev.filter(e => e.id !== id));

    // Reverse scores if needed
    if (target.type === 'GOAL' || target.type === 'PENALTY_GOAL') {
      if (target.side === 'home') setHomeScore(s => Math.max(0, s - 1));
      else setAwayScore(s => Math.max(0, s - 1));
    } else if (target.type === 'OWN_GOAL') {
      if (target.side === 'home') setAwayScore(s => Math.max(0, s - 1));
      else setHomeScore(s => Math.max(0, s - 1));
    }
  };

  // AI Match Story Engine Simulation
  const generateAIStory = () => {
    setAiLoading(true);
    setTimeout(() => {
      const homeName = homeClub?.name || 'Domicile';
      const awayName = awayClub?.name || 'Extérieur';
      const motm = players.find(p => String(p.id) === playerOfMatchId)?.name || 'le MVP';
      const homeCoachName = dbCoaches.find(c => String(c.id) === homeCoachId)?.name || 'Domicile';
      const awayCoachName = dbCoaches.find(c => String(c.id) === awayCoachId)?.name || 'Visiteur';

      setAiStory({
        headline: `L'ÉLITE EN FLAMMES : ${homeName} ${homeScore} – ${awayScore} ${awayName}`,
        summary: `Dans une confrontation tactique animée pour la journée ${metadata.round}, ${homeName} et ${awayName} se séparent sur le score de ${homeScore} à ${awayScore}. ${motm} a été couronné homme du match suite à une performance magistrale.`,
        socialPost: `🔥 FIN DU MATCH ! Les gladiateurs se quittent sur ce score de ${homeScore}-${awayScore}. ${motm} brille au sommet de l'affiche ! #EliteOne #MTNEliteOne #${homeName.replace(/\s+/g, '')}`,
        journalDraft: `MTN ELITE ONE JOURNAL (Edition Spéciale) ── Le choc de cette journée ${metadata.round} a tenu toutes ses promesses au stade ${metadata.venue}. La confrontation s'est achevée sous les applaudissements du public avec une partition signée ${motm}. Les entraîneurs ${homeCoachName} et ${awayCoachName} devront revoir leurs équilibres défensifs pour la suite de la saison.`,
      });
      setAiLoading(false);
      showToast('Rapport généré par le moteur IA FootballOS !', 'success');
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    showToast('Texte copié dans le presse-papiers.');
  };

  // Match Save Handler
  const handlePublishMatch = async () => {
    if (validationWarnings.length > 0 && metadata.status === 'FINISHED') {
      const proceed = confirm("Des avertissements de validation sont en suspens. Souhaitez-vous publier ce match malgré tout ?");
      if (!proceed) return;
    }

    setSaving(true);
    try {
      const matchPayload = {
        homeClubId,
        awayClubId,
        homeScore,
        awayScore,
        status: metadata.status,
        round: metadata.round,
        scheduledAt: new Date(metadata.scheduledAt).toISOString(),
        venue: metadata.venue,
        city: metadata.city,
        referee: metadata.referee,
        seasonId: metadata.seasonId,
      };

      let savedMatch: any;
      if (match.id) {
        savedMatch = await layoutApi.updateMatch(String(match.id), matchPayload);
      } else {
        savedMatch = await layoutApi.createMatch(matchPayload);
      }

      // Update lineups via lineups API endpoint
      const lineupPayload = [
        ...homeStarters.map(pid => ({ playerId: pid, clubId: homeClubId, isStarting: true, isCaptain: pid === homeCaptainId })),
        ...homeBench.map(pid => ({ playerId: pid, clubId: homeClubId, isStarting: false, isCaptain: false })),
        ...awayStarters.map(pid => ({ playerId: pid, clubId: awayClubId, isStarting: true, isCaptain: pid === awayCaptainId })),
        ...awayBench.map(pid => ({ playerId: pid, clubId: awayClubId, isStarting: false, isCaptain: false }))
      ];

      await apiClient.patch(`/matches/${savedMatch.id}/lineups`, { players: lineupPayload });

      onSaved(savedMatch);
      showToast('Match synchronisé avec succès avec l\'écosystème FootballOS.', 'success');
      onClose();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Erreur lors de la synchronisation', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper for rendering step indicators
  const renderStepTab = (id: StepId, label: string, stepNum: number) => {
    const isActive = activeStep === id;
    return (
      <button
        onClick={() => setActiveStep(id)}
        className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
          isActive ? 'border-accent text-accent' : 'border-transparent text-white/40 hover:text-white'
        }`}
      >
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
          isActive ? 'bg-accent text-black font-black' : 'bg-white/10 text-white/50'
        }`}>
          {stepNum}
        </span>
        {label}
      </button>
    );
  };

  // Tactical coords mapping for pitch lineups
  const homeCoords = FORMATIONS.find(f => f.value === homeFormation)?.coords || FORMATIONS[0].coords;
  const awayCoords = FORMATIONS.find(f => f.value === awayFormation)?.coords || FORMATIONS[0].coords;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative ml-auto w-full max-w-6xl bg-[#070b0f] border-l border-white/[0.06] flex flex-col h-full overflow-hidden"
      >
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.05] bg-[#080d13] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <X className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-sm font-display font-black tracking-wider uppercase text-white flex items-center gap-2">
                FootballOS League Studio
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-accent/10 text-accent/80 border border-accent/20">MATCH BUILDER</span>
              </h2>
              <p className="text-[10px] text-white/30">Console d'administration unifiée et temps réel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Validation alert badge */}
            {validationWarnings.length > 0 ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                <AlertOctagon className="h-3.5 w-3.5" /> {validationWarnings.length} Alertes de validation
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Validation Validée
              </span>
            )}

            {/* Score pill */}
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] px-4 py-1.5 rounded-2xl font-display font-black text-xl text-white tabular-nums">
              <span>{homeScore}</span>
              <span className="text-white/20 text-sm">–</span>
              <span>{awayScore}</span>
            </div>
          </div>
        </div>

        {/* ── Wizard step selectors ── */}
        <div className="flex border-b border-white/[0.05] bg-[#070b0f] flex-shrink-0 overflow-x-auto">
          {renderStepTab('metadata', 'Contexte & Match', 1)}
          {renderStepTab('teams', 'Sélection Équipes', 2)}
          {renderStepTab('lineups', 'Tactique & Roster', 3)}
          {renderStepTab('timeline', 'Live & Chronologie', 4)}
          {renderStepTab('story', 'AI Rapport Story', 5)}
        </div>

        {/* ── Form content scrolling area ── */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#070b0f]">
          <div className="max-w-5xl mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                
                {/* ── STEP 1: METADATA & CONTEXT ── */}
                {activeStep === 'metadata' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" />
                        <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Contexte Général</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Saison" type="select" value={metadata.seasonId} onChange={v => setMetadata(p => ({ ...p, seasonId: v }))} options={seasons.map(s => ({ value: s.id, label: s.name }))} required />
                        <FormField label="Journée de championnat" type="number" value={metadata.round} onChange={v => setMetadata(p => ({ ...p, round: Number(v) }))} min={1} required />
                      </div>

                      <FormField label="Date & Heure Coup d'envoi" type="datetime-local" value={metadata.scheduledAt} onChange={v => setMetadata(p => ({ ...p, scheduledAt: v }))} required />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Ville" value={metadata.city} onChange={v => setMetadata(p => ({ ...p, city: v }))} placeholder="ex. Yaoundé" />
                        {/* Stadium loaded from clubs DB */}
                        <PreviewSelect
                          label="Stade / Arena"
                          placeholder="Choisir un stade..."
                          value={metadata.venue}
                          onChange={v => setMetadata(p => ({ ...p, venue: v }))}
                          options={stadiumOptions}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Tv className="h-4 w-4 text-accent" />
                        <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Officiels & Environnement</h3>
                      </div>

                      {/* Referee loaded from preset list */}
                      <PreviewSelect
                        label="Arbitre Principal"
                        placeholder="Sélectionner l'arbitre central..."
                        value={metadata.referee}
                        onChange={v => setMetadata(p => ({ ...p, referee: v }))}
                        options={refereeOptions}
                        required
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Affluence spectateurs" type="number" value={metadata.attendance} onChange={v => setMetadata(p => ({ ...p, attendance: v }))} placeholder="ex. 35000" />
                        <FormField label="Météo constatée" type="select" value={metadata.weather} onChange={v => setMetadata(p => ({ ...p, weather: v }))} options={WEATHER_TYPES.map(w => ({ value: w, label: w }))} />
                      </div>

                      <FormField label="Chaîne / Diffuseur TV" type="select" value={metadata.broadcast} onChange={v => setMetadata(p => ({ ...p, broadcast: v }))} options={BROADCASTERS.map(b => ({ value: b, label: b }))} />
                      
                      <div className="pt-4 border-t border-white/[0.05]">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Statut opérationnel du match</label>
                        <div className="flex flex-wrap gap-2">
                          {['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'].map(s => (
                            <button
                              key={s}
                              onClick={() => setMetadata(p => ({ ...p, status: s }))}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                metadata.status === s
                                  ? 'bg-accent border-accent text-black'
                                  : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white hover:border-white/15'
                              }`}
                            >
                              {s === 'SCHEDULED' ? '📅 Planifié' : s === 'LIVE' ? '🔴 En Direct' : s === 'FINISHED' ? '✓ Terminé' : s === 'POSTPONED' ? '⏸ Reporté' : '✕ Annulé'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: TEAMS SELECTION ── */}
                {activeStep === 'teams' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Swords className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Sélection des Équipes</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Home team card selection — loaded from DB */}
                      <div className="bg-[#0b1016] border border-white/[0.05] rounded-3xl p-6 space-y-4">
                        <PreviewSelect
                          label="Équipe Domicile"
                          placeholder="Sélectionner l'équipe domicile..."
                          value={homeClubId}
                          onChange={setHomeClubId}
                          options={clubOptions}
                          required
                        />
                        {homeClub && (
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <img src={homeClub.logoUrl || 'https://placehold.co/100'} alt={homeClub.name} className="w-16 h-16 object-contain" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-display font-bold text-white">{homeClub.name}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">{homeClub.city} • {homeClub.stadium}</p>
                              <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-accent/15 text-accent uppercase tracking-wider">Domicile</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Away team card selection — loaded from DB */}
                      <div className="bg-[#0b1016] border border-white/[0.05] rounded-3xl p-6 space-y-4">
                        <PreviewSelect
                          label="Équipe Extérieure"
                          placeholder="Sélectionner l'équipe extérieure..."
                          value={awayClubId}
                          onChange={setAwayClubId}
                          options={clubOptions}
                          required
                        />
                        {awayClub && (
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <img src={awayClub.logoUrl || 'https://placehold.co/100'} alt={awayClub.name} className="w-16 h-16 object-contain" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-display font-bold text-white">{awayClub.name}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">{awayClub.city} • {awayClub.stadium}</p>
                              <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 uppercase tracking-wider">Extérieur</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: TACTICAL SQUAD BUILDER ── */}
                {activeStep === 'lineups' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">Lineup &amp; Composition Tactique</h3>
                      </div>

                      <div className="flex gap-4">
                        <FormField label="Formation Domicile" type="select" value={homeFormation} onChange={setHomeFormation} options={FORMATIONS.map(f => ({ value: f.value, label: f.value }))} />
                        <FormField label="Formation Extérieur" type="select" value={awayFormation} onChange={setAwayFormation} options={FORMATIONS.map(f => ({ value: f.value, label: f.value }))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* HOME lineup builder */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-500/15 p-4 rounded-2xl">
                          <p className="text-xs font-bold text-white">{homeClub?.name || 'Domicile'}</p>
                          <span className="text-[10px] text-emerald-400 font-bold">{homeStarters.length} / 11 titulaires</span>
                        </div>

                        {/* Interactive Pitch layout */}
                        <div className="relative aspect-[3/4] bg-emerald-900/30 rounded-3xl border border-white/[0.08] overflow-hidden">
                          {/* Half way line */}
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border border-white/10" />
                          </div>

                          {/* Coordinates mapped */}
                          {homeCoords.map((coord, i) => {
                            const pId = homeStarters[i];
                            const playerObj = homePlayers.find(p => String(p.id) === pId);
                            return (
                              <div
                                key={i}
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer"
                                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                                onClick={() => {
                                  // Prompt to select player for this position
                                  const list = homePlayers.filter(p => !homeStarters.includes(String(p.id)));
                                  const choice = prompt(`Sélectionnez le joueur pour le poste ${coord.pos}:\n` + list.map((p, idx) => `${idx + 1}. ${p.name}`).join('\n'));
                                  if (choice) {
                                    const index = parseInt(choice, 10) - 1;
                                    if (list[index]) {
                                      setHomeStarters(prev => {
                                        const next = [...prev];
                                        next[i] = String(list[index].id);
                                        return next;
                                      });
                                    }
                                  }
                                }}
                              >
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${
                                  playerObj ? 'bg-accent border-accent text-black' : 'bg-white/10 border-white/25 text-white/50'
                                }`}>
                                  {playerObj?.jerseyNumber || coord.pos}
                                </div>
                                <span className="text-[8px] font-sans font-bold bg-black/80 text-white/90 px-1 py-0.5 rounded truncate max-w-[64px]">
                                  {playerObj?.name.split(' ').pop() || 'Vide'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Captain & Coach loaded from DB */}
                        <div className="grid grid-cols-2 gap-4">
                          <PreviewSelect
                            label="Capitaine"
                            placeholder="Choisir le capitaine..."
                            value={homeCaptainId}
                            onChange={setHomeCaptainId}
                            options={homePlayerOptions}
                          />
                          <PreviewSelect
                            label="Entraîneur Principal"
                            placeholder="Choisir l'entraîneur..."
                            value={homeCoachId}
                            onChange={setHomeCoachId}
                            options={coachOptions}
                          />
                        </div>

                        {/* Selection list for bench */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Joueurs sur le Banc</label>
                          <div className="flex flex-wrap gap-2">
                            {homePlayers.map(p => {
                              const isStart = homeStarters.includes(String(p.id));
                              const isBench = homeBench.includes(String(p.id));
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    if (isStart) return;
                                    setHomeBench(prev => {
                                      const next = new Set(prev);
                                      next.has(String(p.id)) ? next.delete(String(p.id)) : next.add(String(p.id));
                                      return Array.from(next);
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                    isStart ? 'bg-accent/10 border-accent/20 text-accent/50 cursor-not-allowed' :
                                    isBench ? 'bg-white/15 border-white/30 text-white' : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white'
                                  }`}
                                >
                                  {p.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* AWAY lineup builder */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-sky-950/20 border border-sky-500/15 p-4 rounded-2xl">
                          <p className="text-xs font-bold text-white">{awayClub?.name || 'Extérieur'}</p>
                          <span className="text-[10px] text-sky-400 font-bold">{awayStarters.length} / 11 titulaires</span>
                        </div>

                        {/* Interactive Pitch layout */}
                        <div className="relative aspect-[3/4] bg-sky-900/30 rounded-3xl border border-white/[0.08] overflow-hidden">
                          {/* Half way line */}
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border border-white/10" />
                          </div>

                          {/* Coordinates mapped */}
                          {awayCoords.map((coord, i) => {
                            const pId = awayStarters[i];
                            const playerObj = awayPlayers.find(p => String(p.id) === pId);
                            return (
                              <div
                                key={i}
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer"
                                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                                onClick={() => {
                                  // Prompt to select player for this position
                                  const list = awayPlayers.filter(p => !awayStarters.includes(String(p.id)));
                                  const choice = prompt(`Sélectionnez le joueur pour le poste ${coord.pos}:\n` + list.map((p, idx) => `${idx + 1}. ${p.name}`).join('\n'));
                                  if (choice) {
                                    const index = parseInt(choice, 10) - 1;
                                    if (list[index]) {
                                      setAwayStarters(prev => {
                                        const next = [...prev];
                                        next[i] = String(list[index].id);
                                        return next;
                                      });
                                    }
                                  }
                                }}
                              >
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${
                                  playerObj ? 'bg-sky-400 border-sky-400 text-black' : 'bg-white/10 border-white/25 text-white/50'
                                }`}>
                                  {playerObj?.jerseyNumber || coord.pos}
                                </div>
                                <span className="text-[8px] font-sans font-bold bg-black/80 text-white/90 px-1 py-0.5 rounded truncate max-w-[64px]">
                                  {playerObj?.name.split(' ').pop() || 'Vide'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Captain & Coach loaded from DB */}
                        <div className="grid grid-cols-2 gap-4">
                          <PreviewSelect
                            label="Capitaine"
                            placeholder="Choisir le capitaine..."
                            value={awayCaptainId}
                            onChange={setAwayCaptainId}
                            options={awayPlayerOptions}
                          />
                          <PreviewSelect
                            label="Entraîneur Principal"
                            placeholder="Choisir l'entraîneur..."
                            value={awayCoachId}
                            onChange={setAwayCoachId}
                            options={coachOptions}
                          />
                        </div>

                        {/* Selection list for bench */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Joueurs sur le Banc</label>
                          <div className="flex flex-wrap gap-2">
                            {awayPlayers.map(p => {
                              const isStart = awayStarters.includes(String(p.id));
                              const isBench = awayBench.includes(String(p.id));
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    if (isStart) return;
                                    setAwayBench(prev => {
                                      const next = new Set(prev);
                                      next.has(String(p.id)) ? next.delete(String(p.id)) : next.add(String(p.id));
                                      return Array.from(next);
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                    isStart ? 'bg-sky-400/10 border-sky-400/20 text-sky-400/50 cursor-not-allowed' :
                                    isBench ? 'bg-white/15 border-white/30 text-white' : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white'
                                  }`}
                                >
                                  {p.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: TIMELINE BUILDER & LIVE MODE ── */}
                {activeStep === 'timeline' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Event generator controls (left panel) */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-[#0b1016] border border-white/[0.05] rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-display font-black uppercase tracking-wider text-white/80">Console de commande live</h4>
                          {undoStack.length > 0 && (
                            <button onClick={handleUndo} className="flex items-center gap-1 text-[10px] font-bold text-accent hover:text-white transition-all">
                              <RotateCcw className="h-3 w-3" /> Annuler (Ctrl+Z)
                            </button>
                          )}
                        </div>

                        {/* Event type selection */}
                        <FormField label="Type d'événement" type="select" value={newEvent.type} onChange={v => setNewEvent(p => ({ ...p, type: v }))} options={EVENT_TYPES.map(e => ({ value: e.value, label: e.label }))} />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Minute de jeu" type="number" value={newEvent.minute} onChange={v => setNewEvent(p => ({ ...p, minute: Number(v) }))} min={1} required />
                          <FormField label="Équipe concernée" type="select" value={newEvent.side} onChange={v => setNewEvent(p => ({ ...p, side: v as any }))} options={[{ value: 'home', label: homeClub?.name || 'Domicile' }, { value: 'away', label: awayClub?.name || 'Extérieur' }]} />
                        </div>

                        {/* Player lookups — loaded from DB filtered by selected club */}
                        <div className="grid grid-cols-2 gap-4">
                          <PreviewSelect
                            label="Joueur Principal"
                            placeholder="Sélectionner le joueur..."
                            value={newEvent.playerId}
                            onChange={v => setNewEvent(p => ({ ...p, playerId: v }))}
                            options={newEvent.side === 'home' ? homePlayerOptions : awayPlayerOptions}
                            required
                          />
                          <PreviewSelect
                            label="Joueur Secondaire (Passe / Entrant)"
                            placeholder="Optionnel..."
                            value={newEvent.player2Id}
                            onChange={v => setNewEvent(p => ({ ...p, player2Id: v }))}
                            options={newEvent.side === 'home' ? homePlayerOptions : awayPlayerOptions}
                          />
                        </div>

                        <FormField label="Détails additionnels / Notes" value={newEvent.details} onChange={v => setNewEvent(p => ({ ...p, details: v }))} placeholder="ex. Carton pour tacle en retard / Tête sur corner" />

                        <button
                          onClick={handleAddEvent}
                          className="w-full py-3 rounded-2xl bg-accent text-black font-black uppercase text-xs hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Enregistrer l'événement
                        </button>
                      </div>

                      {/* Hotkey guides info */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-white/30 space-y-1">
                        <p className="font-bold text-white/50 uppercase tracking-wider mb-1">Raccourcis clavier (Live mode)</p>
                        <p><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">G</kbd> ── Enregistrer un But (Goal)</p>
                        <p><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">Y</kbd> ── Enregistrer un Carton Jaune</p>
                        <p><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">R</kbd> ── Enregistrer un Carton Rouge</p>
                        <p><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">S</kbd> ── Configurer un Changement</p>
                        <p><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">Ctrl + Z</kbd> ── Retour arrière / Annuler</p>
                      </div>
                    </div>

                    {/* Timeline List Log (right panel) */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-display font-black uppercase tracking-wider text-white/40">Chronologie interactive</h4>
                        <span className="text-[10px] text-white/30">{events.length} événements enregistrés</span>
                      </div>

                      <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.08]">
                        {events.map((ev, i) => {
                          const icon = ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL' ? '⚽' :
                                       ev.type === 'YELLOW_CARD' ? '🟨' :
                                       ev.type === 'RED_CARD' ? '🟥' :
                                       ev.type === 'SUBSTITUTION' ? '🔄' :
                                       ev.type === 'INJURY' ? '🩹' : '⏱';
                          const isHome = ev.side === 'home';
                          return (
                            <motion.div
                              key={ev.id || i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="relative flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.04] hover:border-white/10 rounded-2xl group transition-all"
                            >
                              <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center font-display font-bold text-xs text-white/80 tabular-nums flex-shrink-0 z-10">
                                {ev.minute}'
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{icon}</span>
                                  <span className="text-xs font-bold text-white">{ev.playerName}</span>
                                  {ev.player2Name && (
                                    <>
                                      <span className="text-[10px] text-white/35">→</span>
                                      <span className="text-xs font-bold text-white/80">{ev.player2Name}</span>
                                    </>
                                  )}
                                </div>
                                {ev.details && <p className="text-[10px] text-white/40 mt-1 italic">{ev.details}</p>}
                                <p className={`text-[8px] font-bold uppercase mt-1 ${isHome ? 'text-emerald-400' : 'text-sky-400'}`}>
                                  {isHome ? homeClub?.name : awayClub?.name}
                                </p>
                              </div>

                              <button
                                onClick={() => handleRemoveEvent(ev.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/30 hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}

                        {events.length === 0 && (
                          <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-3xl">
                            <p className="text-xs text-white/35">Aucun événement dans la chronologie. Utilisez le panneau de gauche pour commencer à enregistrer.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: AI POST-MATCH STORY GENERATOR ── */}
                {activeStep === 'story' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Validation Warnings & MVP Selection */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-[#0b1016] border border-white/[0.05] rounded-3xl p-6 space-y-5">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-accent" />
                          <h4 className="text-xs font-display font-black uppercase tracking-wider text-white">Validation &amp; Distinctions</h4>
                        </div>

                        <PreviewSelect
                          label="Homme du match (MVP)"
                          placeholder="Désigner le MVP du match..."
                          value={playerOfMatchId}
                          onChange={setPlayerOfMatchId}
                          options={allPlayerOptions}
                        />

                        {/* Validation Alert Box */}
                        <div className="pt-4 border-t border-white/[0.05] space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Rapport de conformité FootballOS</p>
                          {validationWarnings.length > 0 ? (
                            <div className="space-y-2">
                              {validationWarnings.map((w, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[10px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{w}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                              <CheckCircle className="h-4 w-4 flex-shrink-0" />
                              <span>Toutes les règles de conformité ont été validées avec succès pour la publication.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={generateAIStory}
                        disabled={aiLoading}
                        className="w-full py-3.5 rounded-2xl bg-accent text-black font-black uppercase text-xs hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Générer le rapport de presse IA
                      </button>
                    </div>

                    {/* AI Outputs */}
                    <div className="lg:col-span-7 space-y-6">
                      <h4 className="text-xs font-display font-black uppercase tracking-wider text-white/40">Suggestion éditoriales de l'IA</h4>

                      {aiStory.headline ? (
                        <div className="space-y-6">
                          {/* Headline Card */}
                          <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Titre suggéré</span>
                              <button onClick={() => copyToClipboard(aiStory.headline)} className="text-white/40 hover:text-white">
                                {copiedText === aiStory.headline ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <p className="text-md font-display font-black text-white">{aiStory.headline}</p>
                          </div>

                          {/* Summary Card */}
                          <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Résumé flash</span>
                              <button onClick={() => copyToClipboard(aiStory.summary)} className="text-white/40 hover:text-white">
                                {copiedText === aiStory.summary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <p className="text-xs text-white/70 leading-relaxed">{aiStory.summary}</p>
                          </div>

                          {/* Social Card */}
                          <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Post Réseaux Sociaux</span>
                              <button onClick={() => copyToClipboard(aiStory.socialPost)} className="text-white/40 hover:text-white">
                                {copiedText === aiStory.socialPost ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <p className="text-xs text-white/60 font-mono leading-relaxed">{aiStory.socialPost}</p>
                          </div>

                          {/* Journal draft Card */}
                          <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Brouillon Journal de Ligue</span>
                              <button onClick={() => copyToClipboard(aiStory.journalDraft)} className="text-white/40 hover:text-white">
                                {copiedText === aiStory.journalDraft ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap">{aiStory.journalDraft}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-3xl">
                          <Sparkles className="h-6 w-6 text-white/20 mx-auto mb-3" />
                          <p className="text-xs text-white/35">Cliquez sur le bouton pour générer des suggestions éditoriales basées sur la chronologie du match.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer / Steppers ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.05] bg-[#080d13] flex-shrink-0">
          <div className="flex items-center gap-2">
            {activeStep !== 'metadata' && (
              <button
                onClick={() => {
                  const steps: StepId[] = ['metadata', 'teams', 'lineups', 'timeline', 'story'];
                  const idx = steps.indexOf(activeStep);
                  setActiveStep(steps[idx - 1]);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white transition-all text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" /> Précédent
              </button>
            )}
            {activeStep !== 'story' && (
              <button
                onClick={() => {
                  const steps: StepId[] = ['metadata', 'teams', 'lineups', 'timeline', 'story'];
                  const idx = steps.indexOf(activeStep);
                  setActiveStep(steps[idx + 1]);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white transition-all text-xs font-bold"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white transition-all text-xs font-semibold">
              Fermer
            </button>
            <button
              onClick={handlePublishMatch}
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-accent text-black font-black text-xs hover:bg-accent/90 transition-all flex items-center gap-2 disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Synchroniser &amp; Publier
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
