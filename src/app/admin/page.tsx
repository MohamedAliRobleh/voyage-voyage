"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LayoutDashboard, Calendar, Building2,
  Users, FileText, TrendingUp, Eye, EyeOff, LogOut,
  Wallet, ClipboardList, BarChart2, FileDown, Star, Megaphone,
} from "lucide-react";
import ClientsSection from "./ClientsSection";
import FacturesSection from "./FacturesSection";
import ReversementsSection from "./ReversementsSection";
import DashboardSection from "./DashboardSection";
import CalendarSection from "./CalendarSection";
import PartenairesSection from "./PartenairesSection";
import TresorerieSection from "./TresorerieSection";
import OperationsSection from "./OperationsSection";
import AnalyticsSection from "./AnalyticsSection";
import RapportsSection from "./RapportsSection";
import ReputationSection from "./ReputationSection";
import MessagesSection from "./MessagesSection";
import { supabase } from "@/lib/supabase";

type Tab = "dashboard" | "clients" | "factures" | "reversements" | "calendrier" | "partenaires" | "tresorerie" | "operations" | "analytics" | "rapports" | "reputation" | "messages";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    // Vérifie si une session Supabase existe déjà
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setAuthenticated(true);
      setLoading(false);
    });
    // Écoute les changements de session
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setEmail("");
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
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="Email"
              autoComplete="email"
              className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#408398]/20 focus:border-[#408398]"
              }`}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Mot de passe"
                autoComplete="current-password"
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
              disabled={loading || !password || !email}
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { id: "calendrier", label: "Calendrier", icon: <Calendar size={15} /> },
    { id: "partenaires", label: "Partenaires", icon: <Building2 size={15} /> },
    { id: "clients", label: "Clients", icon: <Users size={15} /> },
    { id: "factures", label: "Factures", icon: <FileText size={15} /> },
    { id: "reversements", label: "Reversements", icon: <TrendingUp size={15} /> },
    { id: "tresorerie", label: "Trésorerie", icon: <Wallet size={15} /> },
    { id: "operations", label: "Opérations", icon: <ClipboardList size={15} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={15} /> },
    { id: "rapports", label: "Rapports", icon: <FileDown size={15} /> },
    { id: "reputation", label: "Réputation", icon: <Star size={15} /> },
    { id: "messages",   label: "Messages",   icon: <Megaphone size={15} /> },
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
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex flex-wrap gap-0 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#408398] text-[#408398]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[9px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

        <div className={activeTab === "dashboard" ? "" : "hidden"}><DashboardSection /></div>
        <div className={activeTab === "clients" ? "" : "hidden"}><ClientsSection /></div>
        <div className={activeTab === "factures" ? "" : "hidden"}><FacturesSection /></div>
        <div className={activeTab === "calendrier" ? "" : "hidden"}><CalendarSection /></div>
        <div className={activeTab === "partenaires" ? "" : "hidden"}><PartenairesSection /></div>
        <div className={activeTab === "reversements" ? "" : "hidden"}><ReversementsSection /></div>
        <div className={activeTab === "tresorerie" ? "" : "hidden"}><TresorerieSection /></div>
        <div className={activeTab === "operations" ? "" : "hidden"}><OperationsSection /></div>
        <div className={activeTab === "analytics" ? "" : "hidden"}><AnalyticsSection /></div>
        <div className={activeTab === "rapports" ? "" : "hidden"}><RapportsSection /></div>
        <div className={activeTab === "reputation" ? "" : "hidden"}><ReputationSection /></div>
        <div className={activeTab === "messages" ? "" : "hidden"}><MessagesSection /></div>

      </div>
    </div>
  );
}
