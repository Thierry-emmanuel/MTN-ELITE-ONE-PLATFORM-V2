import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { lions } from "./data";
import { ClubBadge } from "./ClubBadge";

import p1 from "@/assets/images/youngtalents/SergeDaura.png";
import p2 from "@/assets/images/players/RichardNjoh.png";
import p3 from "@/assets/images/players/DavidNgondo.png";

const imgMap: Record<string, string> = { p1, p2, p3 };

export const RoadToLions = () => {
  const ref      = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView   = useInView(ref, { once: true, margin: "-80px" });

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="relative py-14 lg:py-20 border-y border-border overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 field-pattern opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-px flag-bar" />
      <div className="absolute bottom-0 left-0 right-0 h-px flag-bar" />
      <div className="absolute inset-0 bg-gradient-to-b from-background-deep/60 to-background-deep/80" />

      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between gap-4 mb-8"
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11px] uppercase tracking-[.3em] text-accent font-semibold">🇨🇲 Road to Lions</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl uppercase leading-[0.95]">
              Du championnat <span className="text-gradient-gold">aux Lions</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-lg">
              Les talents de la MTN Elite One qui portent les couleurs nationales.
            </p>
          </div>

          {/* Carousel arrows */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="h-9 w-9 rounded-full bg-white/5 border border-border/50 grid place-items-center text-muted-foreground hover:bg-white/10 hover:text-accent transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-9 w-9 rounded-full bg-white/5 border border-border/50 grid place-items-center text-muted-foreground hover:bg-white/10 hover:text-accent transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Carousel track */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-3"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {lions.map((player, i) => (
            <motion.article
              key={player.name}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ scrollSnapAlign: 'start' }}
              className="group flex-shrink-0 w-64 sm:w-72 relative bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-elegant cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={imgMap[player.imgKey]}
                  alt={player.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                {/* Caps badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 px-3 py-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  <span className="text-[10px] text-white/80 uppercase tracking-widest font-medium">{player.caps} sél.</span>
                </div>

                {/* Arrow */}
                <div className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-black/50 backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <ArrowUpRight className="h-4 w-4 text-accent" />
                </div>
              </div>

              {/* Info */}
              <div className="p-5 -mt-14 relative">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{player.pos}</div>
                    <h3 className="font-display text-2xl leading-tight text-foreground truncate">{player.name}</h3>
                  </div>
                  <ClubBadge club={player.club} size={36} />
                </div>

                {/* Club → Lions journey */}
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <ClubBadge club={player.club} size={14} />
                    <span className="text-muted-foreground">{player.club.short}</span>
                  </div>
                  <div className="flex-1 h-px bg-border relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-[#CE1126]"
                      initial={{ width: "0%" }}
                      animate={inView ? { width: "100%" } : { width: "0%" }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                  <span className="text-accent font-semibold">🇨🇲 Lions</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/lions"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group"
          >
            Visiter le Centre National de Sélection
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};