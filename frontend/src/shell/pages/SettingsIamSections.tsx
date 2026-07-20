import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown, ArrowUp, Eye, EyeOff, KeyRound, Laptop, LogOut, RefreshCw, Save, ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { iamApi } from '@/features/iam/iam.api';
import type { IamAuditLog, IamSession } from '@/features/iam/iam.types';
import { getModules } from '../registry/module.registry';
import { useMenuStore } from '../stores/menu.store';
import { usePermissions } from '../services/permissions';

/**
 * Sprint 1 — IAM settings surfaces. Three sections mounted inside the
 * existing SettingsPage (no new page chrome, no duplicated layout):
 *
 *   SecuritySection — connected devices, revoke one / all, change password
 *   AuditSection    — filterable audit trail (audit.view)
 *   MenuSection     — Menu Builder: order + visibility, persisted to
 *                     iam_config "os.menu" (settings.configure)
 */

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-zinc-200">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleString('fr-FR') : '—');

// ── Security ─────────────────────────────────────────────────────
export function SecuritySection() {
  const [sessions, setSessions] = useState<IamSession[]>([]);
  const [busy, setBusy] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadSessions = useCallback(() => {
    iamApi.sessions.mine().then(setSessions).catch(() => setSessions([]));
  }, []);
  useEffect(loadSessions, [loadSessions]);

  const revoke = async (id: string) => {
    setBusy(true);
    try { await iamApi.sessions.revokeMine(id); loadSessions(); } finally { setBusy(false); }
  };
  const revokeAll = async () => {
    setBusy(true);
    try { await iamApi.sessions.revokeAllMine(); loadSessions(); } finally { setBusy(false); }
  };
  const changePassword = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await iamApi.changePassword(pwd.current, pwd.next);
      setMsg((res as { message?: string })?.message ?? 'Mot de passe modifié');
      setPwd({ current: '', next: '' });
    } catch (e) {
      setMsg((e as Error)?.message ?? 'Échec du changement de mot de passe');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <Card
        title="Appareils connectés"
        action={
          <Button variant="outline" size="sm" onClick={revokeAll} disabled={busy || sessions.length === 0}
            className="h-7 gap-1.5 border-zinc-800 bg-transparent text-[12px] text-zinc-300 hover:bg-zinc-900">
            <LogOut className="size-3.5" /> Déconnecter tous les autres appareils
          </Button>
        }
      >
        <ul className="divide-y divide-zinc-800/70">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <Laptop className="size-4 shrink-0 text-zinc-500" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-zinc-300">{s.userAgent ?? 'Appareil inconnu'}</p>
                  <p className="text-[11px] text-zinc-500">
                    {s.ip ?? 'IP inconnue'} · dernière activité {fmtDate(s.lastUsedAt ?? s.createdAt)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => revoke(s.id)} disabled={busy}
                className="h-7 text-[12px] text-zinc-400 hover:bg-zinc-900 hover:text-red-400">
                Révoquer
              </Button>
            </li>
          ))}
          {sessions.length === 0 && <li className="py-2 text-[13px] text-zinc-500">Aucune session active trouvée.</li>}
        </ul>
      </Card>

      <Card title="Changer le mot de passe">
        <div className="grid gap-2 md:grid-cols-2">
          <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe actuel"
            value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600" />
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} placeholder="Nouveau mot de passe (8+ caractères)"
              value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 pr-9 text-[13px] text-zinc-200 placeholder:text-zinc-600" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} aria-label="Afficher le mot de passe"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              {showPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <Button size="sm" onClick={changePassword}
            disabled={busy || pwd.current.length === 0 || pwd.next.length < 8}
            className="h-8 gap-1.5 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500">
            <KeyRound className="size-3.5" /> Mettre à jour
          </Button>
          {msg && <span className="text-[12px] text-zinc-400">{msg}</span>}
        </div>
      </Card>
    </div>
  );
}

// ── Audit ────────────────────────────────────────────────────────
export function AuditSection() {
  const [logs, setLogs] = useState<IamAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    iamApi.audit({ page, limit, ...(action ? { action } : {}) })
      .then((r) => { setLogs(r.data); setTotal(r.total); })
      .catch(() => { setLogs([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, action]);
  useEffect(load, [load]);

  return (
    <Card
      title={`Journal d’audit — ${total} entrée${total > 1 ? 's' : ''}`}
      action={
        <div className="flex items-center gap-2">
          <input value={action} placeholder="Filtrer par action (ex: auth.login)"
            onChange={(e) => { setPage(1); setAction(e.target.value); }}
            className="w-56 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600" />
          <Button variant="ghost" size="sm" onClick={load} className="h-7 text-zinc-400 hover:bg-zinc-900">
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12px]">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="py-1.5 pr-3 font-medium">Date</th>
              <th className="py-1.5 pr-3 font-medium">Acteur</th>
              <th className="py-1.5 pr-3 font-medium">Action</th>
              <th className="py-1.5 pr-3 font-medium">Cible</th>
              <th className="py-1.5 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {logs.map((l) => (
              <tr key={l.id} className="text-zinc-300">
                <td className="py-1.5 pr-3 whitespace-nowrap text-zinc-400">{fmtDate(l.createdAt)}</td>
                <td className="py-1.5 pr-3">{l.actorEmail ?? (l.actorId != null ? `#${l.actorId}` : '—')}</td>
                <td className="py-1.5 pr-3 font-mono text-emerald-400/90">{l.action}</td>
                <td className="py-1.5 pr-3 text-zinc-400">{l.targetType ? `${l.targetType} ${l.targetId ?? ''}` : '—'}</td>
                <td className="py-1.5 text-zinc-500">{l.ip ?? '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr><td colSpan={5} className="py-3 text-[13px] text-zinc-500">Aucune entrée.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {total > limit && (
        <div className="mt-3 flex items-center justify-between text-[12px] text-zinc-500">
          <span>Page {page} / {Math.ceil(total / limit)}</span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="h-7 border-zinc-800 bg-transparent text-[12px] text-zinc-300">Précédent</Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)}
              className="h-7 border-zinc-800 bg-transparent text-[12px] text-zinc-300">Suivant</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Menu Builder ─────────────────────────────────────────────────
export function MenuSection() {
  const { config, save, setLocal, hydrate } = useMenuStore();
  const { can } = usePermissions();
  const [saved, setSaved] = useState(false);
  useEffect(() => { void hydrate(); }, [hydrate]);

  const modules = getModules();
  const rank = new Map(config.order.map((slug, i) => [slug, i]));
  const ordered = [...modules].sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999));
  const hidden = new Set(config.hidden);
  const editable = can('settings.configure');

  const commit = (order: string[], hiddenList: string[]) =>
    setLocal({ ...config, order, hidden: hiddenList });

  const move = (slug: string, dir: -1 | 1) => {
    const order = ordered.map((m) => m.slug);
    const i = order.indexOf(slug);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    commit(order, [...hidden]);
  };
  const toggleVisible = (slug: string) => {
    const next = new Set(hidden);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    commit(ordered.map((m) => m.slug), [...next]);
  };
  const persist = async () => {
    await save({ ...config, order: ordered.map((m) => m.slug), hidden: [...hidden] });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card
      title="Menu Builder — modules de la barre latérale"
      action={editable && (
        <Button size="sm" onClick={persist}
          className="h-7 gap-1.5 bg-emerald-600 text-[12px] text-white hover:bg-emerald-500">
          <Save className="size-3.5" /> {saved ? 'Enregistré ✓' : 'Enregistrer pour tous'}
        </Button>
      )}
    >
      {!editable && (
        <p className="mb-2 text-[12px] text-zinc-500">
          Lecture seule — la permission « settings.configure » est requise pour modifier le menu.
        </p>
      )}
      <ul className="divide-y divide-zinc-800/70">
        {ordered.map((m, i) => (
          <li key={m.slug} className="flex items-center justify-between gap-3 py-2">
            <div className={cn('flex items-center gap-2.5', hidden.has(m.slug) && 'opacity-40')}>
              <m.icon className="size-4 text-zinc-500" />
              <span className="text-[13px] text-zinc-300">{m.label}</span>
              <span className="text-[11px] text-zinc-600">/{m.slug} · {m.domain}</span>
            </div>
            {editable && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => move(m.slug, -1)}
                  className="size-7 p-0 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"><ArrowUp className="size-3.5" /></Button>
                <Button variant="ghost" size="sm" disabled={i === ordered.length - 1} onClick={() => move(m.slug, 1)}
                  className="size-7 p-0 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"><ArrowDown className="size-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => toggleVisible(m.slug)}
                  className="size-7 p-0 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200">
                  {hidden.has(m.slug) ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-600">
        <ScrollText className="size-3" /> Persisté dans iam_config « os.menu » — appliqué à tous les utilisateurs au chargement du studio.
      </p>
    </Card>
  );
}
