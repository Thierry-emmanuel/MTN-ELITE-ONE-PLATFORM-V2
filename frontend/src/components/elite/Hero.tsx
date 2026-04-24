import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, ArrowRight } from "lucide-react";
import { heroSlides } from "./data";
import { ClubBadge } from "./ClubBadge";
import heroImg from "@/assets/hero-stadium.jpg";

export const Hero = () => {
  const [i, setI] = useState(0);
  const slide = heroSlides[i];

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % heroSlides.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-glow" />

      <div className="container relative py-14 lg:py-24 grid lg:grid-cols-12 gap-10 items-center min-h-[560px]">
        <div className="lg:col-span-7 space-y-6 animate-fade-in" key={i}>
          <div className="inline-flex items-center gap-2.5 rounded-full bg-surface-elevated/80 backdrop-blur border border-border px-4 py-1.5">
            {slide.live && <span className="h-2 w-2 rounded-full bg-live animate-pulse-live" />}
            <span className="text-[11px] uppercase tracking-[0.25em] font-medium text-accent">{slide.kicker}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] uppercase tracking-tight">
            {slide.title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl">{slide.subtitle}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="group inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-3.5 rounded-full font-medium shadow-glow hover:shadow-gold transition-all hover:scale-[1.02]">
              <Play className="h-4 w-4 fill-current" />
              Voir le match
            </button>
            <button className="inline-flex items-center gap-2 bg-surface-elevated/70 backdrop-blur border border-border text-foreground px-6 py-3.5 rounded-full font-medium hover:bg-surface-elevated transition-colors">
              Calendrier complet
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative bg-gradient-card border border-border rounded-2xl p-6 md:p-8 shadow-elegant backdrop-blur-sm">
            <div className="absolute -top-px left-8 right-8 h-px flag-bar" />
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">{slide.venue}</div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col items-center gap-3 text-center">
                <ClubBadge club={slide.home} size={68} />
                <div>
                  <div className="font-display text-lg leading-tight">{slide.home.name}</div>
                  <div className="text-xs text-muted-foreground">Domicile</div>
                </div>
              </div>

              <div className="px-4 text-center shrink-0">
                <div className="font-display text-3xl md:text-4xl text-accent">{slide.time.includes("’") ? slide.time.split(" · ")[1] : "VS"}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{slide.time.includes("’") ? slide.time.split(" · ")[0] : slide.time}</div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-3 text-center">
                <ClubBadge club={slide.away} size={68} />
                <div>
                  <div className="font-display text-lg leading-tight">{slide.away.name}</div>
                  <div className="text-xs text-muted-foreground">Extérieur</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
              <div className="flex gap-1.5">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-accent" : "w-1.5 bg-border"}`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setI((i - 1 + heroSlides.length) % heroSlides.length)} className="h-9 w-9 grid place-items-center rounded-full bg-surface hover:bg-surface-elevated transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setI((i + 1) % heroSlides.length)} className="h-9 w-9 grid place-items-center rounded-full bg-surface hover:bg-surface-elevated transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
