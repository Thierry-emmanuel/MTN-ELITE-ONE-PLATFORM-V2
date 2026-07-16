import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useArticles, useFeatured } from "@/hooks/useNews";
import { CATEGORY_META } from "@/types/news.types";
import newsFallback from "@/assets/news-2.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// Featured Story — a magazine spread, not a news card. Large photography on
// one side, a considered editorial block on the other, asymmetrical margins.
// ─────────────────────────────────────────────────────────────────────────────

function readTime(minutes: number) {
  return `${minutes} min de lecture`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export const FeaturedStory = () => {
  const { data: featured } = useFeatured();
  const { data: allArticles } = useArticles();
  // The Hero already leads with the top featured piece — this spread surfaces
  // the next most recent story so the two sections never repeat each other.
  const heroSlug = featured?.[0]?.slug;
  const story =
    allArticles?.find((a) => a.slug !== heroSlug) ?? featured?.[0] ?? allArticles?.[0];

  if (!story) return null;

  const category = CATEGORY_META[story.category];

  return (
    <section className="border-b border-border/40 bg-background">
      <div className="container py-16 lg:py-24">
        <div className="mb-10 flex items-center gap-3 lg:mb-14">
          <span className="h-px w-10 bg-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-[.3em] text-accent">
            À la une
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-4">
          {/* Photography — offset, occupies most of the width */}
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/3] overflow-hidden lg:col-span-7 lg:aspect-auto"
          >
            <img
              src={story.imageUrl || newsFallback}
              alt={story.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

          {/* Editorial block */}
          <div className="flex flex-col justify-center lg:col-span-5 lg:pl-10">
            {category && (
              <span className={`mb-5 inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${category.bg} ${category.color}`}>
                {category.label}
              </span>
            )}

            <h2 className="font-display text-3xl leading-[1.08] text-foreground sm:text-4xl lg:text-[2.75rem]">
              {story.title}
            </h2>

            <p className="mt-5 font-sans text-lg italic leading-relaxed text-muted-foreground/80">
              {story.excerpt}
            </p>

            <div className="mt-7 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground/50">
              <span>{story.author.name}</span>
              <span className="opacity-40">·</span>
              <span>{formatDate(story.publishedAt)}</span>
              <span className="opacity-40">·</span>
              <span>{readTime(story.readingTime)}</span>
            </div>

            <Link
              to={`/news/${story.slug}`}
              className="group mt-9 inline-flex w-fit items-center gap-2.5 border-b border-foreground/20 pb-1.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Lire l'histoire complète
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
