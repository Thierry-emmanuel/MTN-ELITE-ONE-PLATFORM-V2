import { useCallback, useRef, useState } from 'react';
import {
  UploadCloud, X, Film, Loader2, ImagePlus, Link2,
} from 'lucide-react';
import { newsApi } from '@/services/newsApi';

// ─── Single cover / video slot uploader ────────────────────────────────────────
interface SingleUploaderProps {
  label: string;
  value?: string;
  field: 'cover' | 'video' | 'video-thumbnail';
  accept: string;
  kind: 'image' | 'video';
  onChange: (url: string | undefined) => void;
  helpText?: string;
  allowUrl?: boolean;
}

export function SingleMediaUploader({
  label, value, field, accept, kind, onChange, helpText, allowUrl,
}: SingleUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const url = await newsApi.uploadMedia(file, field, setProgress);
      onChange(url);
    } catch {
      setError('Échec du téléversement. Vérifiez le format et la taille du fichier.');
    } finally {
      setUploading(false);
    }
  }, [field, onChange]);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) void doUpload(file);
  }, [doUpload]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {kind === 'image' ? <ImagePlus className="h-3 w-3" /> : <Film className="h-3 w-3" />}
          {label}
        </label>
        {allowUrl && (
          <button
            type="button"
            onClick={() => setUrlMode(v => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-accent transition-colors"
          >
            <Link2 className="h-2.5 w-2.5" />
            {urlMode ? 'Téléverser un fichier' : 'Utiliser un lien'}
          </button>
        )}
      </div>

      {urlMode ? (
        <input
          value={value ?? ''}
          onChange={e => onChange(e.target.value || undefined)}
          placeholder="https://www.youtube.com/watch?v=… ou https://…"
          className="w-full bg-white/[0.04] border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/50 transition-colors"
        />
      ) : value ? (
        <div className="relative rounded-xl overflow-hidden border border-border/40 bg-black/30 group">
          {kind === 'image' ? (
            <img src={value} alt="" className="w-full h-36 object-cover" />
          ) : (
            <video src={value} className="w-full h-36 object-cover" controls={false} muted />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-black text-[11px] font-bold hover:bg-white transition-colors"
            >
              Remplacer
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="h-8 w-8 rounded-lg bg-[#CE1126]/90 text-white flex items-center justify-center hover:bg-[#CE1126] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragOver ? 'border-accent/60 bg-accent/[0.06]' : 'border-border/40 hover:border-border/70 bg-white/[0.02]'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
              <span className="text-[11px] text-muted-foreground/50 tabular-nums">{progress}%</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5 text-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground/50 text-center px-4">
                Glissez un fichier ici ou cliquez pour parcourir
              </span>
            </>
          )}
        </div>
      )}

      {helpText && !error && (
        <p className="text-[10px] text-muted-foreground/30 mt-1.5">{helpText}</p>
      )}
      {error && (
        <p className="text-[10px] text-[#CE1126]/80 mt-1.5">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        className="hidden"
      />
    </div>
  );
}

// ─── Multi-image gallery uploader ──────────────────────────────────────────────
interface GalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function GalleryUploader({ images, onChange }: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        // eslint-disable-next-line no-await-in-loop
        const url = await newsApi.uploadMedia(file, 'gallery');
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }, [images, onChange]);

  const removeAt = useCallback((idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  }, [images, onChange]);

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
        <ImagePlus className="h-3 w-3" /> Galerie photo
      </label>

      <div className="grid grid-cols-4 gap-2">
        {images.map((src, idx) => (
          <div key={src + idx} className="relative aspect-square rounded-lg overflow-hidden border border-border/40 group">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
            dragOver ? 'border-accent/60 bg-accent/[0.06]' : 'border-border/40 hover:border-border/70 bg-white/[0.02]'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4 text-muted-foreground/40" />
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => { void handleFiles(e.target.files); e.target.value = ''; }}
        className="hidden"
      />
    </div>
  );
}
