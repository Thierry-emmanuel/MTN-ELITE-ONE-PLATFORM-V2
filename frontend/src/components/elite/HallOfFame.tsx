import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { legends } from "./data";
import { LegendCard } from "./LegendCard";
import { SectionHeader } from "./SectionHeader";

// ─── Hall of Fame (homepage teaser) ────────────────────────────────────────────
export const HallOfFame = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const featured = legends.slice(0, 3);

  return (
    <section ref={ref} className="container py-8 lg:py-12">
      <SectionHeader
        eyebrow="Hall of Fame"
        title="Légendes du Football"
        cta="Voir toutes les légendes"
        ctaHref="/halloffame"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
        className="grid md:grid-cols-3 gap-4 lg:gap-6"
      >
        {featured.map((legend, i) => (
          <LegendCard key={legend.id} legend={legend} index={i} />
        ))}
      </motion.div>

      <a
        href="/halloffame"
        className="sm:hidden mt-5 flex items-center justify-center gap-1.5 text-xs text-accent font-semibold uppercase tracking-widest"
      >
        Voir toutes les légendes
      </a>
    </section>
  );
};
