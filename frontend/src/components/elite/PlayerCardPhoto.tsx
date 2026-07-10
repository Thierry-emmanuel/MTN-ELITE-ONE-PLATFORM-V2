import { memo, useState } from 'react';
import { UserRound } from 'lucide-react';

interface Props {
  name?: string | null;
  photoUrl?: string;
  className?: string;
  /** object-position for the image, e.g. 'center 15%' to keep faces in frame */
  focalPoint?: string;
}

function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Full-bleed portrait meant to fill an entire card (trading-card style),
 * not a small circular avatar. Falls back to a monogram-on-silhouette
 * treatment if no photo is available or it fails to load, so the card
 * still looks intentional rather than broken.
 */
export const PlayerCardPhoto = memo(({ name, photoUrl, className = '', focalPoint = 'center 12%' }: Props) => {
  const [failed, setFailed] = useState(false);
  const showPhoto = photoUrl && !failed;

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={name ?? 'Joueur'}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
        style={{ objectPosition: focalPoint }}
      />
    );
  }

  return (
    <div className={`absolute inset-0 flex items-end justify-center overflow-hidden ${className}`}>
      <UserRound className="h-[75%] w-[75%] text-white/[0.08] translate-y-[18%]" strokeWidth={0.75} />
      <span className="absolute inset-0 grid place-items-center font-display text-5xl font-black text-white/25 select-none">
        {initials(name)}
      </span>
    </div>
  );
});
PlayerCardPhoto.displayName = 'PlayerCardPhoto';
