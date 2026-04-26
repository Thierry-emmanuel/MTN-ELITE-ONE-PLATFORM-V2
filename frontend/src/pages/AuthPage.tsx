import { useState, useRef, useEffect } from "react";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  CreditCard, FileText, ChevronRight, Loader2, AlertCircle,
  CheckCircle2, ArrowLeft, Shield, Newspaper,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
type Mode    = "login" | "register";
type Role    = "user" | "editor";
type Step    = 1 | 2; // editor registration has 2 steps

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  hint?: string;
  as?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

// ─── Reusable Field ─────────────────────────────────────────────────────────
const Field = ({
  label, id, type = "text", placeholder, icon, value, onChange,
  error, required, hint, as = "input", options,
}: FieldProps) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
            {icon}
          </span>
        )}

        {as === "textarea" ? (
          <textarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className={`w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none transition-all outline-none
              focus:border-accent/60 focus:ring-2 focus:ring-accent/10
              ${error ? "border-destructive/60" : "border-border/60"}
              ${icon ? "pl-10" : ""}`}
          />
        ) : as === "select" ? (
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm text-foreground transition-all outline-none appearance-none cursor-pointer
              focus:border-accent/60 focus:ring-2 focus:ring-accent/10
              ${error ? "border-destructive/60" : "border-border/60"}
              ${icon ? "pl-10" : ""}`}
          >
            {options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all outline-none
              focus:border-accent/60 focus:ring-2 focus:ring-accent/10
              ${error ? "border-destructive/60" : "border-border/60"}
              ${icon ? "pl-10" : ""}
              ${isPassword ? "pr-11" : ""}`}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/60">{hint}</p>
      )}
    </div>
  );
};

// ─── Password strength ──────────────────────────────────────────────────────
const PasswordStrength = ({ value }: { value: string }) => {
  const checks = [
    { label: "8 caractères min.", ok: value.length >= 8 },
    { label: "Majuscule",         ok: /[A-Z]/.test(value) },
    { label: "Chiffre",           ok: /[0-9]/.test(value) },
    { label: "Caractère spécial", ok: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-destructive", "bg-destructive", "bg-draw", "bg-win", "bg-win"];
  const labels = ["", "Faible", "Moyen", "Fort", "Très fort"];

  if (!value) return null;
  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-border"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {checks.map((c) => (
            <span key={c.label} className={`text-[10px] flex items-center gap-1 transition-colors ${c.ok ? "text-win" : "text-muted-foreground/50"}`}>
              <CheckCircle2 className="h-2.5 w-2.5" />{c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[10px] font-semibold ${colors[score].replace("bg-", "text-")}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Left panel decoration ───────────────────────────────────────────────────
const LeftPanel = () => (
  <div className="hidden lg:flex flex-col relative overflow-hidden bg-[hsl(168,50%,7%)] w-[420px] shrink-0">
    {/* Field pattern background */}
    <div className="absolute inset-0 field-pattern opacity-30" />
    {/* Green glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-accent/10 blur-[60px] pointer-events-none" />

    {/* Diagonal accent stripe */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -right-24 top-0 bottom-0 w-48 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent skew-x-6" />
    </div>

    <div className="relative z-10 flex flex-col h-full p-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-auto">
        <div className="h-11 w-11 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shadow-glow">
          <span className="font-display font-bold text-accent text-lg">M1</span>
        </div>
        <div>
          <div className="font-display text-sm tracking-widest text-foreground">MTN ELITE ONE</div>
          <div className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">Cameroon · Saison 24/25</div>
        </div>
      </div>

      {/* Headline */}
      <div className="my-auto">
        <div className="text-[11px] uppercase tracking-[.2em] text-accent font-semibold mb-3">
          Bienvenue sur la plateforme
        </div>
        <h2 className="font-display text-5xl leading-[1.05] text-foreground mb-6">
          LE FOOTBALL<br />
          <span className="text-gradient-gold">CAMEROUNAIS</span><br />
          EN DIRECT
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Suivez les matchs, les classements et les stats de l'Elite One en temps réel. Rejoignez la communauté des fans du football camerounais.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/40">
        {[
          { n: "16",   l: "Clubs" },
          { n: "34",   l: "Journées" },
          { n: "500+", l: "Joueurs" },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-display text-2xl text-accent">{s.n}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Step indicator ─────────────────────────────────────────────────────────
const StepIndicator = ({ step }: { step: Step }) => (
  <div className="flex items-center gap-3 mb-8">
    {[1, 2].map((s) => (
      <div key={s} className="flex items-center gap-2">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all
          ${step >= s
            ? "bg-accent text-accent-foreground border-accent"
            : "bg-surface-elevated text-muted-foreground border-border"}`}>
          {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
        </div>
        <span className={`text-xs font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
          {s === 1 ? "Informations" : "Accréditation"}
        </span>
        {s === 1 && <div className={`h-px w-8 ${step > 1 ? "bg-accent" : "bg-border"}`} />}
      </div>
    ))}
  </div>
);

// ─── Main AuthPage ────────────────────────────────────────────────────────────
export const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("user");
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // ── Form state ─────────────────────────────────────────────
  // Login
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register common
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName,  setRegLastName]  = useState("");
  const [regEmail,     setRegEmail]     = useState("");
  const [regPhone,     setRegPhone]     = useState("");
  const [regPassword,  setRegPassword]  = useState("");
  const [regConfirm,   setRegConfirm]   = useState("");

  // Register editor
  const [edCni,       setEdCni]       = useState("");
  const [edAgency,    setEdAgency]    = useState("");
  const [edMediaType, setEdMediaType] = useState("");
  const [edPurpose,   setEdPurpose]   = useState("");
  const [edPressCard, setEdPressCard] = useState("");

  // ── Validation errors ──────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErrors = () => { setErrors({}); setServerError(""); };

  const switchMode = (m: Mode) => {
    setMode(m); setStep(1); clearErrors(); setSuccess("");
  };

  const switchRole = (r: Role) => {
    setRole(r); setStep(1); clearErrors();
  };

  // Scroll form top on step change
  useEffect(() => {
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ── Validators ─────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!regFirstName.trim()) e.firstName = "Prénom requis";
    if (!regLastName.trim())  e.lastName  = "Nom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) e.email = "Email invalide";
    if (regPassword.length < 8) e.password = "Minimum 8 caractères";
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(regPassword))
      e.password = "Doit contenir une majuscule et un chiffre";
    if (regConfirm !== regPassword) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!edCni.trim())       e.cni       = "Numéro CNI requis";
    if (!edAgency.trim())    e.agency    = "Agence requise";
    if (!edMediaType)        e.mediaType = "Type de média requis";
    if (!edPurpose.trim())   e.purpose   = "Motif requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateLogin = (): boolean => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) e.loginEmail = "Email invalide";
    if (!loginPassword) e.loginPassword = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit handlers ────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true); setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de connexion");
      localStorage.setItem("access_token", data.accessToken);
      window.location.href = "/";
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    if (role === "user") submitRegisterUser();
    else setStep(2);
  };

  const submitRegisterUser = async () => {
    setLoading(true); setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName, lastName: regLastName,
          email: regEmail, phone: regPhone,
          password: regPassword, role: "user",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
      setSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true); setServerError("");
    try {
      const res = await fetch("/api/auth/register/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName, lastName: regLastName,
          email: regEmail, phone: regPhone,
          password: regPassword, role: "editor",
          cniNumber: edCni, agency: edAgency,
          mediaType: edMediaType, purpose: edPurpose,
          pressCardNumber: edPressCard,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
      setSuccess("Demande soumise ! Votre compte éditeur sera activé après vérification par notre équipe.");
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Success screen ────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-win/10 border border-win/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-win" />
          </div>
          <div>
            <h2 className="font-display text-3xl text-foreground mb-3">
              {role === "editor" ? "DEMANDE ENVOYÉE" : "COMPTE CRÉÉ"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{success}</p>
          </div>
          <button
            onClick={() => { setSuccess(""); setMode("login"); }}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-display font-semibold tracking-wider hover:opacity-90 transition-opacity"
          >
            SE CONNECTER
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      <LeftPanel />

      {/* Right — form panel */}
      <div
        ref={formRef as any}
        className="flex-1 overflow-y-auto flex items-start lg:items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-[440px] py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
              <span className="font-display font-bold text-accent">M1</span>
            </div>
            <span className="font-display text-sm tracking-widest">MTN ELITE ONE</span>
          </div>

          {/* ── Mode tabs ── */}
          <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 mb-8">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all
                  ${mode === m
                    ? "bg-accent text-accent-foreground shadow-gold"
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* ═══ LOGIN ═══════════════════════════════════════ */}
          {mode === "login" && (
            <form onSubmit={handleLogin} noValidate className="space-y-5">
              <div>
                <h1 className="font-display text-3xl text-foreground">CONNEXION</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Bienvenue. Connectez-vous à votre compte.
                </p>
              </div>

              {serverError && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />{serverError}
                </div>
              )}

              <Field label="Email" id="login-email" type="email"
                placeholder="votre@email.com" icon={<Mail className="h-4 w-4" />}
                value={loginEmail} onChange={setLoginEmail} error={errors.loginEmail} required />

              <Field label="Mot de passe" id="login-password" type="password"
                placeholder="••••••••" icon={<Lock className="h-4 w-4" />}
                value={loginPassword} onChange={setLoginPassword} error={errors.loginPassword} required />

              <div className="flex justify-end">
                <button type="button" className="text-xs text-accent hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "CONNEXION..." : "SE CONNECTER"}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => switchMode("register")} className="text-accent hover:underline font-medium">
                  S'inscrire
                </button>
              </p>
            </form>
          )}

          {/* ═══ REGISTER ════════════════════════════════════ */}
          {mode === "register" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-foreground">INSCRIPTION</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre compte pour rejoindre la communauté.
                </p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => switchRole("user")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${role === "user"
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center
                    ${role === "user" ? "bg-accent/15" : "bg-surface-elevated"}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-sm tracking-wide">SUPPORTER</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Fans & suiveurs</div>
                  </div>
                  {role === "user" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1" />
                  )}
                </button>

                <button
                  onClick={() => switchRole("editor")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${role === "editor"
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center
                    ${role === "editor" ? "bg-accent/15" : "bg-surface-elevated"}`}>
                    <Newspaper className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-sm tracking-wide">ÉDITEUR</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Journaliste / Média</div>
                  </div>
                  {role === "editor" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1" />
                  )}
                </button>
              </div>

              {/* Editor badge */}
              {role === "editor" && (
                <div className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl p-4">
                  <Shield className="h-4 w-4 text-primary-glow shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Les comptes éditeurs nécessitent une vérification manuelle. Votre demande sera traitée sous 48h.
                  </p>
                </div>
              )}

              {serverError && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />{serverError}
                </div>
              )}

              {/* ── STEP 1 : Common info ── */}
              {(step === 1) && (
                <form onSubmit={handleRegisterStep1} noValidate className="space-y-4">
                  {role === "editor" && <StepIndicator step={1} />}

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Prénom" id="firstName" placeholder="Jean"
                      icon={<User className="h-4 w-4" />}
                      value={regFirstName} onChange={setRegFirstName} error={errors.firstName} required />
                    <Field label="Nom" id="lastName" placeholder="Mbarga"
                      value={regLastName} onChange={setRegLastName} error={errors.lastName} required />
                  </div>

                  <Field label="Email" id="reg-email" type="email" placeholder="votre@email.com"
                    icon={<Mail className="h-4 w-4" />}
                    value={regEmail} onChange={setRegEmail} error={errors.email} required />

                  <Field label="Téléphone" id="phone" placeholder="+237 6XX XXX XXX"
                    icon={<Phone className="h-4 w-4" />}
                    value={regPhone} onChange={setRegPhone} />

                  <div className="space-y-2">
                    <Field label="Mot de passe" id="reg-password" type="password" placeholder="••••••••"
                      icon={<Lock className="h-4 w-4" />}
                      value={regPassword} onChange={setRegPassword} error={errors.password} required />
                    <PasswordStrength value={regPassword} />
                  </div>

                  <Field label="Confirmer le mot de passe" id="confirm" type="password" placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={regConfirm} onChange={setRegConfirm} error={errors.confirm} required />

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {role === "editor"
                      ? (loading ? "CHARGEMENT..." : "SUIVANT →")
                      : (loading ? "CRÉATION..." : "CRÉER MON COMPTE")}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    Déjà un compte ?{" "}
                    <button type="button" onClick={() => switchMode("login")} className="text-accent hover:underline font-medium">
                      Se connecter
                    </button>
                  </p>
                </form>
              )}

              {/* ── STEP 2 : Editor accreditation ── */}
              {step === 2 && role === "editor" && (
                <form onSubmit={handleRegisterStep2} noValidate className="space-y-4">
                  <StepIndicator step={2} />

                  <button
                    type="button"
                    onClick={() => { setStep(1); clearErrors(); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Retour
                  </button>

                  <Field label="Numéro CNI" id="cni" placeholder="123456789"
                    icon={<CreditCard className="h-4 w-4" />}
                    value={edCni} onChange={setEdCni} error={errors.cni} required
                    hint="Carte nationale d'identité camerounaise" />

                  <Field label="Agence / Média" id="agency" placeholder="Canal 2, Equinoxe TV…"
                    icon={<Building2 className="h-4 w-4" />}
                    value={edAgency} onChange={setEdAgency} error={errors.agency} required />

                  <Field
                    label="Type de média" id="mediaType"
                    as="select"
                    value={edMediaType} onChange={setEdMediaType} error={errors.mediaType} required
                    options={[
                      { value: "",        label: "Sélectionner un type…" },
                      { value: "tv",      label: "Télévision" },
                      { value: "radio",   label: "Radio" },
                      { value: "presse",  label: "Presse écrite" },
                      { value: "digital", label: "Digital / Web" },
                      { value: "photo",   label: "Photographe" },
                      { value: "other",   label: "Autre" },
                    ]}
                  />

                  <Field label="N° Carte de presse" id="pressCard" placeholder="CP-XXXX (optionnel)"
                    icon={<Shield className="h-4 w-4" />}
                    value={edPressCard} onChange={setEdPressCard}
                    hint="Optionnel — accélère la vérification" />

                  <Field
                    label="Motif de la demande" id="purpose"
                    as="textarea"
                    placeholder="Décrivez votre activité et pourquoi vous souhaitez accéder à l'espace éditeur…"
                    icon={<FileText className="h-4 w-4" />}
                    value={edPurpose} onChange={setEdPurpose} error={errors.purpose} required />

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? "ENVOI EN COURS..." : "SOUMETTRE LA DEMANDE"}
                    {!loading && <ChevronRight className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;