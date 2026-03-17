"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(t("contact.form.success"));
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
    setLoading(false);
  };

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
            {t("contact.hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80"
          >
            {t("contact.hero.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contact.info.title")}
                </h2>

                <div className="space-y-5">
                  {[
                    {
                      icon: Phone,
                      label: t("contact.info.phone"),
                      content: (
                        <a
                          href="tel:+25377073377"
                          className="text-[#408398] hover:underline"
                        >
                          +253 77 07 33 77
                        </a>
                      ),
                    },
                    {
                      icon: MessageCircle,
                      label: t("contact.info.whatsapp"),
                      content: (
                        <a
                          href="https://wa.me/25377073377"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:underline"
                        >
                          +253 77 07 33 77
                        </a>
                      ),
                    },
                    {
                      icon: Mail,
                      label: t("contact.info.email"),
                      content: (
                        <div className="space-y-1">
                          
                          <a
                            href="mailto:voyagevoyagedjib@gmail.com"
                            className="block text-[#408398] hover:underline text-sm"
                          >
                            voyagevoyagedjib@gmail.com
                          </a>
                        </div>
                      ),
                    },
                    {
                      icon: MapPin,
                      label: t("contact.info.address"),
                      content: (
                        <p className="text-gray-600 text-sm">
                          Gabode 5 - Zone Stid
                          <br />
                          Extension Lot 227
                          <br />
                          Djibouti-Ville, Djibouti
                        </p>
                      ),
                    },
                    {
                      icon: Clock,
                      label: t("contact.info.hours"),
                      content: (
                        <p className="text-gray-600 text-sm" style={{ whiteSpace: "pre-line" }}>
                          {t("contact.info.schedule")}
                        </p>
                      ),
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-[#408398]/10 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon size={18} className="text-[#408398]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {item.label}
                        </p>
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/25377073377?text=${encodeURIComponent(t("contact.info.waMessage") || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#1ebe5d] transition-colors"
                >
                  <MessageCircle size={20} />
                  {t("contact.info.whatsappBtn")}
                </a>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contact.form.title")}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("contact.form.name")}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder={t("contact.form.namePlaceholder")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("contact.form.email")}
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder={t("contact.form.emailPlaceholder")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("contact.form.phone")}
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder={t("contact.form.phonePlaceholder")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("contact.form.subject")}
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/20 transition-all"
                      >
                        <option value="">{t("contact.form.subjectDefault")}</option>
                        <option value="reservation">{t("contact.form.subjectReservation")}</option>
                        <option value="info">{t("contact.form.subjectInfo")}</option>
                        <option value="groupe">{t("contact.form.subjectGroup")}</option>
                        <option value="autre">{t("contact.form.subjectOther")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("contact.form.message")}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder={t("contact.form.messagePlaceholder")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-[#408398] text-white py-4 rounded-xl font-semibold hover:bg-[#326e80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    {loading ? t("contact.form.sending") : t("contact.form.send")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
