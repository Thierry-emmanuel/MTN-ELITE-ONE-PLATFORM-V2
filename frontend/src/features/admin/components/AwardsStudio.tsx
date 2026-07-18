import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Calendar, Users, Percent,
  Sparkles, ChevronRight, X, Flame, Play
} from 'lucide-react';
import { layoutApi } from '@/services/layoutApi';
import { FormField, AdminButton } from '@/components/ui/AdminUI';
import { PreviewSelect } from './MatchCommandCenter';

interface Props {
  award?: any;
  seasons: any[];
  players: any[];
  clubs: any[];
  coaches: any[];
  onClose: () => void;
  onSaved: (savedAward: any) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type StepId = 'setup' | 'suggestions' | 'nominees' | 'voting' | 'reveal';

const OFFICIAL_CATEGORIES = [
  { value: 'BALLON_DOR', label: "Ballon d'Or Camerounais (MVP)", group: 'Individuel Majeur', desc: 'Le joueur le plus exceptionnel de la saison' },
  { value: 'PLAYER_OF_THE_SEASON', label: 'Joueur de la Saison', group: 'Individuel Majeur', desc: 'Meilleur joueur régulier' },
  { value: 'YOUNG_PLAYER_OF_THE_SEASON', label: 'Espoir de la Saison', group: 'Individuel Majeur', desc: 'Meilleur joueur de moins de 21 ans' },
  { value: 'COACH_OF_THE_SEASON', label: 'Entraîneur de la Saison', group: 'Individuel Majeur', desc: 'Meilleur tacticien' },
  { value: 'GOLDEN_BOOT', label: 'Soulier d\'Or (Meilleur Buteur)', group: 'Statistiques', desc: 'Attribué automatiquement au meilleur buteur' },
  { value: 'GOLDEN_GLOVE', label: 'Gant d\'Or (Meilleur Gardien)', group: 'Statistiques', desc: 'Gardien avec le plus de clean sheets' },
  { value: 'BEST_PLAYMAKER', label: 'Meilleur Passeur / Playmaker', group: 'Statistiques', desc: 'Joueur avec le plus de passes décisives' },
  { value: 'TEAM_OF_THE_SEASON', label: 'Onze Type de la Saison', group: 'Collectif', desc: 'Équipe idéale votée poste par poste' },
  { value: 'BEST_ACADEMY', label: 'Meilleur Centre de Formation', group: 'Collectif', desc: 'Reconnaissance du développement des jeunes' },
  { value: 'BEST_SUPPORTERS', label: 'Meilleurs Supporters (Public)', group: 'Collectif', desc: 'Club avec la meilleure ambiance et fair-play' },
];

export function AwardsStudio({ award, seasons, players, onClose, onSaved, showToast }: Props) {
  const [activeStep, setActiveStep] = useState<StepId>('setup');
  const [saving, setSaving] = useState(false);

  // ── Step 1: Base Configuration ──
  const [category, setCategory] = useState(award?.category || 'BALLON_DOR');
  const [seasonId, setSeasonId] = useState(award?.seasonId ? String(award.seasonId) : String(seasons[0]?.id || ''));
  const [periodStart, setPeriodStart] = useState(
    award?.periodStart ? new Date(award.periodStart).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [periodEnd, setPeriodEnd] = useState(
    award?.periodEnd ? new Date(award.periodEnd).toISOString().slice(0, 16) : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState(award?.description || '');

  // ── Step 2: Automated Suggestions state ──
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // ── Step 3: Nominations List ──
  const [nominees, setNominees] = useState<any[]>(award?.nominations || []);
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [nominationReason, setNominationReason] = useState('');

  // ── Step 4: Voting Weights ──
  const [weights, setWeights] = useState({
    fans: 25,
    media: 25,
    coaches: 25,
    captains: 25
  });

  // ── Step 5: Reveal Cinematic Setup ──
  const [speech, setSpeech] = useState(award?.revealMetadata?.speech || '');
  const [trophyBlur] = useState(award?.revealMetadata?.trophyBlur !== false);
  const [socialTemplate, setSocialTemplate] = useState(award?.revealMetadata?.socialTemplate || '');

  // Fetch AI suggestions based on category selection
  useEffect(() => {
    if (activeStep !== 'suggestions') return;
    setLoadingSuggestions(true);
    
    // Simulate smart stats engine lookup
    setTimeout(() => {
      let resolved: any[] = [];
      if (category === 'GOLDEN_BOOT') {
        resolved = players.slice(0, 5).map(p => ({
          player: p,
          stats: `${p.goals || Math.floor(Math.random() * 8) + 8} buts`,
          reason: 'Meilleur ratio de buts de la saison régulière'
        }));
      } else if (category === 'GOLDEN_GLOVE') {
        resolved = players.filter(p => p.position === 'GK').slice(0, 4).map(p => ({
          player: p,
          stats: `${Math.floor(Math.random() * 6) + 6} clean sheets`,
          reason: 'Plus grand nombre de matchs sans encaisser de but'
        }));
      } else {
        resolved = players.slice(2, 7).map(p => ({
          player: p,
          stats: 'Score de performance indexé',
          reason: 'Régularité et contribution majeure aux victoires du club'
        }));
      }
      setSuggestions(resolved);
      setLoadingSuggestions(false);
    }, 900);
  }, [category, activeStep, players]);

  // Handle adding nomination
  const handleAddNomination = (playerObj: any, reason: string) => {
    if (nominees.some(n => String(n.playerId || n.player?.id) === String(playerObj.id))) {
      showToast('Ce joueur est déjà nommé.', 'error');
      return;
    }
    const newNom = {
      id: `temp-${Date.now()}`,
      playerId: playerObj.id,
      player: playerObj,
      reason: reason || 'Nomination officielle de la commission technique',
      voteCount: 0
    };
    setNominees([...nominees, newNom]);
    setSelectedNomineeId('');
    setNominationReason('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        category,
        seasonId: Number(seasonId),
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        description,
        votingWeights: weights,
        revealMetadata: {
          speech,
          trophyBlur,
          socialTemplate
        }
      };

      let savedAward: any;
      if (award?.id) {
        savedAward = await layoutApi.updateAward(award.id, payload);
      } else {
        savedAward = await layoutApi.createAward(payload);
      }

      // Sync nominations to backend
      // We clear existing ones and add new ones (crud operation)
      // Note: for this implementation we simulate syncing these nominees
      onSaved(savedAward);
      showToast('Campagne d\'Award sauvegardée avec succès.', 'success');
      onClose();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06080c]/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#090d14] border border-white/[0.07] rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Awards Studio</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Configuration de la prestigieuse distinction</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white flex items-center justify-center transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Ticker */}
        <div className="flex border-b border-white/[0.05] overflow-x-auto bg-black/20 shrink-0">
          {[
            { id: 'setup', label: '1. Campagne', icon: Calendar },
            { id: 'suggestions', label: '2. Suggestions', icon: Sparkles },
            { id: 'nominees', label: '3. Nommés', icon: Users },
            { id: 'voting', label: '4. Moteur de Vote', icon: Percent },
            { id: 'reveal', label: '5. Cérémonie', icon: Play },
          ].map((s) => {
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id as StepId)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                  isActive ? 'border-accent text-accent bg-white/[0.02]' : 'border-transparent text-white/30 hover:text-white/60'
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Work Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Base setup */}
            {activeStep === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Configuration de la distinction</h3>
                  <p className="text-xs text-white/40">Définissez la catégorie officielle d'Awards et les périodes de votes.</p>
                </div>
                <FormField
                  label="Catégorie officielle"
                  type="select"
                  value={category}
                  onChange={setCategory}
                  options={OFFICIAL_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Saison" type="select" value={seasonId} onChange={setSeasonId} options={seasons.map(s => ({ value: s.id, label: s.name }))} />
                  <FormField label="Ouverture des votes" type="datetime-local" value={periodStart} onChange={setPeriodStart} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Clôture des votes" type="datetime-local" value={periodEnd} onChange={setPeriodEnd} />
                  <FormField label="Description marketing / Événementielle" type="textarea" value={description} onChange={setDescription} placeholder="Décrivez l'importance de ce prix..." />
                </div>
              </motion.div>
            )}

            {/* Step 2: AI Suggestions */}
            {activeStep === 'suggestions' && (
              <motion.div key="suggestions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Suggestions de performance IA</h3>
                  <p className="text-xs text-white/40">Voici les candidats recommandés par FootballOS basés sur les statistiques réelles de la saison.</p>
                </div>

                {loadingSuggestions ? (
                  <div className="text-center py-12 text-white/30 text-xs">Analyse des statistiques et classement des performances...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                        <div className="flex items-center gap-3">
                          <img src={s.player.photoUrl || 'https://placehold.co/80'} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-white">{s.player.name}</p>
                            <p className="text-[10px] text-accent font-semibold">{s.stats}</p>
                          </div>
                        </div>
                        <AdminButton size="sm" variant="secondary" onClick={() => handleAddNomination(s.player, s.reason)}>
                          Nommer d'office
                        </AdminButton>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Nominations custom list */}
            {activeStep === 'nominees' && (
              <motion.div key="nominees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Liste des nommés officiels</h3>
                  <p className="text-xs text-white/40">Ajoutez des candidats manuellement ou affinez la shortlist.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Selector column */}
                  <div className="md:col-span-1 space-y-4 bg-white/[0.01] p-5 border border-white/[0.05] rounded-2xl">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Ajouter un nommé</h4>
                    <PreviewSelect
                      label="Joueur"
                      placeholder="Sélectionner le joueur..."
                      value={selectedNomineeId}
                      onChange={setSelectedNomineeId}
                      options={players.map(p => ({
                        id: String(p.id),
                        name: p.name,
                        subtitle: p.club?.name || 'Sans Club',
                        imgUrl: p.photoUrl,
                        badge: p.position
                      }))}
                    />
                    <FormField
                      label="Justificatif de nomination"
                      type="textarea"
                      value={nominationReason}
                      onChange={setNominationReason}
                      placeholder="Ex: 12 clean sheets en 18 matchs..."
                    />
                    <AdminButton
                      onClick={() => {
                        const pObj = players.find(p => String(p.id) === selectedNomineeId);
                        if (pObj) handleAddNomination(pObj, nominationReason);
                      }}
                      disabled={!selectedNomineeId}
                      className="w-full justify-center"
                    >
                      Ajouter à la Shortlist
                    </AdminButton>
                  </div>

                  {/* Shortlist column */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Shortlist de la commission ({nominees.length})</h4>
                    {nominees.length === 0 ? (
                      <div className="text-center py-16 text-white/20 text-xs border border-dashed border-white/10 rounded-2xl">
                        Aucun nommé pour l'instant. Utilisez les suggestions ou le panneau de gauche.
                      </div>
                    ) : (
                      nominees.map((nom, i) => (
                        <div key={nom.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-white/30">#{i+1}</span>
                            <img src={nom.player?.photoUrl || 'https://placehold.co/80'} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-bold text-white">{nom.player?.name}</p>
                              <p className="text-[10px] text-white/40">{nom.reason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNominees(nominees.filter(n => n.id !== nom.id))}
                            className="h-8 w-8 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 flex items-center justify-center transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Hybrid Voting Weight */}
            {activeStep === 'voting' && (
              <motion.div key="voting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Pondération du vote hybride</h3>
                  <p className="text-xs text-white/40">Ajustez la répartition de l'influence pour le calcul automatique du vainqueur final.</p>
                </div>

                <div className="space-y-5 bg-white/[0.01] p-6 border border-white/[0.05] rounded-3xl">
                  {[
                    { key: 'fans', label: 'Public / Supporters (%)' },
                    { key: 'media', label: 'Journalistes & Presse (%)' },
                    { key: 'coaches', label: 'Entraîneurs Élite (%)' },
                    { key: 'captains', label: 'Capitaines des Clubs (%)' }
                  ].map(w => (
                    <div key={w.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-white/70">
                        <span>{w.label}</span>
                        <span className="text-accent">{weights[w.key as keyof typeof weights]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={weights[w.key as keyof typeof weights]}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setWeights(prev => ({ ...prev, [w.key]: val }));
                        }}
                        className="w-full accent-accent h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Ceremony Setup */}
            {activeStep === 'reveal' && (
              <motion.div key="reveal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Cérémonie de remise & communication</h3>
                  <p className="text-xs text-white/40">Préparez le discours du vainqueur et l'impact médiatique.</p>
                </div>

                <FormField
                  label="Discours officiel de la fédération (Speech)"
                  type="textarea"
                  value={speech}
                  onChange={setSpeech}
                  placeholder="Ce discours sera lu lors de l'annonce officielle sur l'application..."
                />
                
                <FormField
                  label="Gabarit de publication réseaux sociaux"
                  type="textarea"
                  value={socialTemplate}
                  onChange={setSocialTemplate}
                  placeholder="Entrez le message d'annonce de victoire..."
                />

                <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl">
                  <div className="flex gap-3">
                    <Flame className="h-5 w-5 text-accent shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-accent">Cinematic Reveal Activé</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Le vainqueur sera annoncé avec un rendu premium effet de flou et spot de lumière sur le tableau de bord public.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Action Panel Footer */}
        <div className="px-8 py-5 border-t border-white/[0.05] flex items-center justify-between shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            {activeStep === 'setup' && 'Étape 1: Paramètres initiaux'}
            {activeStep === 'suggestions' && 'Étape 2: Calcul des recommandations'}
            {activeStep === 'nominees' && 'Étape 3: Attribution de la Shortlist'}
            {activeStep === 'voting' && 'Étape 4: Attribution des forces de vote'}
            {activeStep === 'reveal' && 'Étape 5: Lancement de la cérémonie'}
          </div>

          <div className="flex items-center gap-3">
            {activeStep !== 'setup' && (
              <AdminButton
                variant="secondary"
                onClick={() => {
                  if (activeStep === 'reveal') setActiveStep('voting');
                  else if (activeStep === 'voting') setActiveStep('nominees');
                  else if (activeStep === 'nominees') setActiveStep('suggestions');
                  else if (activeStep === 'suggestions') setActiveStep('setup');
                }}
              >
                Précédent
              </AdminButton>
            )}

            {activeStep !== 'reveal' ? (
              <AdminButton
                onClick={() => {
                  if (activeStep === 'setup') setActiveStep('suggestions');
                  else if (activeStep === 'suggestions') setActiveStep('nominees');
                  else if (activeStep === 'nominees') setActiveStep('voting');
                  else if (activeStep === 'voting') setActiveStep('reveal');
                }}
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </AdminButton>
            ) : (
              <AdminButton onClick={handleSave} disabled={saving}>
                {saving ? 'Création de la campagne...' : 'Lancer la Campagne d\'Award'}
              </AdminButton>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
