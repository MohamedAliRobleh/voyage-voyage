"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, TrendingUp, Calendar, ChevronLeft, CheckCircle, Phone, MessageCircle } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { use, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateDestination } from "@/lib/destinationTranslations";

export default function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const rawDestination = destinations.find((d) => d.slug === slug);

  if (!rawDestination) {
    notFound();
  }

  const { t, locale } = useLanguage();
  const destination = translateDestination(rawDestination, locale);
  const [activeImage, setActiveImage] = useState(0);
  const related = destinations.filter((d) => d.slug !== slug).slice(0, 3).map((d) => translateDestination(d, locale));

  return (
    <>
      {/* Hero with main image */}
      <section className="relative pt-20 min-h-[65vh] flex items-end overflow-hidden">
        <Image
          src={destination.images[activeImage]}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors text-sm"
          >
            <ChevronLeft size={16} /> {t("destination.backLink")}
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          >
            {destination.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 max-w-2xl drop-shadow"
          >
            {destination.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-6"
          >
            {[
              { icon: Clock, label: destination.duration },
              { icon: TrendingUp, label: destination.difficulty },
              { icon: Calendar, label: destination.bestTime },
            ].map((info, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                <info.icon size={14} />
                {info.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Thumbnails */}
      {destination.images.length > 1 && (
        <div className="bg-gray-900 py-3 px-4">
          <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto scrollbar-hide">
            {destination.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 transition-all ${
                  activeImage === i ? "ring-2 ring-[#408398] opacity-100" : "opacity-60 hover:opacity-80"
                }`}
              >
                <Image src={img} alt={`${destination.name} ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t("destination.about")} {destination.name}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {destination.longDescription}
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">{t("destination.highlights")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {destination.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#408398]/5 rounded-xl">
                    <CheckCircle size={18} className="text-[#408398] shrink-0" />
                    <span className="text-gray-700 text-sm">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Photo gallery */}
              {destination.images.length > 1 && (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t("destination.gallery")}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {destination.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative h-40 rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => setActiveImage(i)}
                      >
                        <Image
                          src={img}
                          alt={`${destination.name} photo ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">{t("destination.info.title")}</h3>
                <div className="space-y-4">
                  {[
                    { icon: Clock, label: t("destination.info.duration"), value: destination.duration },
                    { icon: TrendingUp, label: t("destination.info.difficulty"), value: destination.difficulty },
                    { icon: Calendar, label: t("destination.info.bestTime"), value: destination.bestTime },
                  ].map((info, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#408398]/10 rounded-lg flex items-center justify-center">
                        <info.icon size={16} className="text-[#408398]" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">{info.label}</div>
                        <div className="text-sm font-medium text-gray-900">{info.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#408398] to-[#265868] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">{t("destination.book.title")}</h3>
                <p className="text-white/80 text-sm mb-5">
                  {t("destination.book.desc")} {destination.name}.
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/25377073377?text=${encodeURIComponent(t("contact.info.waMessage") || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#25D366] px-4 py-3 rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm font-medium"
                  >
                    <MessageCircle size={18} />
                    {t("destination.book.whatsapp")}
                  </a>
                  <a
                    href="tel:+25377073377"
                    className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm font-medium"
                  >
                    <Phone size={18} />
                    {t("destination.book.phone")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t("destination.others.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/destinations/${dest.slug}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-40 relative overflow-hidden">
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">{dest.name}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{dest.description}</p>
                      <div className="text-[#408398] text-sm font-medium mt-3">{t("destination.others.discover")}</div>
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
