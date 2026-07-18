import { LayoutGrid, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { WidgetFrame } from '../components/WidgetFrame';
import { getWidget, getWidgets } from '../registry/widget.registry';
import { useWorkspaceStore } from '../stores/workspace.store';
import { resolveTemplate } from './templates';
import { useT } from '../i18n';

/**
 * Workspace Engine — a role-agnostic homepage compositor. It knows
 * nothing about journalists or scouts; it knows widgets, layouts and
 * templates. Resolution: user layout → role template → template.default.
 */
export function WorkspaceEngine({ roleTemplateId }: { roleTemplateId?: string }) {
  const t = useT();
  const { layout, editMode, setEditMode, setLayout, move, resize, removeAt, add, reset } = useWorkspaceStore();
  const effective = layout ?? resolveTemplate(roleTemplateId).widgets;
  const available = getWidgets().filter((w) => !effective.some((p) => p.widgetId === w.id));

  const ensureOwned = () => { if (!layout) setLayout(effective); };

  return (
    <DashboardLayout
      toolbar={
        <>
          <h1 className="font-sans text-[15px] font-bold tracking-tight text-zinc-100">Workspace</h1>
          <div className="flex items-center gap-1.5">
            {editMode && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={available.length === 0}
                      className="h-8 gap-1.5 border-zinc-800 bg-transparent text-[13px] text-zinc-300 hover:bg-zinc-900">
                      <Plus className="size-3.5" /> {t('workspace.addWidget')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                    {available.map((w) => (
                      <DropdownMenuItem key={w.id} className="text-[13px] focus:bg-zinc-800"
                        onSelect={() => { ensureOwned(); add(w.id, w.defaultSize); }}>
                        {w.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" onClick={reset}
                  className="h-8 gap-1.5 text-[13px] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200">
                  <RotateCcw className="size-3.5" /> {t('workspace.reset')}
                </Button>
              </>
            )}
            <Button variant={editMode ? 'default' : 'outline'} size="sm"
              onClick={() => { ensureOwned(); setEditMode(!editMode); }}
              className={editMode
                ? 'h-8 bg-emerald-600 text-[13px] text-white hover:bg-emerald-500'
                : 'h-8 gap-1.5 border-zinc-800 bg-transparent text-[13px] text-zinc-300 hover:bg-zinc-900'}>
              {!editMode && <LayoutGrid className="size-3.5" />}
              {editMode ? t('workspace.done') : t('workspace.edit')}
            </Button>
          </div>
        </>
      }
    >
      {effective.map((placed, i) => {
        const def = getWidget(placed.widgetId);
        if (!def) return null;
        const W = def.component;
        return (
          <WidgetFrame key={placed.widgetId} title={def.title} icon={def.icon} size={placed.size}
            editMode={editMode}
            onMove={(dir) => { ensureOwned(); move(i, dir); }}
            onResize={(s) => { ensureOwned(); resize(i, s); }}
            onRemove={() => { ensureOwned(); removeAt(i); }}>
            <W />
          </WidgetFrame>
        );
      })}
    </DashboardLayout>
  );
}
