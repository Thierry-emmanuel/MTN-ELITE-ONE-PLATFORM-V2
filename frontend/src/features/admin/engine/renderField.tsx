import { useState } from 'react';
import { FormField, MediaUploader } from '@/components/ui/AdminUI';
import { RichTextEditor } from '../components/RichTextEditor';
import type { FieldDef, SelectOption } from './entityConfig.types';

/**
 * Renders one FieldDef as its editable input. Used by both EntityCrudEngine
 * (flat two-column form) and GuidedBuilderEngine (one step at a time) —
 * keeping this in one place means every entity's builder steps stay pixel-
 * and-behaviour identical to its flat form, forever, with zero duplication.
 */
export function renderEntityField<T>(
  field: FieldDef<T>,
  value: unknown,
  onChange: (v: unknown) => void,
  lookupOptions: Record<string, SelectOption[]> = {},
  wrapClass = '',
) {
  if (field.type === 'richtext') {
    return (
      <div key={String(field.key)} className={wrapClass || 'col-span-2'}>
        <RichTextEditor label={field.label} value={(value as string) || ''} onChange={onChange} />
      </div>
    );
  }

  if (field.type === 'media-image' || field.type === 'media-video') {
    return (
      <div key={String(field.key)} className={wrapClass}>
        <MediaUploader
          label={field.label}
          value={value as string}
          onChange={onChange}
          acceptType={field.type === 'media-video' ? 'video' : 'image'}
          hint={field.hint}
          uploadUrl={
            field.uploadScope
              ? `/uploads/${field.uploadScope.entity}/${field.uploadScope.field}`
              : '/uploads/file'
          }
        />
      </div>
    );
  }

  if (field.type === 'nested-object') {
    const objValue = (value as Record<string, unknown>) || {};
    const sub = field.subFields ?? [];
    return (
      <div key={String(field.key)} className={wrapClass || 'col-span-2'}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-2">{field.label}</p>
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.03]">
          {sub.map((s) => (
            <FormField
              key={s.key}
              label={s.label}
              type={s.type}
              value={(objValue[s.key] as string | number) ?? ''}
              onChange={(v) => onChange({ ...objValue, [s.key]: v })}
            />
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'switch') {
    return (
      <div key={String(field.key)} className={wrapClass}>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{field.label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              value ? 'bg-accent' : 'bg-white/15'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform ${
                value ? 'translate-x-4 bg-black' : 'translate-x-1 bg-white/70'
              }`}
            />
          </button>
        </label>
      </div>
    );
  }

  if (field.type === 'tags') {
    const availableOptions = field.optionsKey ? lookupOptions[field.optionsKey] : field.options;
    return (
      <TagsFieldInput
        key={String(field.key)}
        field={field}
        value={value}
        onChange={onChange}
        availableOptions={availableOptions}
        wrapClass={wrapClass}
      />
    );
  }

  if (field.type === 'color') {
    return (
      <div key={String(field.key)} className={wrapClass}>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-1.5">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#007A5E"
            className="flex-1 text-xs rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 text-white outline-none focus:border-accent/50"
          />
        </div>
      </div>
    );
  }

  if (String(field.key) === 'password') {
    return (
      <PasswordFieldInput
        key={String(field.key)}
        field={field}
        value={value}
        onChange={onChange}
        wrapClass={wrapClass}
      />
    );
  }

  const options = field.optionsKey ? lookupOptions[field.optionsKey] : field.options;
  return (
    <div key={String(field.key)} className={wrapClass}>
      <FormField
        label={field.label}
        type={field.type as 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime-local'}
        value={value as string | number}
        onChange={onChange}
        options={options}
        required={field.required}
        hint={field.hint}
      />
    </div>
  );
}

function TagsFieldInput({
  field,
  value,
  onChange,
  availableOptions,
  wrapClass,
}: {
  field: FieldDef<any>;
  value: unknown;
  onChange: (v: unknown) => void;
  availableOptions?: SelectOption[];
  wrapClass?: string;
}) {
  const tags: string[] = Array.isArray(value) ? (value as string[]) : [];
  const [tagSearch, setTagSearch] = useState('');
  const addTag = (input: string) => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
  };
  const toggleTag = (val: string) => {
    if (tags.includes(val)) {
      onChange(tags.filter((t) => t !== val));
    } else {
      onChange([...tags, val]);
    }
  };
  const filteredOpts = availableOptions
    ? tagSearch.trim()
      ? availableOptions.filter(
          (o) =>
            o.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
            String(o.value).toLowerCase().includes(tagSearch.toLowerCase())
        )
      : availableOptions
    : [];

  return (
    <div key={String(field.key)} className={wrapClass || 'col-span-2'}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-1.5">
        {field.label}
      </label>

      {/* ── Quick select options from DB ─────────────────────── */}
      {availableOptions && availableOptions.length > 0 && (
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
          {availableOptions.length > 5 && (
            <input
              type="text"
              placeholder="Filtrer les options..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full text-xs rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50"
            />
          )}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {filteredOpts.map((opt) => {
              const val = String(opt.value);
              const isSelected = tags.includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleTag(val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 font-medium shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {opt.label}
                </button>
              );
            })}
            {filteredOpts.length === 0 && (
              <span className="text-[11px] text-white/30 italic">Aucune option ne correspond à la recherche</span>
            )}
          </div>
        </div>
      )}

      {/* ── Selected tags list ─────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-1 text-emerald-400 hover:text-red-400 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={field.hint ?? 'Appuyez sur Entrée pour ajouter'}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = '';
          }
        }}
        onBlur={(e) => {
          const val = e.target.value.trim();
          if (val) {
            addTag(val);
            e.target.value = '';
          }
        }}
        className="w-full text-xs rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 text-white placeholder:text-white/15 outline-none focus:border-accent/50 transition-all"
      />
    </div>
  );
}

function PasswordFieldInput({
  field,
  value,
  onChange,
  wrapClass,
}: {
  field: FieldDef<any>;
  value: unknown;
  onChange: (v: unknown) => void;
  wrapClass?: string;
}) {
  const [copied, setCopied] = useState(false);
  const generate = () => {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange(pass);
    navigator.clipboard.writeText(pass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={wrapClass}>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <FormField
            label={field.label}
            type="text"
            value={value as string | number}
            onChange={onChange}
            required={field.required}
            hint={field.hint}
          />
        </div>
        <button
          type="button"
          onClick={generate}
          className={`h-[42px] px-3 rounded-xl border text-[11px] font-medium transition-all whitespace-nowrap ${
            copied
              ? 'border-emerald-600 bg-emerald-950/20 text-emerald-400'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          {copied ? '✓ Copié !' : 'Générer & Copier'}
        </button>
      </div>
    </div>
  );
}
