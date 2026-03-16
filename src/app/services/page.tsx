"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const services = [
  {
    emoji: "🚗",
    title: "Transferts & Transport",
    desc: "Véhicules 4x4 confortables avec chauffeurs expérimentés pour tous vos déplacements à Djibouti.",
    features: [
      "4x4 climatisés",
      "Chauffeurs bilingues",
      "Transferts aéroport",
      "Circuits privatifs",
    ],
  },
  {
    emoji: "🧭",
    title: "Guides Touristiques",
    desc: "Des guides locaux passionnés qui vous feront découvrir les secrets de chaque destination.",
    features: [
      "Guides certifiés",
      "Multilingues (FR/EN/AR)",
      "Expertise naturelle",
      "Guides culturels",
    ],
  },
  {
    emoji: "🏕️",
    title: "Camping & Bivouac",
    desc: "Des nuits inoubliables sous les étoiles djiboutiennes dans un confort optimal.",
    features: [
      "Tentes équipées",
      "Repas préparés",
      "Matériel fourni",
      "Sites sécurisés",
    ],
  },
  {
    emoji: "🤿",
    title: "Activités Nautiques",
    desc: "Plongée, snorkeling et nage avec les requins-baleines dans les eaux cristallines.",
    features: [
      "Équipement inclus",
      "Instructeurs certifiés",
      "Bateaux modernes",
      "Toutes niveaux",
    ],
  },
  {
    emoji: "📸",
    title: "Circuits Photo",
    desc: "Des itinéraires spécialement conçus pour capturer la beauté unique de Djibouti.",
    features: [
      "Meilleurs spots",
      "Lumières idéales",
      "Petits groupes",
      "Conseils photo",
    ],
  },
  {
    emoji: "🏨",
    title: "Hébergement",
    desc: "Sélection des meilleurs hôtels, lodges et camps pour un séjour parfait à Djibouti.",
    features: [
      "Hôtels triés",
      "Lodges nature",
      "Camps de luxe",
      "Budget adapté",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#0e2d38] via-[#1a4250] to-[#265868]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Nos Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80"
          >
            Tout ce dont vous avez besoin pour un voyage parfait à Djibouti,
            organisé avec soin et passion.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 3) * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow card-hover"
              >
                <div className="text-4xl mb-5">{service.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {service.desc}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm">
                      <Check
                        size={14}
                        className="text-[#408398] shrink-0"
                      />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#408398] to-[#265868] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Des services sur mesure pour votre voyage
          </h2>
          <p className="text-white/70 mb-8">
            Chaque voyage est unique. Contactez-nous pour un devis personnalisé
            adapté à vos besoins et votre budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-[#408398] rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
