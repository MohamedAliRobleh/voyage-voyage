"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star } from "lucide-react";

const packages = [
  {
    name: "Découverte",
    duration: "3 jours / 2 nuits",
    price: "À partir de 150 USD",
    popular: false,
    color: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    destinations: ["Lac Assal", "Sables Blancs", "Djibouti-Ville"],
    includes: [
      "Transport en 4x4",
      "Guide francophone",
      "Hébergement 2 nuits",
      "Repas inclus",
      "Entrées sites",
    ],
  },
  {
    name: "Explorer",
    duration: "5 jours / 4 nuits",
    price: "À partir de 280 USD",
    popular: true,
    color: "from-[#408398]/10 to-[#265868]/20",
    borderColor: "border-[#408398]",
    destinations: ["Lac Assal", "Lac Abbé", "Sables Blancs", "Iles Moucha", "Goubet"],
    includes: [
      "Transport en 4x4 tout-terrain",
      "Guide expert bilingue",
      "Hébergement 4 nuits",
      "Tous repas inclus",
      "Toutes entrées",
      "Snorkeling équipement",
      "Bivouac sous les étoiles",
    ],
  },
  {
    name: "Aventure Totale",
    duration: "8 jours / 7 nuits",
    price: "À partir de 490 USD",
    popular: false,
    color: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    destinations: [
      "Lac Assal", "Lac Abbé", "Forêt du Day", "Abourma",
      "Requin-Baleine", "Iles Moucha & Maskali", "Obock",
    ],
    includes: [
      "Transport premium 4x4",
      "Guide expert naturaliste",
      "Hébergement 7 nuits",
      "Pension complète",
      "Toutes entrées et permis",
      "Nage avec requin-baleine",
      "Plongée équipement",
      "Bivouac et camping",
      "Photos professionnelles",
    ],
  },
];

export default function PackagesPage() {
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
            Nos Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80"
          >
            Des formules tout-inclus conçues pour vivre Djibouti pleinement,
            sans vous soucier de rien.
          </motion.p>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-gradient-to-b ${pkg.color} rounded-2xl border-2 ${pkg.borderColor} overflow-hidden`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-[#408398] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                    <Star size={12} fill="white" />
                    Populaire
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-[#408398] font-medium text-sm mb-2">
                    {pkg.duration}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-6">
                    {pkg.price}
                  </p>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Destinations incluses
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.destinations.map((dest, di) => (
                        <span
                          key={di}
                          className="px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                        >
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Inclus dans le package
                    </p>
                    <ul className="space-y-2">
                      {pkg.includes.map((item, ii) => (
                        <li key={ii} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-[#408398] shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/contact?package=${pkg.name}`}
                    className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      pkg.popular
                        ? "bg-[#408398] text-white hover:bg-[#326e80]"
                        : "bg-white text-[#408398] border-2 border-[#408398] hover:bg-[#408398] hover:text-white"
                    }`}
                  >
                    Réserver ce package
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Package personnalisé ?
            </h3>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto">
              Vous avez des besoins spécifiques ou un groupe ? Nous créons des
              packages sur mesure adaptés à votre voyage de rêve.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-[#e8645a] text-white rounded-full font-semibold hover:bg-[#d4534a] transition-all"
            >
              Créer mon package sur mesure
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
