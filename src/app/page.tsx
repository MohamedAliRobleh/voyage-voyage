"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown, MapPin } from "lucide-react";
import { destinations } from "@/lib/destinations";
import ImageCarousel from "@/components/ImageCarousel";
import FAQAccordion from "@/components/FAQAccordion";
import ReviewsSection from "@/components/ReviewsSection";
import { useLanguage } from "@/contexts/LanguageContext";

// Leaflet ne fonctionne pas en SSR
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false });

const destSlugs = ["loubatanleh", "lac-abbe", "lac-assal", "sables-blancs", "requin-baleine", "ditilou"] as const;

export default function HomePage() {
  const { t } = useLanguage();

  const destPhares = destSlugs.map((slug) => ({
    ...destinations.find((d) => d.slug === slug)!,
    shortDesc: t(`home.featured.descs.${slug}`),
  }));

  return (
    <>
      {/* ══════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/images/pics/SABLE BLANC/sablesblanc3.webp"
          alt="Djibouti"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/50" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center gap-2.5 bg-black/35 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 shadow-lg">
              <img src="/images/pics/logo/logovoyage.webp" alt="Logo" width={30} height={30} style={{ objectFit: "contain" }} />
              <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">VOYAGE VOYAGE</span>
            </div>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white uppercase mb-5 leading-none"
            style={{ letterSpacing: "-0.02em", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
          >
            {t("home.hero.title")}{" "}
            <span style={{ background: "linear-gradient(135deg, #5bb8d4, #e8645a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              DJIBOUTI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/85 uppercase tracking-[0.15em] text-sm font-medium mb-8 max-w-xl mx-auto leading-loose"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          {/* Bullets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-8 mb-10 text-xs tracking-[0.2em] uppercase"
          >
            {[
              { key: "home.hero.tagLunar", color: "#408398" },
              { key: "home.hero.tagMarine", color: "#25D366" },
              { key: "home.hero.tagCulture", color: "#e8645a" },
            ].map((tag) => (
              <span key={tag.key} className="flex items-center gap-2 text-white/90">
                <span className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
                {t(tag.key)}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/destinations" className="group px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm text-white transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #408398, #265868)" }}>
              {t("home.hero.ctaExplore")}
            </Link>
            <a href="https://wa.me/25377073377" target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-all hover:-translate-y-1 hover:shadow-xl">
              {t("home.hero.ctaWhatsapp")}
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-[0.3em] uppercase">{t("common.scroll")}</span>
          <ChevronDown size={18} className="animate-bounce" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — INTRO SOMBRE
      ══════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #0e2d38 0%, #1a4250 50%, #265868 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #408398, transparent)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #e8645a, transparent)", transform: "translate(30%, 30%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-2xl"
              style={{ background: "linear-gradient(135deg, #408398, #5bb8d4)" }}>
              🇩🇯
            </div>
            <span className="text-white font-black uppercase tracking-[0.3em] text-2xl mt-3">DJIBOUTI</span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white uppercase mb-6 leading-tight"
            style={{ letterSpacing: "0.02em" }}>
            {t("home.intro.title1")}
            <br />
            <span style={{ color: "#5bb8d4" }}>{t("home.intro.title2")}</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }} viewport={{ once: true }}
            className="text-white/70 uppercase tracking-widest text-sm leading-loose max-w-2xl mx-auto">
            {t("home.intro.subtitle")}
          </motion.p>

          {/* Mini stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { value: "23 200", unit: "km²", label: t("home.intro.statArea") },
              { value: "13+", unit: "", label: t("home.intro.statDestinations") },
              { value: "1500+", unit: "", label: t("home.intro.statTravelers") },
              { value: "10+", unit: t("common.years"), label: t("home.intro.statExperience") },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white">
                  {s.value}<span className="text-[#5bb8d4] text-lg ml-1">{s.unit}</span>
                </div>
                <div className="text-white/50 text-xs uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — UN PAYS AUX MULTIPLES RICHESSES
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
              {t("home.richesses.title1")}{" "}
              <span style={{ color: "#e8645a" }}>{t("home.richesses.title2")}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              {[
                t("home.richesses.p1"),
                t("home.richesses.p2"),
                t("home.richesses.p3"),
                t("home.richesses.p4"),
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="text-gray-600 leading-relaxed text-sm uppercase tracking-wide">
                  {text}
                </motion.p>
              ))}

              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} viewport={{ once: true }} className="pt-4">
                <Link href="/djibouti"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #408398, #265868)" }}>
                  {t("home.richesses.cta")}
                </Link>
              </motion.div>
            </motion.div>

            {/* Carousel */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
              <ImageCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — CARTE IMMERSIVE
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-4xl">🧭</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                <span style={{ color: "#408398" }}>{t("home.map.title1")}</span>{" "}
                <span className="text-gray-900">{t("home.map.title2")}</span>
              </h2>
            </div>
            <p className="text-gray-500 uppercase tracking-widest text-xs max-w-xl mx-auto">
              {t("home.map.subtitle")}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
            <InteractiveMap />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — DESTINATIONS PHARES
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl shadow-lg"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
              ⭐
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3">
              {t("home.featured.title")}
            </h2>
            <p className="text-gray-400 uppercase tracking-[0.3em] text-xs">
              {t("home.featured.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destPhares.map((dest, i) => dest && (
              <motion.div key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 3) * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/destinations/${dest.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    style={{ height: "280px" }}>
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MapPin size={13} className="text-[#5bb8d4]" />
                        <h3 className="text-white font-black uppercase tracking-wide text-lg leading-none">
                          {dest.name}
                        </h3>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed mb-4 uppercase tracking-wide">
                        {dest.shortDesc}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[#5bb8d4] font-black uppercase tracking-widest text-xs group-hover:gap-3 transition-all">
                        {t("home.featured.discover")} <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="text-center mt-12">
            <Link href="/destinations"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm text-white transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #408398, #e8645a)" }}>
              {t("home.featured.seeAll")} ({destinations.length}) →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — AVIS VOYAGEURS
      ══════════════════════════════════════════════════ */}
      <ReviewsSection />

      {/* ══════════════════════════════════════════════════
          SECTION 7 — FAQ
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl shadow-lg"
              style={{ background: "linear-gradient(135deg, #408398, #5bb8d4)" }}>
              ❓
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3">
              {t("home.faq.title")}
            </h2>
            <p className="text-gray-400 uppercase tracking-[0.3em] text-xs">
              {t("home.faq.subtitle")}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
            <FAQAccordion />
          </motion.div>

          {/* CTA after FAQ */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }} viewport={{ once: true }}
            className="mt-16 rounded-3xl overflow-hidden relative">
            <img src="/images/pics/PAYSAGES/paysage-6.webp" alt="Djibouti" className="w-full h-56 object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
              style={{ background: "linear-gradient(135deg, rgba(14,45,56,0.85), rgba(38,88,104,0.85))" }}>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-4">
                {t("home.faq.ctaTitle")}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact"
                  className="px-7 py-3 rounded-full font-black uppercase tracking-widest text-sm text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #e8645a, #d4534a)" }}>
                  {t("common.planTrip")}
                </Link>
                <a href="https://wa.me/25377073377" target="_blank" rel="noopener noreferrer"
                  className="px-7 py-3 bg-[#25D366] rounded-full font-black uppercase tracking-widest text-sm text-white hover:bg-[#1ebe5d] transition-all hover:-translate-y-0.5">
                  {t("common.whatsapp")}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
