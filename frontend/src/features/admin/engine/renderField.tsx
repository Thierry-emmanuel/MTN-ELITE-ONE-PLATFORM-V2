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
    const tags: string[] = Array.isArray(value) ? (value as string[]) : [];
    const addTag = (input: string) => {
      const trimmed = input.trim();
      if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    };
    return (
      <div key={String(field.key)} className={wrapClass || 'col-span-2'}>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-1.5">
          {field.label}
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/8 text-white/70 text-[11px]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="ml-1 text-white/30 hover:text-red-400 leading-none"
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
          onBlur={(e) => { addTag(e.target.value); e.target.value = ''; }}
          className="w-full text-xs rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 text-white placeholder:text-white/15 outline-none focus:border-accent/50 transition-all"
        />
      </div>
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

  const options = field.optionsKey ? lookupOptions[field.optionsKey] : field.options;
  return (
    <div key={String(field.key)} className={wrapClass}>
      <FormField
        label={field.label}
        type={field.type as 'text' | 'textarea' | 'number' | 'select' | 'date'}
        value={value as string | number}
        onChange={onChange}
        options={options}
        required={field.required}
        hint={field.hint}
      />
    </div>
  );
}
