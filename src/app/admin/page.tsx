"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LayoutDashboard, MapPin, Globe, Phone, Mail,
  Users, FileText, TrendingUp, Eye, EyeOff, LogOut,
  Map, Briefcase, Package, MessageCircle, Clock, CheckCircle,
} from "lucide-react";
import { destinations } from "@/lib/destinations";

const ADMIN_PASSWORD = "vv2024admin";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("vv-admin");
    if (auth === "true") setAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("vv-admin", "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vv-admin");
    setAuthenticated(false);
    setPassword("");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0e2d38] via-[#1a4250] to-[#265868] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm"
        >
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/pics/logo/logovoyage.webp" alt="Logo" width={64} height={64} className="rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Administration</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Voyage Voyage — Accès restreint</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Mot de passe"
                className={`w-full px-4 py-3 pr-12 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                  error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#408398]/20 focus:border-[#408398]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  Mot de passe incorrect
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-[#408398] text-white rounded-xl font-semibold hover:bg-[#326e80] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const pages = [
    { label: "Accueil", href: "/", icon: LayoutDashboard },
    { label: "Destinations", href: "/destinations", icon: Map },
    { label: "Services", href: "/services", icon: Briefcase },
    { label: "Packages", href: "/packages", icon: Package },
    { label: "Djibouti", href: "/djibouti", icon: Globe },
    { label: "À propos", href: "/about", icon: Users },
    { label: "Contact", href: "/contact", icon: MessageCircle },
  ];

  const stats = [
    { label: "Destinations", value: destinations.length, icon: MapPin, color: "bg-blue-50 text-blue-600" },
    { label: "Pages actives", value: pages.length, icon: FileText, color: "bg-green-50 text-green-600" },
    { label: "Langues", value: "3 (FR/EN/AR)", icon: Globe, color: "bg-purple-50 text-purple-600" },
    { label: "Packages", value: 3, icon: Package, color: "bg-orange-50 text-orange-600" },
  ];

  const contactInfo = [
    { icon: Phone, label: "Téléphone", value: "+253 77 07 33 77" },
    { icon: MessageCircle, label: "WhatsApp", value: "+253 77 07 33 77" },
    { icon: Mail, label: "Email", value: "voyagevoyagedjib@gmail.com" },
    { icon: MapPin, label: "Adresse", value: "Gabode 5 - Zone Stid, Extension Lot 227, Djibouti-Ville" },
    { icon: Clock, label: "Horaires", value: "Lun–Sam : 8h–18h" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0e2d38] to-[#265868] text-white px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/pics/logo/logovoyage.webp" alt="Logo" width={40} height={40} className="rounded-full" />
          <div>
            <h1 className="font-bold text-lg leading-none">Administration</h1>
            <p className="text-white/60 text-xs mt-0.5">Voyage Voyage — Dashboard</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Vue d&apos;ensemble</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Analytics notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#408398]/10 border border-[#408398]/20 rounded-2xl p-5 flex gap-4"
        >
          <div className="w-10 h-10 bg-[#408398]/20 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-[#408398]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Statistiques de visites</p>
            <p className="text-gray-500 text-sm mt-1">
              Vercel Analytics est <strong className="text-green-600">activé</strong>. Les statistiques détaillées (visites, pages populaires, pays des visiteurs) sont visibles directement sur{" "}
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#408398] underline font-medium">vercel.com → Analytics</a>.
            </p>
          </div>
        </motion.div>

        {/* Pages */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Pages du site</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {pages.map((page, i) => (
              <a
                key={i}
                href={page.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#408398]/10 rounded-lg flex items-center justify-center">
                    <page.icon size={15} className="text-[#408398]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{page.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={11} />
                    En ligne
                  </span>
                  <Eye size={15} className="text-gray-300" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Informations de contact affichées</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {contactInfo.map((item, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-[#408398]/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon size={15} className="text-[#408398]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
