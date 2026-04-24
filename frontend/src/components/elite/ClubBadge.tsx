import type { Club } from "./data";

interface Props {
  club: Club;
  size?: number;
  className?: string;
}

// Stylized monogram badge — production-ready slot for real club crests
export const ClubBadge = ({ club, size = 40, className = "" }: Props) => {
  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center font-display font-bold text-white shadow-card ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${club.color} 0%, ${club.color}cc 100%)`,
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        fontSize: size * 0.32,
      }}
      aria-label={club.name}
    >
      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{club.short}</span>
    </div>
  );
};
