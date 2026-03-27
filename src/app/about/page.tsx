"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, Target, Eye, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[50vh] flex items-center">
        <Image
          src="/images/pics/PAYSAGES/IMG_20181119_054611_638.webp"
          alt="À Propos Voyage Voyage"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm mb-6">
            {t("about.hero.pill")}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl sm:text-5xl font-bold mb-6">
            {t("about.hero.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg sm:text-xl text-white/80 leading-relaxed">
            {t("about.hero.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[#408398] font-medium text-sm uppercase tracking-widest">{t("about.story.label")}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">{t("about.story.title")}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("about.story.p1")}</p>
                <p>{t("about.story.p2")}</p>
                <p>{t("about.story.p3")}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              {/* Image principale grande */}
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl mb-3 bg-gray-100">
                <img src="/images/pics/PAYSAGES/paysage-6.webp" alt="Djibouti paysage" className="w-full h-full object-contain" />
              </div>
              {/* Deux petites images en bas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-40 rounded-xl overflow-hidden shadow-md">
                  <img src="/images/pics/lacabbe/lacabbe2.webp" alt="Lac Abbé" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2">
                    <span className="text-gray-800 text-xs font-bold bg-white/80 px-2 py-0.5 rounded-full">Lac Abbé</span>
                  </div>
                </div>
                <div className="relative h-32 rounded-xl overflow-hidden shadow-md">
                  <img src="/images/pics/LAC ASSAL/lacassal2.webp" alt="Lac Assal" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2">
                    <span className="text-white text-xs font-bold bg-black/40 px-2 py-0.5 rounded-full">Lac Assal</span>
                  </div>
                </div>
              </div>
              {/* Badge stat */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl px-5 py-3 shadow-xl text-center">
                <div className="text-3xl font-black text-[#408398]">10+</div>
                <div className="text-xs text-gray-500 font-medium">{t("about.story.badge")}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[#408398] font-medium text-sm uppercase tracking-widest">{t("about.values.label")}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">{t("about.values.title")}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Heart, title: t("about.values.passion.title"), desc: t("about.values.passion.desc"), color: "text-red-500 bg-red-50" },
              { icon: Target, title: t("about.values.excellence.title"), desc: t("about.values.excellence.desc"), color: "text-[#408398] bg-[#408398]/10" },
              { icon: Eye, title: t("about.values.authenticity.title"), desc: t("about.values.authenticity.desc"), color: "text-green-500 bg-green-50" },
              { icon: Users, title: t("about.values.community.title"), desc: t("about.values.community.desc"), color: "text-purple-500 bg-purple-50" },
            ].map((val, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl p-8 flex gap-6 shadow-sm">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${val.color}`}>
                  <val.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{val.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t("about.gallery.title")}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "/images/pics/SABLE BLANC/sablesblanc1.webp",
              "/images/pics/goubet/goubet1.webp",
              "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
              "/images/pics/LES ILES/iles1.webp",
              "/images/pics/lacabbe/lacabbe1.webp",
              "/images/pics/LAC ASSAL/lacassal.webp",
              "/images/pics/loubatanleh/loubatanleh.webp",
              "/images/pics/ABOURMA/Abourma.jpg",
            ].map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`relative rounded-xl overflow-hidden ${i % 3 === 0 ? "h-56" : "h-40"}`}
              >
                <Image src={src} alt="Voyage Voyage" fill className="object-cover hover:scale-105 transition-transform duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0e2d38] to-[#265868] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{t("about.cta.title")}</h2>
          <p className="text-white/70 mb-8">
            {t("about.cta.desc")}
          </p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-[#e8645a] text-white rounded-full font-semibold hover:bg-[#d4534a] transition-all">
            {t("about.cta.button")}
          </Link>
        </div>
      </section>
    </>
  );
}
