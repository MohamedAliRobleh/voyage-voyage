"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fr } from "@/lib/translations/fr";
import { en } from "@/lib/translations/en";
import { ar } from "@/lib/translations/ar";

const faqByLocale = { fr: fr.faq.items, en: en.faq.items, ar: ar.faq.items };

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const { locale } = useLanguage();
  const faqs = faqByLocale[locale];

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
            open === i ? "border-[#408398] shadow-lg" : "border-gray-100 shadow-sm hover:border-gray-200"
          }`}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left"
          >
            <span className={`font-bold uppercase tracking-wide text-sm ${open === i ? "text-[#408398]" : "text-gray-800"}`}>
              {faq.q}
            </span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className={`shrink-0 ml-4 ${open === i ? "text-[#408398]" : "text-gray-400"}`}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>

          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="px-6 pb-5">
                  <div className="h-px bg-gray-100 mb-4" />
                  <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
