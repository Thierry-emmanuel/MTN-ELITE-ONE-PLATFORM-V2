import { memo, useState } from 'react';

interface Props {
  name?: string | null;
  photoUrl?: string;
  size?: number;
  ring?: string; // border color override, e.g. club color
  className?: string;
}

function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const PlayerAvatar = memo(({ name, photoUrl, size = 40, ring, className = '' }: Props) => {
  const [failed, setFailed] = useState(false);
  const showPhoto = photoUrl && !failed;

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size, border: ring ? `1.5px solid ${ring}` : undefined }}
      />
    );
  }

  return (
    <div
      className={`rounded-full grid place-items-center shrink-0 font-display font-bold bg-surface-elevated text-muted-foreground ${className}`}
      style={{
        width: size, height: size,
        fontSize: Math.round(size * 0.34),
        border: ring ? `1.5px solid ${ring}66` : '1.5px solid hsl(var(--border))',
      }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
});
PlayerAvatar.displayName = 'PlayerAvatar';
