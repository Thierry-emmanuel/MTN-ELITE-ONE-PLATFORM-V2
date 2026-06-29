import { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// ─── AdminCard ────────────────────────────────────────────────────────────────
interface AdminCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const AdminCard = memo(({ title, subtitle, children, className = '', action }: AdminCardProps) => (
  <div className={`bg-[#151D24] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    {(title || subtitle || action) && (
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          {title && <h3 className="font-display text-lg text-white uppercase tracking-wider">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
));
AdminCard.displayName = 'AdminCard';

// ─── SwitchToggle ─────────────────────────────────────────────────────────────
interface SwitchToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export const SwitchToggle = memo(({ checked, onChange, label }: SwitchToggleProps) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-accent' : 'bg-white/10 border border-white/10'}`} />
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
    {label && <span className="text-xs text-white/80 font-medium">{label}</span>}
  </label>
));
SwitchToggle.displayName = 'SwitchToggle';

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  value: string | number;
  onChange: (val: any) => void;
  options?: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}

export const FormField = memo(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  options,
  error,
  required,
}: FormFieldProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
      {label} {required && <span className="text-accent">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all resize-none"
      />
    ) : type === 'select' ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all appearance-none cursor-pointer"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#151D24] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all"
      />
    )}
    {error && <span className="text-[10px] text-destructive/80 font-medium">{error}</span>}
  </div>
));
FormField.displayName = 'FormField';

// ─── AdminButton ──────────────────────────────────────────────────────────────
interface AdminButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export const AdminButton = memo(({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
}: AdminButtonProps) => {
  const styles = {
    primary: 'bg-accent text-black font-bold hover:bg-accent/90 shadow-[0_0_15px_rgba(252,209,22,0.2)] hover:shadow-[0_0_25px_rgba(252,209,22,0.4)]',
    secondary: 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-600 text-white font-semibold hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.2)]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
});
AdminButton.displayName = 'AdminButton';

// ─── DashboardStatCard ────────────────────────────────────────────────────────
interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  index: number;
}

export const DashboardStatCard = memo(({ label, value, icon: Icon, color, index }: DashboardStatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="bg-[#151D24] border border-white/5 rounded-2xl p-5 relative overflow-hidden"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
        <p className="font-display text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl bg-white/5 border border-white/5 grid place-items-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
));
DashboardStatCard.displayName = 'DashboardStatCard';
