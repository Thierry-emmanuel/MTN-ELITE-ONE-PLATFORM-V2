import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Send, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { layoutApi } from "@/services/layoutApi";

/* ─── Contact Info Card ─────────────────────────────────────────────────────── */
const ContactInfoItem = ({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) => (
  <div className="flex items-start gap-4 group">
    <div className="h-10 w-10 rounded-2xl bg-accent/10 border border-accent/20 grid place-items-center shrink-0 group-hover:bg-accent/20 transition-colors">
      <Icon className="h-4 w-4 text-accent" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{label}</p>
      {href ? (
        <a href={href} className="text-sm text-white/80 hover:text-white transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-sm text-white/80">{value}</p>
      )}
    </div>
  </div>
);

/* ─── Main Contact Page ─────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus("error");
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    setStatus("loading");
    try {
      await layoutApi.submitContact(form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Erreur lors de l'envoi. Veuillez réessayer.");
    }
  };

  const inputBase =
    "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all";

  return (
    <div className="min-h-screen bg-[#05140B] text-white">
      {/* ── Hero section ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-20 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#008751]/5 blur-[100px]" />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent mb-6">
              <Mail className="h-3 w-3" />
              Contactez-nous
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Nous sommes à votre<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCD116] to-[#008751]">
                écoute
              </span>
            </h1>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Une question, un partenariat ou un retour sur la plateforme ? Écrivez-nous et nous vous répondrons dans les plus brefs délais.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">

          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-6">
              <h2 className="font-display text-base uppercase tracking-widest text-accent">Informations</h2>
              <ContactInfoItem
                icon={Mail}
                label="Email officiel"
                value="contact@mtneliteone.cm"
                href="mailto:contact@mtneliteone.cm"
              />
              <ContactInfoItem
                icon={Phone}
                label="Téléphone"
                value="+237 6XX XXX XXX"
                href="tel:+237600000000"
              />
              <ContactInfoItem
                icon={MapPin}
                label="Adresse"
                value="Yaoundé, Cameroun — FECAFOOT"
              />
            </div>

            {/* Hours */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <h2 className="font-display text-base uppercase tracking-widest text-accent mb-4">Disponibilité</h2>
              {[
                { day: "Lun – Ven", time: "08:00 – 18:00" },
                { day: "Samedi",    time: "09:00 – 14:00" },
                { day: "Dimanche", time: "Fermé" },
              ].map(({ day, time }) => (
                <div key={day} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-xs">
                  <span className="text-white/50">{day}</span>
                  <span className={time === "Fermé" ? "text-red-400" : "text-white/80 font-semibold"}>{time}</span>
                </div>
              ))}
            </div>

            {/* Cameroon flag accent */}
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-[#008751]" />
              <div className="h-1 flex-1 rounded-full bg-[#FCD116]" />
              <div className="h-1 flex-1 rounded-full bg-[#CE1126]" />
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 lg:p-8">
              <h2 className="font-display text-base uppercase tracking-widest text-accent mb-6">Envoyer un message</h2>

              {/* Success state */}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-10 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Message envoyé !</p>
                    <p className="text-sm text-white/50">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-[11px] text-accent/70 hover:text-accent underline underline-offset-2 transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              )}

              {/* Form */}
              {status !== "success" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Nom complet</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jean Mbarga"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Adresse e-mail</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jean@example.cm"
                        className={inputBase}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Sujet</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={inputBase}
                    >
                      <option value="" className="bg-[#05140B]">Choisissez un sujet…</option>
                      <option value="Partenariat" className="bg-[#05140B]">Partenariat</option>
                      <option value="Presse & Médias" className="bg-[#05140B]">Presse & Médias</option>
                      <option value="Support technique" className="bg-[#05140B]">Support technique</option>
                      <option value="Suggestion" className="bg-[#05140B]">Suggestion</option>
                      <option value="Autre" className="bg-[#05140B]">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Décrivez votre demande en détail…"
                      className={`${inputBase} resize-none`}
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-black font-bold text-sm hover:bg-accent/90 disabled:opacity-60 transition-all shadow-[0_4px_20px_rgba(252,209,22,0.25)] hover:shadow-[0_4px_28px_rgba(252,209,22,0.35)]"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</>
                    ) : (
                      <><Send className="h-4 w-4" /> Envoyer le message</>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-white/20">
                    En envoyant ce message, vous acceptez que vos données soient traitées conformément à notre politique de confidentialité.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
