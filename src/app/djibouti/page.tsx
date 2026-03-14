"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { fr } from "@/lib/translations/fr";
import { en } from "@/lib/translations/en";
import { ar } from "@/lib/translations/ar";

const translations = { fr, en, ar };

export default function DjiboutiPage() {
  const { locale, t } = useLanguage();
  const d = translations[locale].djiboutiPage;

  const facts = [
    { label: d.facts.capitale, value: "Djibouti-Ville" },
    { label: d.facts.population, value: "~1 million" },
    { label: d.facts.superficie, value: "23 200 km²" },
    { label: d.facts.langues, value: d.facts.languesValue },
    { label: d.facts.monnaie, value: "Franc Djiboutien (FDJ)" },
    { label: d.facts.fuseau, value: "UTC+3" },
    { label: d.facts.periode, value: d.facts.periodeValue },
    { label: d.facts.visa, value: d.facts.visaValue },
  ];

  const highlightImages = [
    "/images/pics/goubet/goubet1.webp",
    "/images/pics/PHOTO REQUIN BALEINE/rq2.webp",
    "/images/pics/ALLOLS/Allols.webp",
    "/images/pics/ditilou/Colibri.webp",
    "/images/pics/ABOURMA/Abourma.jpg",
    "/images/pics/lacabbe/lacabbe3.webp",
  ];

  const highlightEmojis = ["🌋", "🦈", "🏜️", "🦅", "🏛️", "⭐"];
  const practicalEmojis = ["📅", "✈️", "📋"];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 min-h-[60vh] flex items-center overflow-hidden">
        <Image
          src="/images/pics/PAYSAGES/paysage-4.webp"
          alt="Djibouti"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl mb-6 block">🇩🇯</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl font-bold mb-6">
            Djibouti
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-white/80">
            {d.hero.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[#408398] font-medium text-sm uppercase tracking-widest">{d.intro.label}</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">{d.intro.title}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{d.intro.p1}</p>
                <p>{d.intro.p2}</p>
                <p>{d.intro.p3}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {facts.map((fact, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{fact.label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{fact.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[
              "/images/pics/PAYSAGES/paysage-1.webp",
              "/images/pics/lacabbe/lacabbe1.webp",
              "/images/pics/LAC ASSAL/lacassal.webp",
              "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
              "/images/pics/LES ILES/iles1.webp",
            ].map((src, i) => (
              <div key={i} className="relative h-40 rounded-xl overflow-hidden">
                <Image src={src} alt="Djibouti" fill className="object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{d.highlights.title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {d.highlights.items.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: (i % 3) * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative h-40">
                  <Image src={highlightImages[i]} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-3 left-3 text-3xl">{highlightEmojis[i]}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900">{d.practical.title}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {d.practical.items.map((info, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-gray-50 rounded-2xl p-6">
                <div className="text-4xl mb-4">{practicalEmojis[i]}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{info.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden text-white text-center">
        <Image src="/images/pics/SABLE BLANC/sablesblanc4.webp" alt="Djibouti" fill className="object-cover" />
        <div className="absolute inset-0 bg-[#0e2d38]/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{d.cta.title}</h2>
          <p className="text-white/70 mb-8">{d.cta.desc}</p>
          <Link href="/destinations" className="inline-block px-8 py-4 bg-[#e8645a] text-white rounded-full font-semibold hover:bg-[#d4534a] transition-all">
            {d.cta.btn}
          </Link>
        </div>
      </section>
    </>
  );
}
