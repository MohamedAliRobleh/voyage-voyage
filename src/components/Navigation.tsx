"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, Home, Info, Map, Phone, Flag, Briefcase, Package } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { useLanguage, Locale } from "@/contexts/LanguageContext";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "عربي", flag: "🇩🇯" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [destDropdown, setDestDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();

  const activeLang = languages.find((l) => l.code === locale) ?? languages[0];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/destinations", icon: Map, label: t("nav.destinations") },
    { href: "/services", icon: Briefcase, label: t("nav.services") },
    { href: "/contact", icon: Phone, label: t("nav.contact") },
  ];

  return (
    <>
      {/* ── Top Navbar ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-black/20 backdrop-blur-sm"
        }`}
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2" onClick={scrollToTop}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pics/logo/logovoyage.webp"
                alt="Voyage Voyage Logo"
                width={44}
                height={44}
                style={{ objectFit: "contain" }}
              />
              <span
                className={`font-bold tracking-widest text-sm uppercase hidden sm:block ${
                  isScrolled ? "text-[#408398]" : "text-white"
                }`}
              >
                VOYAGE VOYAGE
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <NavLink href="/" isScrolled={isScrolled} icon={<Home size={13} />} onClick={scrollToTop}>{t("nav.home")}</NavLink>
              <NavLink href="/about" isScrolled={isScrolled} icon={<Info size={13} />}>{t("nav.about")}</NavLink>

              {/* Destinations Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDestDropdown(true)}
                onMouseLeave={() => setDestDropdown(false)}
              >
                <button
                  className={`flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#408398]" : "text-white hover:text-white/80"
                  }`}
                >
                  <Map size={13} />
                  {t("nav.destinations")} <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {destDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-2 max-h-80 overflow-y-auto scrollbar-hide">
                        {destinations.map((dest) => (
                          <Link
                            key={dest.id}
                            href={`/destinations/${dest.slug}`}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[#408398]/10 text-gray-700 hover:text-[#408398] transition-colors"
                          >
                            <span className="text-[#408398] text-sm">→</span>
                            <span className="text-sm font-medium">{dest.name}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <Link
                          href="/destinations"
                          className="block w-full text-center py-2 bg-[#408398] text-white rounded-lg text-sm font-medium hover:bg-[#326e80] transition-colors"
                        >
                          {t("nav.allDestinations")}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="/services" isScrolled={isScrolled} icon={<Briefcase size={13} />}>{t("nav.services")}</NavLink>
            <NavLink href="/contact" isScrolled={isScrolled} icon={<Phone size={13} />}>{t("nav.contact")}</NavLink>

              {/* Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                    isScrolled
                      ? "border-gray-300 text-gray-700 hover:border-[#408398]"
                      : "border-white/50 text-white hover:border-white"
                  }`}
                >
                  <Globe size={14} />
                  <span className="text-xs font-semibold">{activeLang.flag} {activeLang.code.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {langDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setLocale(lang.code); setLangDropdown(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#408398]/10 transition-colors ${
                            locale === lang.code ? "text-[#408398] font-semibold bg-[#408398]/5" : "text-gray-700"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: Language badges directly visible */}
            <div className="lg:hidden flex items-center gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-bold transition-all ${
                    locale === lang.code
                      ? "bg-[#408398] text-white"
                      : isScrolled
                      ? "text-gray-500 hover:text-[#408398]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          transform: "translateZ(0)",
          willChange: "transform",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <div className="flex items-stretch h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={tab.href === "/" ? scrollToTop : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative min-h-[64px] active:bg-gray-50"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#408398] rounded-full"
                  />
                )}
                <tab.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-colors ${isActive ? "text-[#408398]" : "text-gray-400"}`}
                />
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors leading-none text-center px-1 ${
                    isActive ? "text-[#408398]" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Language Sheet ── */}
      <AnimatePresence>
        {mobileLangOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-[60]"
              onClick={() => setMobileLangOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-4 pb-6">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
                  {locale === "ar" ? "اختر اللغة" : locale === "en" ? "Choose language" : "Choisir la langue"}
                </p>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code); setMobileLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 text-sm font-medium transition-colors ${
                      locale === lang.code
                        ? "bg-[#408398]/10 text-[#408398]"
                        : "bg-gray-50 text-gray-700 active:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {locale === lang.code && <span className="ml-auto text-[#408398]">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children, isScrolled, icon, onClick }: { href: string; children: React.ReactNode; isScrolled: boolean; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase transition-colors ${
        isScrolled ? "text-gray-700 hover:text-[#408398]" : "text-white hover:text-white/80"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
