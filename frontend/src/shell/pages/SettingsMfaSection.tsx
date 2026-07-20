import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../../services/api';
import {
  Shield, ShieldCheck, ShieldOff, QrCode, CheckCircle2,
  AlertCircle, Loader2, KeyRound, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type MfaStep = 'idle' | 'setup_qr' | 'setup_verify' | 'disable_verify';

interface Props {
  mfaEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

// ─── Sub-component: Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ enabled }: { enabled: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
      enabled
        ? 'bg-win/10 text-win border-win/30'
        : 'bg-muted-foreground/8 text-muted-foreground border-border/50'
    }`}
  >
    {enabled ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
    {enabled ? 'Activé' : 'Désactivé'}
  </span>
);

// ─── Sub-component: Code Input ────────────────────────────────────────────────
const CodeInput = ({
  value,
  onChange,
  label = 'Code 2FA',
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
      {label} <span className="text-accent ml-1">*</span>
    </label>
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="000000"
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      className="w-full rounded-xl bg-surface-elevated border border-border/60 px-4 py-3.5 text-center text-2xl font-display tracking-[.3em] text-foreground outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
    />
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export const SettingsMfaSection = ({ mfaEnabled: initialEnabled, onStatusChange }: Props) => {
  const [mfaEnabled, setMfaEnabled] = useState(initialEnabled);
  const [step, setStep]             = useState<MfaStep>('idle');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [qrDataUrl, setQrDataUrl]   = useState('');
  const [code, setCode]             = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleStartSetup = async () => {
    clearMessages();
    setLoading(true);
    try {
      const { data } = await apiClient.post<{ secret: string; qrDataUrl: string }>(
        '/auth/mfa/generate',
      );
      setQrDataUrl(data.qrDataUrl);
      setStep('setup_qr');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la génération du QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { setError('Code à 6 chiffres requis.'); return; }
    clearMessages();
    setLoading(true);
    try {
      await apiClient.post('/auth/mfa/enable', { code });
      setMfaEnabled(true);
      setStep('idle');
      setCode('');
      setQrDataUrl('');
      setSuccess('Authentification à deux facteurs activée avec succès.');
      onStatusChange?.(true);
    } catch (err: any) {
      setError(err?.message ?? 'Code invalide. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { setError('Code à 6 chiffres requis.'); return; }
    clearMessages();
    setLoading(true);
    try {
      await apiClient.post('/auth/mfa/disable', { code });
      setMfaEnabled(false);
      setStep('idle');
      setCode('');
      setSuccess('Authentification à deux facteurs désactivée.');
      onStatusChange?.(false);
    } catch (err: any) {
      setError(err?.message ?? 'Code invalide. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('idle');
    setCode('');
    setQrDataUrl('');
    clearMessages();
  };

  return (
    <div className="rounded-2xl bg-surface border border-border/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5 text-accent" />
          </div>
          <div>
            <div className="font-display text-sm tracking-wide">Authentification à deux facteurs</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Sécurisez votre compte avec une application TOTP (Google Authenticator, Authy…)
            </div>
          </div>
        </div>
        <StatusBadge enabled={mfaEnabled} />
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Global messages */}
        <AnimatePresence>
          {error && (
            <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </motion.div>
          )}
          {success && (
            <motion.div key="ok" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-win/10 border border-win/30 text-win text-xs rounded-xl px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step: Idle ──────────────────────────────────────────── */}
        {step === 'idle' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {mfaEnabled
                ? 'Le 2FA est actif sur votre compte. Chaque connexion nécessitera un code de vérification en plus de votre mot de passe.'
                : 'Activez le 2FA pour ajouter une couche de sécurité supplémentaire. Un code temporaire sera requis à chaque connexion.'}
            </p>
            <motion.button
              onClick={mfaEnabled ? () => { resetFlow(); setStep('disable_verify'); } : handleStartSetup}
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 ${
                mfaEnabled
                  ? 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20'
                  : 'bg-accent text-accent-foreground hover:opacity-90'
              }`}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                mfaEnabled ? <ShieldOff className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />
              )}
              {mfaEnabled ? 'Désactiver le 2FA' : 'Configurer le 2FA'}
            </motion.button>
          </div>
        )}

        {/* ── Step: QR Code display ───────────────────────────────── */}
        {step === 'setup_qr' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* QR */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code 2FA"
                    className="h-40 w-40 rounded-xl border border-border bg-white p-2"
                  />
                ) : (
                  <div className="h-40 w-40 rounded-xl border border-border bg-surface-elevated flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Scanner avec votre app</span>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground text-sm">Comment configurer :</p>
                {[
                  'Ouvrez Google Authenticator, Authy ou une app TOTP compatible.',
                  'Appuyez sur "+" puis "Scanner un QR code".',
                  'Scannez le code QR ci-contre.',
                  'Saisissez le code à 6 chiffres généré pour confirmer.',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold mt-px">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-xs">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <form onSubmit={handleEnableMfa} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <CodeInput value={code} onChange={setCode} label="Code de confirmation" />
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={resetFlow}
                  className="px-4 py-3 rounded-xl border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Annuler
                </button>
                <motion.button type="submit" disabled={loading || code.length < 6}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  {loading ? 'Activation...' : 'Activer le 2FA'}
                  {!loading && <ChevronRight className="h-3.5 w-3.5" />}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Step: Disable verify ────────────────────────────────── */}
        {step === 'disable_verify' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3 bg-destructive/8 border border-destructive/25 rounded-xl p-4">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pour désactiver le 2FA, confirmez votre identité en saisissant un code valide depuis votre application d'authentification.
              </p>
            </div>

            <form onSubmit={handleDisableMfa} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <CodeInput value={code} onChange={setCode} label="Code 2FA de confirmation" />
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={resetFlow}
                  className="px-4 py-3 rounded-xl border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Annuler
                </button>
                <motion.button type="submit" disabled={loading || code.length < 6}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-destructive/80 text-white text-xs font-bold uppercase tracking-widest hover:bg-destructive transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                  {loading ? 'Désactivation...' : 'Désactiver'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};
