import { useState } from "react";
import type { Club } from "./data";

interface Props {
  club: Club;
  size?: number;
  className?: string;
}

// Logo path map — add your real crest filenames here
// Keys must match club.id from data.ts
const LOGO_MAP: Record<string, string> = {
  cot:  "/assets/images/logo/Cotonsport_logo.png",
  uds:  "/assets/images/logo/dynamo_douala.png",      // placeholder — swap when available
  pwd:  "/assets/images/logo/Pwd_logo.png",
  cnk:  "/assets/images/logo/Canon_logo.png",
  ymb:  "/assets/images/logo/Uniisport_bafang_logo.png", // placeholder
  apb:  "/assets/images/logo/Aigle_Moungo_logo.png",  // placeholder
  cof:  "/assets/images/logo/colombe_logo.png",
  vict: "/assets/images/logo/victoria_logo.png",
  fov:  "/assets/images/logo/fauve_logo.png",
  bam:  "/assets/images/logo/panthere_logo.png",      // placeholder
};

export const ClubBadge = ({ club, size = 40, className = "" }: Props) => {
  const [imgFailed, setImgFailed] = useState(false);
  const logoSrc = LOGO_MAP[club.id];
  const showLogo = logoSrc && !imgFailed;

  if (showLogo) {
    return (
      <div
        className={`relative shrink-0 inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        aria-label={club.name}
      >
        <img
          src={logoSrc}
          alt={club.name}
          width={size}
          height={size}
          className="object-contain w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // ── Fallback monogram (shown while logo path is not yet mapped or image 404s)
  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center font-display font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        // round shield shape
        borderRadius: "30% 30% 50% 50% / 20% 20% 40% 40%",
        background: `linear-gradient(160deg, ${club.color}ee 0%, ${club.color}88 100%)`,
        border: `1.5px solid ${club.color}55`,
        fontSize: size * 0.3,
        boxShadow: `0 2px 8px ${club.color}33`,
      }}
      aria-label={club.name}
    >
      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{club.short}</span>
    </div>
  );
};