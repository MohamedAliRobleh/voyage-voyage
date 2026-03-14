"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Globe, Home, Info, Map, Phone } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { useLanguage, Locale } from "@/contexts/LanguageContext";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "عربي", flag: "🇩🇯" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [destDropdown, setDestDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useLanguage();

  const activeLang = languages.find((l) => l.code === locale) ?? languages[0];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-black/20 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
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
            <NavLink href="/" isScrolled={isScrolled} icon={<Home size={13} />}>{t("nav.home")}</NavLink>
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-white"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 py-4 space-y-1">
              <MobileLink href="/" onClick={() => setMobileOpen(false)}>{t("nav.home")}</MobileLink>
              <MobileLink href="/about" onClick={() => setMobileOpen(false)}>{t("nav.about")}</MobileLink>
              <div>
                <button
                  onClick={() => setDestDropdown(!destDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  {t("nav.destinations")} <ChevronDown size={16} />
                </button>
                <AnimatePresence>
                  {destDropdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-1 mt-1"
                    >
                      {destinations.map((dest) => (
                        <Link
                          key={dest.id}
                          href={`/destinations/${dest.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-[#408398] rounded-lg"
                        >
                          {dest.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <MobileLink href="/contact" onClick={() => setMobileOpen(false)}>{t("nav.contact")}</MobileLink>

              {/* Mobile Language Switcher */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex gap-2 px-4 py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setMobileOpen(false); }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        locale === lang.code
                          ? "bg-[#408398] text-white border-[#408398]"
                          : "border-gray-200 text-gray-600 hover:border-[#408398]"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ href, children, isScrolled, icon }: { href: string; children: React.ReactNode; isScrolled: boolean; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase transition-colors ${
        isScrolled ? "text-gray-700 hover:text-[#408398]" : "text-white hover:text-white/80"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-[#408398] transition-colors"
    >
      {children}
    </Link>
  );
}
