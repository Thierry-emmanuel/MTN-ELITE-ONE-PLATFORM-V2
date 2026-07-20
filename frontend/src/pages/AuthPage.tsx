import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../services/api";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  FileText, ChevronRight, Loader2, AlertCircle, CheckCircle2,
  Shield, Upload, Briefcase,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "login" | "register";
type Role = "supporter" | "editor";

interface StoredUser {
  name: string;
  email: string;
  role: Role;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  bio?: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const saveUser = (user: StoredUser) => {
  localStorage.setItem("mtn_user", JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
};

// ─── Field component ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string; id: string; type?: string; placeholder?: string;
  icon?: React.ReactNode; value: string; onChange: (v: string) => void;
  error?: string; required?: boolean; hint?: string;
  as?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

const Field = ({ label, id, type = "text", placeholder, icon, value, onChange, error, required, hint, as = "input", options }: FieldProps) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">{icon}</span>
        )}
        {as === "textarea" ? (
          <textarea id={id} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={3}
            className={`w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/35 resize-none outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/10 ${error ? "border-destructive/60" : "border-border/60"} ${icon ? "pl-10" : ""}`} />
        ) : as === "select" ? (
          <select id={id} value={value} onChange={e => onChange(e.target.value)}
            className={`w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm text-foreground outline-none appearance-none cursor-pointer transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/10 ${error ? "border-destructive/60" : "border-border/60"} ${icon ? "pl-10" : ""}`}>
            {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input id={id} type={inputType} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
            className={`w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/10 ${error ? "border-destructive/60" : "border-border/60"} ${icon ? "pl-10" : ""} ${isPassword ? "pr-11" : ""}`} />
        )}
        {isPassword && (
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="h-3 w-3 shrink-0" />{error}</p>}
      {hint && !error && <p className="text-[11px] text-muted-foreground/50">{hint}</p>}
    </div>
  );
};

// ─── Password strength ────────────────────────────────────────────────────────
const PasswordStrength = ({ value }: { value: string }) => {
  if (!value) return null;
  const checks = [
    { label: "8 min.",     ok: value.length >= 8 },
    { label: "Majuscule",  ok: /[A-Z]/.test(value) },
    { label: "Chiffre",    ok: /[0-9]/.test(value) },
    { label: "Spécial",    ok: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = checks.filter(c => c.ok).length;
  const barColor = ["bg-border","bg-destructive","bg-destructive","bg-draw","bg-win"][score];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? barColor : "bg-border"}`} />)}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] flex items-center gap-1 transition-colors ${c.ok ? "text-win" : "text-muted-foreground/40"}`}>
            <CheckCircle2 className="h-2.5 w-2.5" />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Left panel ───────────────────────────────────────────────────────────────
const LeftPanel = ({ mode }: { mode: Mode }) => (
  <div className="hidden lg:flex flex-col relative overflow-hidden bg-[hsl(168,50%,6%)] w-[400px] shrink-0">
    <div className="absolute inset-0 field-pattern opacity-25" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/15 blur-[80px] pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-accent/8 blur-[60px] pointer-events-none" />

    <div className="relative z-10 flex flex-col h-full p-10">
      <Link to="/" className="flex items-center gap-3 mb-auto">
        <div className="h-10 w-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
          <span className="font-display font-bold text-accent">M1</span>
        </div>
        <div>
          <div className="font-display text-sm tracking-widest">MTN ELITE ONE</div>
          <div className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">Cameroon · 24/25</div>
        </div>
      </Link>

      <div className="my-auto">
        <div className="text-[11px] uppercase tracking-[.2em] text-accent font-bold mb-3">
          {mode === "login" ? "Bon retour parmi nous" : "Rejoignez la communauté"}
        </div>
        <h2 className="font-display text-5xl leading-[1.02] mb-5">
          {mode === "login" ? (
            <>LE FOOT<br />CAMEROUNAIS<br /><span className="text-gradient-gold">EN DIRECT</span></>
          ) : (
            <>VIVEZ<br />LE MATCH<br /><span className="text-gradient-gold">DIFFÉREMMENT</span></>
          )}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {mode === "login"
            ? "Accédez aux stats, résultats et awards de la MTN Elite One en temps réel."
            : "Créez votre compte et rejoignez des milliers de fans et professionnels du football camerounais."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40">
        {[{ n:"16", l:"Clubs" }, { n:"34", l:"Journées" }, { n:"500+", l:"Joueurs" }].map(s => (
          <div key={s.l}>
            <div className="font-display text-2xl text-accent">{s.n}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main AuthPage ────────────────────────────────────────────────────────────
export const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultMode: Mode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [role, setRole] = useState<Role>("supporter");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── MFA challenge state ──
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEmail, setMfaEmail]       = useState("");
  const [mfaCode, setMfaCode]         = useState("");

  // ── Login fields ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");

  // ── Register common fields ──
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [phone,    setPhone]    = useState("");

  // ── Editor-only fields ──
  const [jobTitle,      setJobTitle]      = useState("");
  const [organization,  setOrganization]  = useState("");
  const [bio,           setBio]           = useState("");

  const clearErrors = () => { setErrors({}); setServerError(""); };

  const switchMode = (m: Mode) => {
    setMode(m);
    clearErrors();
    setSuccess("");
    navigate(m === "login" ? "/login" : "/register", { replace: true });
  };

  // ── Validation ──
  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) e.loginEmail = "Email invalide";
    if (!loginPass) e.loginPass = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name = "Nom complet requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email invalide";
    if (password.length < 8) e.password = "Minimum 8 caractères";
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password)) e.password = "Doit contenir une majuscule et un chiffre";
    if (confirm !== password) e.confirm = "Les mots de passe ne correspondent pas";
    if (role === "editor") {
      if (!jobTitle.trim())     e.jobTitle     = "Titre requis";
      if (!organization.trim()) e.organization = "Organisation requise";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true); setServerError("");
    try {
      const { data } = await apiClient.post<
        { accessToken: string; refreshToken?: string; user: any } |
        { requiresMfa: true; email: string }
      >('/auth/login', { email: loginEmail, password: loginPass });

      // ── MFA gate ─────────────────────────────────────────────
      if ('requiresMfa' in data && data.requiresMfa) {
        setMfaRequired(true);
        setMfaEmail(data.email);
        return;
      }

      // ── Normal login ─────────────────────────────────────────
      const d = data as { accessToken: string; refreshToken?: string; user: any };
      localStorage.setItem('mtn_token', d.accessToken);
      if (d.refreshToken) localStorage.setItem('mtn_refresh', d.refreshToken);
      localStorage.setItem('mtn_user', JSON.stringify({
        name: `${d.user.firstName} ${d.user.lastName}`,
        email: d.user.email,
        role: d.user.role,
        createdAt: d.user.createdAt,
      }));
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (err: any) {
      setServerError(err?.message ?? 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim()) { setServerError('Saisissez votre code 2FA.'); return; }
    setLoading(true); setServerError("");
    try {
      const { data } = await apiClient.post<{ accessToken: string; refreshToken?: string; user: any }>(
        '/auth/login',
        { email: mfaEmail, password: loginPass, mfaCode },
      );
      localStorage.setItem('mtn_token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('mtn_refresh', data.refreshToken);
      localStorage.setItem('mtn_user', JSON.stringify({
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: data.user.role,
        createdAt: data.user.createdAt,
      }));
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (err: any) {
      setServerError(err?.message ?? 'Code 2FA invalide.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true); setServerError("");

    // Split the single "name" field into firstName + lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? name;
    const lastName  = nameParts.slice(1).join(' ') || firstName; // fallback if single word

    try {
      const endpoint = role === 'editor' ? '/auth/register/editor' : '/auth/register';
      const payload: Record<string, any> = {
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role: role === 'editor' ? 'editor' : 'user',
      };
      if (role === 'editor') {
        payload.agency        = organization;
        payload.mediaType     = jobTitle;
        payload.purpose       = bio || 'Non précisé';
        payload.cniNumber     = 'PENDING'; // placeholder — real file upload not yet implemented
      }
      await apiClient.post(endpoint, payload);
      setSuccess(
        role === 'editor'
          ? 'Compte éditeur créé ! Votre demande est en cours de vérification.'
          : 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      );
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      setServerError(err?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <div className="h-20 w-20 rounded-full bg-win/10 border border-win/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-win" />
          </div>
          <div>
            <h2 className="font-display text-3xl mb-2">{role === "editor" ? "DEMANDE ENVOYÉE" : "BIENVENUE !"}</h2>
            <p className="text-sm text-muted-foreground">{success}</p>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div className="h-full bg-win" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.8 }} />
          </div>
        </motion.div>
      </div>
    );
  }

  // ── MFA challenge screen ──
  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-background flex">
        <LeftPanel mode="login" />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[380px] space-y-6"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-2xl mb-1">VÉRIFICATION 2FA</h1>
                <p className="text-sm text-muted-foreground">
                  Ouvrez votre application d'authentification et saisissez le code à 6 chiffres.
                </p>
              </div>
            </div>

            {serverError && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{serverError}
              </div>
            )}

            <form onSubmit={handleMfaVerify} noValidate className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mfaCode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Code 2FA <span className="text-accent ml-1">*</span>
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl bg-surface-elevated border border-border/60 px-4 py-3.5 text-center text-2xl font-display tracking-[.3em] text-foreground outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <motion.button type="submit" disabled={loading || mfaCode.length < 6}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-bold tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'VÉRIFICATION...' : 'CONFIRMER'}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </motion.button>
            </form>

            <button
              onClick={() => { setMfaRequired(false); setMfaCode(''); setServerError(''); }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Retour à la connexion
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <LeftPanel mode={mode} />

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto flex items-start lg:items-center justify-center p-5 lg:p-10">
        <div className="w-full max-w-[420px] py-6">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-7 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
              <span className="font-display font-bold text-accent text-sm">M1</span>
            </div>
            <span className="font-display text-sm tracking-widest">MTN ELITE ONE</span>
          </Link>

          {/* Mode tabs */}
          <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 mb-7">
            {(["login", "register"] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === m ? "bg-accent text-accent-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"
                }`}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* ═══ LOGIN ═══════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                <h1 className="font-display text-3xl mb-1">CONNEXION</h1>
                <p className="text-sm text-muted-foreground mb-6">Accédez à votre espace MTN Elite One.</p>

                {serverError && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-xl px-4 py-3 mb-5">
                    <AlertCircle className="h-4 w-4 shrink-0" />{serverError}
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate className="space-y-4">
                  <Field label="Email" id="le" type="email" placeholder="votre@email.com"
                    icon={<Mail className="h-4 w-4" />} value={loginEmail} onChange={setLoginEmail}
                    error={errors.loginEmail} required />
                  <Field label="Mot de passe" id="lp" type="password" placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />} value={loginPass} onChange={setLoginPass}
                    error={errors.loginPass} required />
                  <div className="flex justify-end -mt-1">
                    <button type="button" className="text-xs text-accent hover:underline">Mot de passe oublié ?</button>
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-bold tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? "CONNEXION..." : "SE CONNECTER"}
                    {!loading && <ChevronRight className="h-4 w-4" />}
                  </motion.button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-5">
                  Pas encore de compte ?{" "}
                  <button onClick={() => switchMode("register")} className="text-accent hover:underline font-semibold">S'inscrire</button>
                </p>
              </motion.div>
            )}

            {/* ═══ REGISTER ════════════════════════════════ */}
            {mode === "register" && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h1 className="font-display text-3xl mb-1">INSCRIPTION</h1>
                <p className="text-sm text-muted-foreground mb-5">Créez votre compte en quelques secondes.</p>

                {/* Role selector */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {([
                    { id: "supporter" as Role, label: "Supporter", desc: "Fan du football", icon: <User className="h-5 w-5" /> },
                    { id: "editor"    as Role, label: "Éditeur",   desc: "Journaliste / Média", icon: <Briefcase className="h-5 w-5" /> },
                  ]).map(r => (
                    <button key={r.id} onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                        role === r.id
                          ? "border-accent bg-accent/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}>
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center ${role === r.id ? "bg-accent/15" : "bg-surface-elevated"}`}>
                        {r.icon}
                      </div>
                      <div className="text-center">
                        <div className="font-display text-xs tracking-wide">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</div>
                      </div>
                      {role === r.id && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </button>
                  ))}
                </div>

                {/* Editor notice */}
                <AnimatePresence>
                  {role === "editor" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed">
                        <Shield className="h-4 w-4 text-primary-glow shrink-0 mt-0.5" />
                        Les comptes éditeurs sont soumis à vérification manuelle sous 48h ouvrées.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {serverError && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-xl px-4 py-3 mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />{serverError}
                  </div>
                )}

                <form onSubmit={handleRegister} noValidate className="space-y-4">
                  {/* Common fields */}
                  <Field label="Nom complet" id="name" placeholder="Jean Mbarga"
                    icon={<User className="h-4 w-4" />} value={name} onChange={setName} error={errors.name} required />
                  <Field label="Email" id="email" type="email" placeholder="votre@email.com"
                    icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} error={errors.email} required />
                  <Field label="Téléphone" id="phone" placeholder="+237 6XX XXX XXX"
                    icon={<Phone className="h-4 w-4" />} value={phone} onChange={setPhone} />
                  <div className="space-y-1.5">
                    <Field label="Mot de passe" id="password" type="password" placeholder="••••••••"
                      icon={<Lock className="h-4 w-4" />} value={password} onChange={setPassword} error={errors.password} required />
                    <PasswordStrength value={password} />
                  </div>
                  <Field label="Confirmer le mot de passe" id="confirm" type="password" placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />} value={confirm} onChange={setConfirm} error={errors.confirm} required />

                  {/* Editor fields */}
                  <AnimatePresence>
                    {role === "editor" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden space-y-4"
                      >
                        <div className="h-px bg-border my-2" />
                        <div className="text-[10px] uppercase tracking-widest text-accent font-bold">Informations professionnelles</div>

                        <Field label="Titre / Poste" id="jobTitle"
                          as="select" value={jobTitle} onChange={setJobTitle} error={errors.jobTitle} required
                          icon={<Briefcase className="h-4 w-4" />}
                          options={[
                            { value: "",             label: "Sélectionner un poste…" },
                            { value: "journalist",   label: "Journaliste" },
                            { value: "analyst",      label: "Analyste football" },
                            { value: "commentator",  label: "Commentateur" },
                            { value: "photographer", label: "Photographe" },
                            { value: "videographer", label: "Vidéaste" },
                            { value: "blogger",      label: "Blogueur / Créateur" },
                            { value: "other",        label: "Autre" },
                          ]} />

                        <Field label="Organisation / Média" id="org" placeholder="Canal 2, Equinoxe TV…"
                          icon={<Building2 className="h-4 w-4" />} value={organization} onChange={setOrganization}
                          error={errors.organization} required />

                        <Field label="Bio courte" id="bio" as="textarea"
                          placeholder="Décrivez votre activité en quelques mots…"
                          icon={<FileText className="h-4 w-4" />} value={bio} onChange={setBio} />

                        {/* File upload UI only */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Pièce d'identité <span className="text-muted-foreground/40 normal-case font-normal">(optionnel)</span>
                          </label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-accent/40 transition-colors cursor-pointer group">
                            <Upload className="h-5 w-5 text-muted-foreground/40 group-hover:text-accent transition-colors mx-auto mb-1.5" />
                            <div className="text-xs text-muted-foreground">Glissez ou cliquez pour uploader</div>
                            <div className="text-[10px] text-muted-foreground/40 mt-0.5">PDF, JPG, PNG · max 5 MB</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-bold tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? "CRÉATION..." : role === "editor" ? "SOUMETTRE MA DEMANDE" : "CRÉER MON COMPTE"}
                    {!loading && <ChevronRight className="h-4 w-4" />}
                  </motion.button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-5">
                  Déjà un compte ?{" "}
                  <button onClick={() => switchMode("login")} className="text-accent hover:underline font-semibold">Se connecter</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;