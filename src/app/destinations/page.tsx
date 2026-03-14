"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock, TrendingUp, Calendar } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateDestinations } from "@/lib/destinationTranslations";

export default function DestinationsPage() {
  const { t, locale } = useLanguage();
  const translatedDests = translateDestinations(destinations, locale);
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <Image
          src="/images/pics/PAYSAGES/paysage-5.webp"
          alt="Destinations Djibouti"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            {t("destinations.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80"
          >
            {destinations.length} {t("destinations.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {translatedDests.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 3) * 0.1 }}
                viewport={{ once: true }}
                className="card-hover"
              >
                <Link href={`/destinations/${dest.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                    <div className="h-56 relative overflow-hidden">
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold drop-shadow">{dest.name}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-500 text-sm leading-relaxed mb-5">{dest.description}</p>
                      <div className="flex flex-wrap gap-3 mb-5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#408398]" />
                          {dest.duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={13} className="text-[#408398]" />
                          {dest.difficulty}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#408398]" />
                          {dest.bestTime}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dest.highlights.slice(0, 2).map((h, hi) => (
                          <span key={hi} className="px-2.5 py-1 bg-[#408398]/10 text-[#408398] rounded-full text-xs font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center text-[#408398] font-medium text-sm">
                        <span>{t("destinations.discover")}</span>
                        <span className="ml-2">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
