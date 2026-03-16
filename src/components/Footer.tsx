"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none" style={{ height: "80px" }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z" fill="#f9fafb" />
        </svg>
      </div>

      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pics/logo/logoblanc.webp"
                  alt="Voyage Voyage Logo"
                  width={60}
                  height={60}
                  style={{ objectFit: "contain" }}
                />
                <div className="ml-3">
                  <h3 className="font-bold text-xl text-white uppercase tracking-widest">VOYAGE VOYAGE</h3>
                  <p className="text-xs text-gray-400 tracking-widest">{t("footer.tagline")}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t("footer.description")}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">{t("footer.navigation")}</h4>
              <ul className="space-y-2">
                {[
                  { href: "/", labelKey: "nav.home" },
                  { href: "/about", labelKey: "nav.about" },
                  { href: "/destinations", labelKey: "nav.destinations" },
                  { href: "/services", labelKey: "nav.services" },
                  { href: "/djibouti", labelKey: "nav.djibouti" },
                  { href: "/contact", labelKey: "nav.contact" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-gray-400 hover:text-[#408398] transition-colors text-sm flex items-center gap-2">
                      <span className="text-[#408398]">→</span>
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Destinations */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">{t("footer.destinationsLabel")}</h4>
              <ul className="space-y-2">
                {destinations.slice(0, 7).map((dest) => (
                  <li key={dest.id}>
                    <Link href={`/destinations/${dest.slug}`} className="text-gray-400 hover:text-[#408398] transition-colors text-sm flex items-center gap-2">
                      <span className="text-[#408398]">→</span>
                      {dest.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">{t("footer.contact")}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-[#408398] mt-0.5 shrink-0" />
                  <a href="tel:+25377073377" className="text-gray-400 hover:text-white transition-colors text-sm">+253 77 07 33 77</a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-[#408398] mt-0.5 shrink-0" />
                  <a href="mailto:voyagevoyagedjib@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm block">voyagevoyagedjib@gmail.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#408398] mt-0.5 shrink-0" />
                  <p className="text-gray-400 text-sm">Gabode 5 - Zone Stid<br />Extension Lot 227<br />Djibouti-Ville</p>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="text-[#408398] mt-0.5 shrink-0" />
                  <p className="text-gray-400 text-sm">Dim–Jeu : 8h30–12h30<br />& 16h30–18h00</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} VOYAGE VOYAGE. {t("footer.copyright")}
            </p>
            <a
              href="https://wa.me/25377073377"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#25D366] transition-colors text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
