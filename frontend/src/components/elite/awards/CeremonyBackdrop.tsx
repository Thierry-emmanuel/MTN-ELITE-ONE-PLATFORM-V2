import { memo } from 'react';

// ─── CeremonyBackdrop ─────────────────────────────────────────────────────────
// A press-wall / stage backdrop for hero sections: a subtle step-and-repeat
// pattern (own brand mark, not a copied sponsor wall) layered over a blurred,
// duotone collage of real winners' photos — the same visual grammar as a
// Ballon d'Or step-and-repeat or an FIA gala stage, built from the app's own
// assets rather than any photo we don't have rights to.
interface CeremonyBackdropProps {
  photos?: string[];
  intensity?: 'subtle' | 'medium';
  className?: string;
}

const LAYOUT = [
  { top: '2%',  left: '4%',  w: 15, rot: -7 },
  { top: '46%', left: '1%',  w: 13, rot: 5 },
  { top: '3%',  left: '80%', w: 14, rot: 6 },
  { top: '48%', left: '84%', w: 15, rot: -4 },
  { top: '58%', left: '20%', w: 12, rot: 3 },
  { top: '55%', left: '60%', w: 12, rot: -3 },
  { top: '4%',  left: '38%', w: 11, rot: -2 },
  { top: '4%',  left: '60%', w: 11, rot: 2 },
];

export const CeremonyBackdrop = memo(({ photos = [], intensity = 'subtle', className = '' }: CeremonyBackdropProps) => {
  const collageOpacity = intensity === 'subtle' ? 0.22 : 0.34;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* step-and-repeat brand pattern — own wordmark + star, not a copied press wall */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="ceremonyRepeat" width="220" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
            <text x="4" y="34" fontSize="15" fontWeight="700" fill="#FCD116" fontFamily="Oswald, sans-serif" letterSpacing="3">MTN ELITE ONE</text>
            <path d="M18,72 L21,80 L29,81 L23,87 L25,95 L18,91 L11,95 L13,87 L7,81 L15,80 Z" fill="#FCD116" />
            <circle cx="120" cy="110" r="7" fill="none" stroke="#FCD116" strokeWidth="1.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ceremonyRepeat)" />
      </svg>

      {/* blurred duotone photo collage — real winners, softened into the stage */}
      {photos.length > 0 && (
        <div
          className="absolute inset-0"
          style={{ filter: 'blur(2.5px) grayscale(0.35) sepia(0.35) brightness(0.9)', opacity: collageOpacity }}
        >
          {photos.slice(0, LAYOUT.length).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute rounded-2xl object-cover shadow-2xl"
              style={{
                top: LAYOUT[i].top, left: LAYOUT[i].left,
                width: `${LAYOUT[i].w}%`, aspectRatio: '3 / 4',
                transform: `rotate(${LAYOUT[i].rot}deg)`,
              }}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* legibility scrim + vignette so foreground content always reads clean */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/88 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_38%,transparent_0%,black_78%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCD116]/35 to-transparent" />
    </div>
  );
});
CeremonyBackdrop.displayName = 'CeremonyBackdrop';