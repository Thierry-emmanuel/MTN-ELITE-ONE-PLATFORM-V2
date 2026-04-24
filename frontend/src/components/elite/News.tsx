import { news } from "./data";
import { SectionHeader } from "./SectionHeader";
import n1 from "@/assets/news-1.jpg";
import n2 from "@/assets/news-2.jpg";
import n3 from "@/assets/news-3.jpg";
const imgs: Record<string, string> = { "news-1": n1, "news-2": n2, "news-3": n3 };

export const News = () => {
  return (
    <section className="container py-10 lg:py-14">
      <SectionHeader eyebrow="Magazine" title="Actualités & Préviews" cta="Voir tout" />
      <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
        {news.map((n, i) => (
          <article key={i} className="group bg-gradient-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 shadow-card">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={imgs[n.img]} alt={n.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                {n.tag}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl leading-snug uppercase group-hover:text-accent transition-colors">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.desc}</p>
              <div className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground/70">22 Avril · 4 min de lecture</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
