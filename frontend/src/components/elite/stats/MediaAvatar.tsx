import { memo, useState } from 'react';

function initialsOf(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Player headshot ──────────────────────────────────────────────────────────
interface PlayerAvatarProps {
  photoUrl?: string;
  name: string;
  size: number;
  className?: string;
}

export const PlayerAvatar = memo(({ photoUrl, name, size, className = '' }: PlayerAvatarProps) => {
  const [failed, setFailed] = useState(false);
  const showImg = !!photoUrl && !failed;

  return showImg ? (
    <img
      src={photoUrl}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-full object-cover shrink-0 bg-white/5 ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 font-bold text-foreground/70 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initialsOf(name)}
    </div>
  );
});
PlayerAvatar.displayName = 'PlayerAvatar';

// ─── Club crest ────────────────────────────────────────────────────────────────
interface ClubBadgeProps {
  logoUrl?: string;
  name: string;
  size: number;
  className?: string;
}

export const ClubBadge = memo(({ logoUrl, name, size, className = '' }: ClubBadgeProps) => {
  const [failed, setFailed] = useState(false);
  const showImg = !!logoUrl && !failed;

  return showImg ? (
    <img
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0 font-black text-foreground/60 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialsOf(name).slice(0, 1)}
    </div>
  );
});
ClubBadge.displayName = 'ClubBadge';
