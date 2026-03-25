"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { fr } from "@/lib/translations/fr";
import { en } from "@/lib/translations/en";
import { ar } from "@/lib/translations/ar";

const slideSrcs = [
  "/images/pics/PAYSAGES/paysage-1.webp",
  "/images/pics/lacabbe/lacabbe1.webp",
  "/images/pics/LAC ASSAL/lacassal.webp",
  "/images/pics/SABLE BLANC/sablesblanc1.webp",
  "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
  "/images/pics/LES ILES/iles1.webp",
  "/images/pics/goubet/goubet1.webp",
];

const captionsByLocale = {
  fr: fr.carousel.captions,
  en: en.carousel.captions,
  ar: ar.carousel.captions,
};

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  const { locale } = useLanguage();
  const captions = captionsByLocale[locale];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slideSrcs.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slideSrcs.length) % slideSrcs.length);
  const next = () => setCurrent((c) => (c + 1) % slideSrcs.length);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slideSrcs[current]}
          alt={captions[current]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover absolute inset-0"
        />
      </AnimatePresence>

      {/* Logo overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <img
          src="/images/pics/logo/logoblanc.webp"
          alt="Voyage Voyage"
          className="w-28 h-28 object-contain opacity-80 drop-shadow-2xl"
        />
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="text-white font-bold uppercase tracking-widest text-sm">
          {captions[current]}
        </p>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {slideSrcs.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
