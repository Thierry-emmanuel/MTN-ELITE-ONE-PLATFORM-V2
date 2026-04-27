/**
 * Skeletons.tsx — Reusable loading skeleton components
 *
 * Usage:
 *   import { HeroSkeleton, NewsGridSkeleton, PlayerCardSkeleton, ... } from "./Skeletons";
 *
 * Each skeleton mirrors the shape of its real component so layout doesn't shift on load.
 */

// ─── Base pulse block ─────────────────────────────────────────────────────────
const Pulse = ({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`animate-pulse rounded bg-white/6 ${className}`}
    style={style}
  />
);

// ─── Hero Skeleton ────────────────────────────────────────────────────────────
export const HeroSkeleton = () => (
  <div className="relative min-h-[calc(100svh-60px)] max-h-[900px] bg-[hsl(168,50%,7%)] overflow-hidden">
    {/* Background shimmer */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent animate-pulse" />

    {/* Tab nav skeleton at bottom */}
    <div className="absolute bottom-5 left-0 right-0 container flex gap-3">
      {[1, 2, 3].map((i) => (
        <Pulse key={i} className="h-9 w-32 rounded-full" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>

    {/* Content skeleton — left column */}
    <div className="container flex flex-col justify-center h-full py-20 max-w-2xl gap-5">
      <Pulse className="h-5 w-36 rounded-full" />
      <div className="space-y-3">
        <Pulse className="h-12 w-full" style={{ animationDelay: "0.1s" }} />
        <Pulse className="h-12 w-4/5" style={{ animationDelay: "0.15s" }} />
      </div>
      <div className="space-y-2">
        <Pulse className="h-4 w-full" style={{ animationDelay: "0.2s" }} />
        <Pulse className="h-4 w-3/4" style={{ animationDelay: "0.25s" }} />
      </div>
      <div className="flex gap-3 mt-2">
        <Pulse className="h-11 w-36 rounded-full" style={{ animationDelay: "0.3s" }} />
        <Pulse className="h-11 w-36 rounded-full" style={{ animationDelay: "0.35s" }} />
      </div>
    </div>
  </div>
);

// ─── Fixture Card Skeleton ────────────────────────────────────────────────────
export const FixtureCardSkeleton = () => (
  <div className="snap-start shrink-0 w-[240px] sm:w-[270px] border border-border rounded-xl p-4 space-y-4 bg-gradient-card">
    <div className="flex items-center justify-between">
      <Pulse className="h-3 w-20" />
      <Pulse className="h-5 w-14 rounded-full" />
    </div>
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 flex flex-col items-center gap-2">
        <Pulse className="h-12 w-12 rounded-full" />
        <Pulse className="h-3 w-16" />
      </div>
      <Pulse className="h-4 w-6" />
      <div className="flex-1 flex flex-col items-center gap-2">
        <Pulse className="h-12 w-12 rounded-full" />
        <Pulse className="h-3 w-16" />
      </div>
    </div>
    <div className="pt-3 border-t border-border/50 text-center space-y-1">
      <Pulse className="h-7 w-16 mx-auto" />
      <Pulse className="h-2.5 w-20 mx-auto" />
    </div>
  </div>
);

// ─── Fixtures Section Skeleton ────────────────────────────────────────────────
export const FixturesSkeleton = () => (
  <div className="container py-6 lg:py-8">
    <div className="flex items-center justify-between mb-4">
      <Pulse className="h-6 w-40" />
      <Pulse className="h-4 w-28" />
    </div>
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <FixtureCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ─── Player Card Skeleton ─────────────────────────────────────────────────────
export const PlayerCardSkeleton = ({ tall = false }: { tall?: boolean }) => (
  <div
    className="snap-start shrink-0 w-[155px] border border-border rounded-xl overflow-hidden bg-gradient-card"
    style={{ animationDelay: "0.1s" }}
  >
    <Pulse className={`w-full ${tall ? "h-48" : "h-40"}`} style={{ borderRadius: 0 }} />
    <div className="p-2.5 space-y-2">
      <Pulse className="h-3 w-16" />
      <Pulse className="h-4 w-24" />
      <Pulse className="h-3 w-14" />
      {/* Sparkline skeleton */}
      <div className="pt-2 border-t border-white/6">
        <Pulse className="h-2 w-12 mb-1.5" />
        <Pulse className="h-8 w-full rounded" />
      </div>
    </div>
  </div>
);

// ─── Top Players Skeleton ─────────────────────────────────────────────────────
export const TopPlayersSkeleton = () => (
  <div>
    <div className="flex items-end justify-between mb-4">
      <Pulse className="h-7 w-48" />
      <div className="flex gap-2">
        <Pulse className="h-8 w-24 rounded-lg" />
        <Pulse className="h-7 w-16 rounded-lg" />
      </div>
    </div>
    <div className="flex gap-2.5 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <PlayerCardSkeleton key={i} tall />
      ))}
    </div>
  </div>
);

// ─── News Featured Skeleton ───────────────────────────────────────────────────
export const NewsFeaturedSkeleton = () => (
  <div className="rounded-xl overflow-hidden border border-border" style={{ minHeight: 360 }}>
    <Pulse className="w-full h-full min-h-[360px]" style={{ borderRadius: 0 }} />
  </div>
);

// ─── News Side Card Skeleton ──────────────────────────────────────────────────
export const NewsSideCardSkeleton = () => (
  <div className="flex gap-3 border border-border rounded-xl overflow-hidden bg-gradient-card">
    <Pulse className="w-28 h-24 shrink-0" style={{ borderRadius: 0 }} />
    <div className="flex-1 p-3 space-y-2">
      <div className="flex gap-2">
        <Pulse className="h-4 w-14 rounded-full" />
        <Pulse className="h-4 w-10" />
      </div>
      <Pulse className="h-4 w-full" />
      <Pulse className="h-3 w-4/5" />
      <Pulse className="h-7 w-7 rounded-full" />
    </div>
  </div>
);

// ─── News Grid Skeleton ───────────────────────────────────────────────────────
export const NewsGridSkeleton = () => (
  <div className="container py-8 lg:py-10">
    {/* Header + filter pills */}
    <div className="flex items-center justify-between mb-6">
      <Pulse className="h-8 w-52" />
      <Pulse className="h-4 w-16" />
    </div>
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Pulse key={i} className="h-7 w-20 rounded-full" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
      <NewsFeaturedSkeleton />
      <div className="flex flex-col gap-3">
        <NewsSideCardSkeleton />
        <NewsSideCardSkeleton />
        <div className="h-14 rounded-xl border border-dashed border-border" />
      </div>
    </div>
  </div>
);

// ─── Award Card Skeleton ──────────────────────────────────────────────────────
export const AwardCardSkeleton = () => (
  <div className="shrink-0 w-[220px] border border-white/10 rounded-2xl overflow-hidden bg-gradient-card">
    <Pulse className="w-full h-[264px]" style={{ borderRadius: 0 }} />
    <div className="p-4 -mt-10 relative space-y-3">
      <div className="flex justify-between items-end">
        <div className="space-y-1.5">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-6 w-32" />
          <Pulse className="h-3 w-20" />
        </div>
        <div className="text-right space-y-1">
          <Pulse className="h-8 w-10" />
          <Pulse className="h-3 w-12" />
        </div>
      </div>
      <Pulse className="h-9 w-full rounded-xl" />
    </div>
  </div>
);

// ─── Awards Section Skeleton ──────────────────────────────────────────────────
export const AwardsSkeleton = () => (
  <div className="container py-10 lg:py-16">
    <div className="flex items-end justify-between mb-8">
      <Pulse className="h-8 w-52" />
      <Pulse className="h-10 w-48 rounded-xl" />
    </div>
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <AwardCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ─── Hall of Fame Card Skeleton ───────────────────────────────────────────────
export const HallOfFameCardSkeleton = () => (
  <div className="rounded-xl overflow-hidden border border-border" style={{ aspectRatio: "3/4" }}>
    <Pulse className="w-full h-full" style={{ borderRadius: 0 }} />
  </div>
);

// ─── Hall of Fame Skeleton ────────────────────────────────────────────────────
export const HallOfFameSkeleton = () => (
  <div className="container py-8 lg:py-12">
    <div className="flex items-end justify-between mb-6">
      <Pulse className="h-8 w-52" />
      <Pulse className="h-9 w-72 rounded-xl" />
    </div>
    <div className="grid md:grid-cols-3 gap-3 lg:gap-4">
      {[1, 2, 3].map((i) => (
        <HallOfFameCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ─── Quick Stats Skeleton ─────────────────────────────────────────────────────
export const QuickStatsSkeleton = () => (
  <div className="container py-6 lg:py-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="border border-border rounded-xl p-4 space-y-3 bg-gradient-card animate-pulse"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-8 w-16" />
          <Pulse className="h-3 w-20" />
          <Pulse className="h-3 w-12" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Standings Skeleton ───────────────────────────────────────────────────────
export const StandingsSkeleton = () => (
  <div className="container py-8 lg:py-10">
    <div className="flex items-end justify-between mb-6">
      <Pulse className="h-8 w-40" />
      <Pulse className="h-4 w-28" />
    </div>
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60 bg-surface/40">
        <Pulse className="h-3 w-4" />
        <Pulse className="h-3 w-3" />
        <Pulse className="h-3 flex-1" />
        {[1,2,3,4].map(i => <Pulse key={i} className="h-3 w-6" />)}
        <Pulse className="h-3 w-[116px] hidden md:block" />
        <Pulse className="h-3 w-10" />
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 animate-pulse"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <Pulse className="h-4 w-4" />
          <Pulse className="h-3 w-3" />
          <Pulse className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3.5 w-32" />
            <Pulse className="h-2.5 w-16" />
          </div>
          <div className="hidden sm:flex gap-3">
            {[1,2,3,4].map(j => <Pulse key={j} className="h-3 w-6" />)}
          </div>
          <div className="hidden md:flex gap-1">
            {[1,2,3,4,5].map(j => <Pulse key={j} className="h-5 w-5 rounded-full" />)}
          </div>
          <Pulse className="h-5 w-8" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Road to Lions Card Skeleton ──────────────────────────────────────────────
export const RoadToLionsSkeleton = () => (
  <div className="py-14 lg:py-20 border-y border-border relative overflow-hidden">
    <div className="container">
      <div className="max-w-2xl mb-12 space-y-4">
        <Pulse className="h-3 w-32" />
        <Pulse className="h-14 w-3/4" />
        <Pulse className="h-14 w-1/2" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-5/6" />
      </div>
      <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden bg-gradient-card">
            <Pulse className="w-full" style={{ aspectRatio: "4/5", borderRadius: 0 }} />
            <div className="p-5 space-y-3">
              <Pulse className="h-3 w-16" />
              <Pulse className="h-8 w-40" />
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Pulse className="h-3.5 w-3.5 rounded-full" />
                <Pulse className="flex-1 h-1" />
                <Pulse className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Navbar Skeleton (thin top bar while page loads) ─────────────────────────
export const NavbarSkeleton = () => (
  <div className="fixed top-[2px] left-0 right-0 z-50 h-14 glass border-b border-white/8 animate-pulse">
    <div className="container h-full flex items-center gap-4">
      <Pulse className="h-8 w-8 rounded-lg shrink-0" />
      <Pulse className="h-4 w-32 hidden sm:block" />
      <div className="hidden lg:flex gap-2 ml-2">
        {[1,2,3,4].map(i => <Pulse key={i} className="h-8 w-24 rounded-lg" />)}
      </div>
      <div className="flex-1 hidden md:block">
        <Pulse className="h-8 rounded-full" />
      </div>
      <div className="ml-auto flex gap-2">
        <Pulse className="h-8 w-28 rounded-lg hidden sm:block" />
        <Pulse className="h-8 w-20 rounded-lg hidden sm:block" />
        <Pulse className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Full page skeleton (initial load) ───────────────────────────────────────
export const PageSkeleton = () => (
  <div className="min-h-screen bg-background">
    <NavbarSkeleton />
    <div className="h-14" /> {/* spacer */}
    <HeroSkeleton />
    <QuickStatsSkeleton />
    <StandingsSkeleton />
    <NewsGridSkeleton />
    <AwardsSkeleton />
    <HallOfFameSkeleton />
  </div>
);