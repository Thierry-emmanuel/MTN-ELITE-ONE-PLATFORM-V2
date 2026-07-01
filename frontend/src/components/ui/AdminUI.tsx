import { memo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Upload, Download, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';

// ─── AdminCard ────────────────────────────────────────────────────────────────
interface AdminCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  accent?: boolean;
}

export const AdminCard = memo(({ title, subtitle, children, className = '', action, noPadding, accent }: AdminCardProps) => (
  <div className={`bg-[#111820] border ${accent ? 'border-accent/20' : 'border-white/[0.06]'} rounded-2xl relative overflow-hidden shadow-2xl ${className}`}>
    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${accent ? 'via-accent/40' : 'via-white/8'} to-transparent pointer-events-none`} />
    {(title || subtitle || action) && (
      <div className={`flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.05]`}>
        <div>
          {title && <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">{title}</h3>}
          {subtitle && <p className="text-[10px] text-white/35 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    <div className={noPadding ? '' : 'p-6'}>{children}</div>
  </div>
));
AdminCard.displayName = 'AdminCard';

// ─── SwitchToggle ─────────────────────────────────────────────────────────────
interface SwitchToggleProps { checked: boolean; onChange: (val: boolean) => void; label?: string; }

export const SwitchToggle = memo(({ checked, onChange, label }: SwitchToggleProps) => (
  <label className="flex items-center gap-3 cursor-pointer select-none group">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div className={`w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-accent shadow-[0_0_10px_rgba(252,209,22,0.4)]' : 'bg-white/8 border border-white/10'}`} />
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full shadow-md transition-all duration-200 ${checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/60'}`} />
    </div>
    {label && <span className="text-xs text-white/60 font-medium group-hover:text-white/80 transition-colors">{label}</span>}
  </label>
));
SwitchToggle.displayName = 'SwitchToggle';

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'email' | 'url';
  placeholder?: string;
  value: string | number;
  onChange: (val: any) => void;
  options?: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  hint?: string;
}

export const FormField = memo(({ label, type = 'text', placeholder, value, onChange, options, error, required, hint }: FormFieldProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 flex items-center gap-1">
      {label}{required && <span className="text-accent">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 text-xs text-white placeholder:text-white/15 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition-all resize-none"
      />
    ) : type === 'select' ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-[#0d1420] border border-white/8 px-4 py-3 text-xs text-white outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#111820] text-white">{opt.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 text-xs text-white placeholder:text-white/15 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition-all"
      />
    )}
    {hint && !error && <span className="text-[9px] text-white/25">{hint}</span>}
    {error && <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium"><AlertCircle className="h-3 w-3" />{error}</span>}
  </div>
));
FormField.displayName = 'FormField';

// ─── AdminButton ──────────────────────────────────────────────────────────────
interface AdminButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
}

export const AdminButton = memo(({ children, onClick, type = 'button', variant = 'primary', className = '', disabled, loading, size = 'md' }: AdminButtonProps) => {
  const styles = {
    primary:   'bg-accent text-black font-bold hover:bg-yellow-300 shadow-[0_0_15px_rgba(252,209,22,0.15)] hover:shadow-[0_0_25px_rgba(252,209,22,0.35)]',
    secondary: 'bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20',
    danger:    'bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 hover:text-red-300',
    success:   'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold hover:bg-emerald-500/20',
    ghost:     'text-white/40 hover:text-white hover:bg-white/5',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-xs',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
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
  bgColor?: string;
  index: number;
  trend?: number;
  subtitle?: string;
}

export const DashboardStatCard = memo(({ label, value, icon: Icon, color, bgColor = 'bg-white/[0.04]', index, trend, subtitle }: DashboardStatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-[#111820] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group hover:border-white/12 transition-all"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent pointer-events-none" />
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</p>
        <p className={`font-display text-3xl font-bold tracking-tight ${color}`}>{value}</p>
        {subtitle && <p className="text-[10px] text-white/30">{subtitle}</p>}
      </div>
      <div className={`h-11 w-11 rounded-xl ${bgColor} border border-white/[0.06] grid place-items-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-[10px] font-semibold ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-white/30'}`}>
        {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        {Math.abs(trend)}% vs saison dernière
      </div>
    )}
  </motion.div>
));
DashboardStatCard.displayName = 'DashboardStatCard';

// ─── StatusBadge ──────────────────────────────────────────────────────────────
interface StatusBadgeProps { status: string; }
const STATUS_MAP: Record<string, string> = {
  OPEN:      'bg-amber-500/10 border border-amber-500/25 text-amber-400',
  CLOSED:    'bg-white/5 border border-white/8 text-white/35',
  ANNOUNCED: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400',
  PUBLISHED: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400',
  DRAFT:     'bg-white/5 border border-white/8 text-white/40',
  LIVE:      'bg-red-500/10 border border-red-500/25 text-red-400 animate-pulse',
  SCHEDULED: 'bg-sky-500/10 border border-sky-500/25 text-sky-400',
  FT:        'bg-white/5 border border-white/8 text-white/50',
  HT:        'bg-orange-500/10 border border-orange-500/25 text-orange-400',
  WATCHLIST: 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400',
  PROMOTED:  'bg-purple-500/10 border border-purple-500/25 text-purple-400',
  NATIONAL_TEAM: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400',
};
export const StatusBadge = memo(({ status }: StatusBadgeProps) => (
  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_MAP[status] || 'bg-white/5 text-white/35'}`}>{status}</span>
));
StatusBadge.displayName = 'StatusBadge';

// ─── DataTable ─────────────────────────────────────────────────────────────────
interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({ columns, data, keyField, onEdit, onDelete, emptyMessage = 'Aucune donnée', loading }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-16 text-center text-white/25 text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {columns.map((col) => (
              <th key={String(col.key)} className={`px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/30 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-wider text-white/30">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={String(row[keyField])}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-4 py-3 text-xs text-white/70 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white/50 hover:text-accent hover:border-accent/20 text-[10px] font-semibold transition-all">
                        Modifier
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="px-2.5 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/50 hover:text-red-400 hover:border-red-500/30 text-[10px] font-semibold transition-all">
                        Suppr.
                      </button>
                    )}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── BulkImportExport ─────────────────────────────────────────────────────────
interface BulkImportExportProps {
  entityName: string;
  data: any[];
  templateFields: string[];
  onImport: (rows: any[]) => Promise<void>;
  importLoading?: boolean;
}

export const BulkImportExport = memo(({ entityName, data, templateFields, onImport, importLoading }: BulkImportExportProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  // Export current data as CSV
  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => {
        const v = row[h];
        if (typeof v === 'object') return JSON.stringify(v).replace(/,/g, ';');
        return String(v ?? '').replace(/,/g, ';');
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/ /g, '_')}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export current data as JSON
  const handleExportJSON = () => {
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/ /g, '_')}_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download empty CSV template
  const handleDownloadTemplate = () => {
    const csv = templateFields.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/ /g, '_')}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse CSV/JSON file for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let rows: any[] = [];
    if (file.name.endsWith('.json')) {
      rows = JSON.parse(text);
    } else {
      const [header, ...lines] = text.trim().split('\n');
      const keys = header.split(',').map((k) => k.trim());
      rows = lines.filter(Boolean).map((line) => {
        const vals = line.split(',').map((v) => v.trim());
        return Object.fromEntries(keys.map((k, i) => [k, vals[i] ?? '']));
      });
    }
    await onImport(rows);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Export */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] uppercase tracking-wider text-white/30 mr-1 font-bold">Exporter</span>
        <AdminButton size="sm" variant="secondary" onClick={handleExportCSV} disabled={!data.length}>
          <Download className="h-3 w-3" /> CSV
        </AdminButton>
        <AdminButton size="sm" variant="secondary" onClick={handleExportJSON} disabled={!data.length}>
          <Download className="h-3 w-3" /> JSON
        </AdminButton>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Import */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] uppercase tracking-wider text-white/30 mr-1 font-bold">Importer</span>
        <AdminButton size="sm" variant="secondary" onClick={handleDownloadTemplate}>
          <Download className="h-3 w-3" /> Modèle
        </AdminButton>
        <label className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold cursor-pointer transition-all bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 ${importLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {importLoading ? <div className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" /> : <Upload className="h-3 w-3" />}
          CSV / JSON
          <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
});
BulkImportExport.displayName = 'BulkImportExport';

// ─── SectionHeader ─────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
}

export const SectionHeader = memo(({ title, subtitle, actions, icon: Icon }: SectionHeaderProps) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 grid place-items-center text-accent shrink-0">
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">{title}</h2>
        {subtitle && <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">{actions}</div>}
  </div>
));
SectionHeader.displayName = 'SectionHeader';

// ─── Toast (inline usage via useToast hook) ────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

export const Toast = memo(({ message, type, visible }: ToastProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-semibold shadow-2xl backdrop-blur-lg ${
          type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
          type === 'error'   ? 'bg-red-950/90 border-red-500/30 text-red-300' :
          'bg-sky-950/90 border-sky-500/30 text-sky-300'
        }`}
      >
        <div className={`h-2 w-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-red-400' : 'bg-sky-400'} animate-pulse`} />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
));
Toast.displayName = 'Toast';

// ─── StatBar ───────────────────────────────────────────────────────────────────
interface StatBarProps { label: string; value: number; max?: number; color?: string; }
export const StatBar = memo(({ label, value, max = 100, color = 'bg-accent' }: StatBarProps) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-white/50 font-medium">{label}</span>
        <span className="text-white/70 font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
});
StatBar.displayName = 'StatBar';

// ─── Paginator ─────────────────────────────────────────────────────────────────
interface PaginatorProps { page: number; total: number; limit: number; onChange: (p: number) => void; }
export const Paginator = memo(({ page, total, limit, onChange }: PaginatorProps) => {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-[10px] text-white/30">{((page - 1) * limit) + 1}–{Math.min(page * limit, total)} de {total}</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 grid place-items-center text-white/50 hover:text-white disabled:opacity-30 text-xs transition-all">‹</button>
        {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
          const p = Math.max(1, page - 2) + i;
          if (p > pages) return null;
          return (
            <button key={p} onClick={() => onChange(p)} className={`h-7 w-7 rounded-lg grid place-items-center text-xs font-bold transition-all ${p === page ? 'bg-accent text-black' : 'bg-white/5 border border-white/8 text-white/50 hover:text-white'}`}>{p}</button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 grid place-items-center text-white/50 hover:text-white disabled:opacity-30 text-xs transition-all">›</button>
      </div>
    </div>
  );
});
Paginator.displayName = 'Paginator';

// ─── MediaUploader ─────────────────────────────────────────────────────────────
interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  acceptType?: 'image' | 'video' | 'all';
  hint?: string;
  uploadUrl?: string;
}

export const MediaUploader = memo(({ label, value, onChange, acceptType = 'all', hint, uploadUrl = '/uploads/file' }: MediaUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      // IMPORTANT: do not hardcode 'Content-Type': 'multipart/form-data' here.
      // A multipart body requires a `boundary` param (e.g. "multipart/form-data; boundary=----XYZ"),
      // which only axios/the browser can generate from the FormData instance itself.
      // Hardcoding the header (or inheriting apiClient's default 'application/json') strips that
      // boundary, and NestJS's busboy-based FileInterceptor rejects the request with a 400
      // ("Multipart: Boundary not found"). Setting it to `undefined` here clears apiClient's
      // default header for this request and lets axios set the correct one automatically.
      const res = await apiClient.post(uploadUrl, formData, {
        headers: { 'Content-Type': undefined },
      });
      // The API returns a relative path, e.g. /uploads/clubs/logo/169...-abc.png
      // We prepend the backend's origin (stripping any /api or /api/v1 suffix) if it's not absolute,
      // since static files are served from the app root, not under the API prefix.
      const fileUrl = res.data.url.startsWith('http')
        ? res.data.url
        : `${apiClient.defaults.baseURL?.replace(/\/api(\/v\d+)?\/?$/, '') || 'http://localhost:3000'}${res.data.url}`;
      onChange(fileUrl);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Erreur lors de l\'upload du fichier.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const isVideo = value.match(/\.(mp4|mov|avi|webm|mpeg)$/i) || value.includes('/video');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</label>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[100px] transition-all duration-200 ${
          dragActive 
            ? 'border-accent bg-accent/5' 
            : value 
              ? 'border-white/10 bg-white/[0.02] hover:border-white/20' 
              : 'border-white/8 bg-white/[0.04] hover:border-white/12'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept={acceptType === 'image' ? 'image/*' : acceptType === 'video' ? 'video/*' : 'image/*,video/*'}
          onChange={handleFileChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Téléchargement...</span>
          </div>
        ) : value ? (
          <div className="w-full flex flex-col items-center gap-2">
            {isVideo ? (
              <video src={value} controls className="max-h-32 rounded-lg object-contain bg-black/40 w-full" onClick={e => e.stopPropagation()} />
            ) : (
              <img src={value} alt="Preview" className="max-h-32 rounded-lg object-contain bg-white/5" />
            )}
            <div className="text-center">
              <p className="text-[9px] text-white/40 truncate max-w-[200px]">{value.split('/').pop()}</p>
              <p className="text-[9px] text-accent font-bold uppercase tracking-wider mt-1">Cliquez ou glissez pour remplacer</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-white/60 font-semibold">
              Glissez-déposez votre fichier ici, ou <span className="text-accent hover:underline">parcourez</span>
            </p>
            <p className="text-[9px] text-white/25 mt-1">
              {acceptType === 'image' ? 'Images (JPEG, PNG, WEBP, GIF)' : acceptType === 'video' ? 'Vidéos (MP4, MOV, AVI)' : 'Images et Vidéos'} jusqu'à 50 Mo
            </p>
          </div>
        )}
      </div>
      {hint && <span className="text-[9px] text-white/25">{hint}</span>}
    </div>
  );
});
MediaUploader.displayName = 'MediaUploader';