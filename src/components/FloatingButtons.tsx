"use client";

import { useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const whatsappMessages = {
  fr: "Bonjour! Je suis intéressé par vos services touristiques à Djibouti",
  en: "Hello! I am interested in your tourist services in Djibouti",
  ar: "مرحباً! أنا مهتم بخدماتكم السياحية في جيبوتي",
};

export default function FloatingButtons() {
  const [open, setOpen] = useState(false);
  const { locale } = useLanguage();
  const waMessage = encodeURIComponent(whatsappMessages[locale]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 lg:bottom-6 mb-16 lg:mb-0">
      <AnimatePresence>
        {open && (
          <>
            {/* WhatsApp */}
            <motion.a
              href={`https://wa.me/25377073377?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#1ebe5d] transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">WhatsApp</span>
            </motion.a>

            {/* Phone */}
            <motion.a
              href="tel:+25377073377"
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3 bg-[#408398] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#326e80] transition-colors"
            >
              <Phone size={20} />
              <span className="text-sm font-medium">+253 77 07 33 77</span>
            </motion.a>
          </>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-[#408398] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#326e80] transition-colors animate-pulse-glow"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="phone"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Phone size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
