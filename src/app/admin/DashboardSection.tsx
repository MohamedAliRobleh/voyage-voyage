"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture, Reversement } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Wallet, ArrowDownCircle, Target,
  AlertTriangle, CheckCircle, Clock, Users, FileText, Calendar,
  Activity, ChevronDown,
} from "lucide-react";

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

const PERIODS = [
  { label: "Ce mois", value: "month" },
  { label: "Ce trimestre", value: "quarter" },
  { label: "Cette année", value: "year" },
  { label: "Tout", value: "all" },
];

function getRange(period: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  let start: Date, end: Date, prevStart: Date, prevEnd: Date;
  if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  } else if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3, 1);
    end = new Date(now.getFullYear(), q * 3 + 3, 0);
    prevStart = new Date(now.getFullYear(), (q - 1) * 3, 1);
    prevEnd = new Date(now.getFullYear(), q * 3, 0);
  } else if (period === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31);
    prevStart = new Date(now.getFullYear() - 1, 0, 1);
    prevEnd = new Date(now.getFullYear() - 1, 11, 31);
  } else {
    start = new Date(2000, 0, 1);
    end = new Date(2100, 0, 1);
    prevStart = new Date(2000, 0, 1);
    prevEnd = new Date(2000, 0, 2);
  }
  return { start, end, prevStart, prevEnd };
}

function parseLocalDate(s: string): Date {
  if (s.includes("T") || s.length > 10) return new Date(s);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function inRange(dateStr: string, start: Date, end: Date) {
  const d = parseLocalDate(dateStr);
  return d >= start && d <= end;
}

function variation(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

// Simple SVG bar chart for last 6 months
function BarChart({ factures, reversements }: { factures: Facture[]; reversements: Reversement[] }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  const data = months.map(m => {
    const ca = factures
      .filter(f => { const p = parseLocalDate(f.date); return f.statut === "payé" && f.type === "facture" && p.getFullYear() === m.year && p.getMonth() === m.month; })
      .reduce((s, f) => s + f.total, 0);
    const charges = reversements
      .filter(r => new Date(r.created_at).getFullYear() === m.year && new Date(r.created_at).getMonth() === m.month)
      .reduce((s, r) => s + r.marge, 0);
    return { ...m, ca, marge: ca - charges };
  });

  const maxVal = Math.max(...data.map(d => d.ca), 1);
  const H = 80;
  const W = 100 / data.length;

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 h-24 px-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5" style={{ height: `${H}px` }}>
              {/* CA bar */}
              <div
                className="flex-1 bg-[#408398]/30 rounded-t-md transition-all"
                style={{ height: `${Math.max((d.ca / maxVal) * H, d.ca > 0 ? 4 : 0)}px` }}
                title={`CA: ${fmt(d.ca)}`}
              />
              {/* Marge bar */}
              <div
                className="flex-1 bg-purple-400/60 rounded-t-md transition-all"
                style={{ height: `${Math.max((d.marge / maxVal) * H, d.marge > 0 ? 4 : 0)}px` }}
                title={`Marge: ${fmt(d.marge)}`}
              />
            </div>
            <span className="text-[9px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#408398]/30" />
          <span className="text-[10px] text-gray-400">CA encaissé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-400/60" />
          <span className="text-[10px] text-gray-400">Marge nette</span>
        </div>
      </div>
    </div>
  );
}

// Funnel pipeline
function PipelineFunnel({ factures }: { factures: Facture[] }) {
  const statutOrder = ["brouillon", "envoyé", "en_negociation", "accepté", "confirmé", "payé"] as const;
  const labels: Record<string, string> = {
    brouillon: "Brouillon", envoyé: "Envoyé", en_negociation: "En discussion",
    accepté: "Accepté", confirmé: "Confirmé", payé: "Payé / Réalisé",
  };
  const colors: Record<string, string> = {
    brouillon: "bg-gray-200", envoyé: "bg-blue-200", en_negociation: "bg-amber-200",
    accepté: "bg-emerald-200", confirmé: "bg-purple-200", payé: "bg-teal-200",
  };
  const textColors: Record<string, string> = {
    brouillon: "text-gray-600", envoyé: "text-blue-700", en_negociation: "text-amber-700",
    accepté: "text-emerald-700", confirmé: "text-purple-700", payé: "text-teal-700",
  };

  const counts = statutOrder.map(s => ({
    statut: s,
    count: factures.filter(f => f.statut === s).length,
    total: factures.filter(f => f.statut === s).reduce((sum, f) => sum + f.total, 0),
  }));

  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="space-y-2">
      {counts.map((c, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400 w-24 shrink-0 text-right">{labels[c.statut]}</span>
          <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden">
            <div
              className={`h-full ${colors[c.statut]} rounded-lg flex items-center px-2.5 transition-all`}
              style={{ width: c.count > 0 ? `${Math.max((c.count / maxCount) * 100, 12)}%` : "0%" }}
            >
              {c.count > 0 && (
                <span className={`text-[10px] font-bold ${textColors[c.statut]}`}>{c.count}</span>
              )}
            </div>
          </div>
          <span className="text-[10px] font-semibold text-gray-500 w-28 shrink-0">{c.total > 0 ? fmt(c.total) : "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardSection() {
  const [period, setPeriod] = useState("month");
  const [showPeriod, setShowPeriod] = useState(false);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [reversements, setReversements] = useState<Reversement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: f }, { data: r }] = await Promise.all([
        supabase.from("factures").select("*").order("created_at", { ascending: false }),
        supabase.from("reversements").select("*").order("created_at", { ascending: false }),
      ]);
      setFactures(f || []);
      setReversements(r || []);
      setLoading(false);
    };
    load();
  }, []);

  const { start, end, prevStart, prevEnd } = getRange(period);

  // Current period
  const paidCurr = factures.filter(f => f.statut === "payé" && f.type === "facture" && inRange(f.date, start, end));
  const caBrut = paidCurr.reduce((s, f) => s + f.total, 0);
  const chargesCurr = reversements.filter(r => inRange(r.created_at, start, end)).reduce((s, r) => s + r.marge, 0);
  const margeBrute = caBrut - chargesCurr;
  const tauxMarge = caBrut > 0 ? (margeBrute / caBrut) * 100 : 0;
  const voyagesCurr = paidCurr.length;

  // Previous period
  const paidPrev = factures.filter(f => f.statut === "payé" && f.type === "facture" && inRange(f.date, prevStart, prevEnd));
  const caPrev = paidPrev.reduce((s, f) => s + f.total, 0);
  const chargesPrev = reversements.filter(r => inRange(r.created_at, prevStart, prevEnd)).reduce((s, r) => s + r.marge, 0);
  const margePrev = caPrev - chargesPrev;
  const voyagesPrev = paidPrev.length;

  // Panier moyen
  const panierMoyen = voyagesCurr > 0 ? Math.round(caBrut / voyagesCurr) : 0;
  const panierPrev = voyagesPrev > 0 ? Math.round(caPrev / voyagesPrev) : 0;

  // Clients uniques
  const clientsUniques = new Set(paidCurr.map(f => f.client_nom)).size;
  const clientsPrev = new Set(paidPrev.map(f => f.client_nom)).size;

  // Taux de conversion devis → facture
  const totalDevis = factures.filter(f => f.type === "devis").length;
  const devisAcceptes = factures.filter(f => f.type === "devis" && ["accepté", "confirmé", "payé"].includes(f.statut)).length;
  const tauxConversion = totalDevis > 0 ? Math.round((devisAcceptes / totalDevis) * 100) : 0;

  // Alertes
  const reversementsEnAttente = reversements.filter(r => r.statut === "à reverser");
  const montantEnAttente = reversementsEnAttente.reduce((s, r) => s + r.marge, 0);
  const paidNonCloturees = factures.filter(f => {
    if (f.statut !== "payé") return false;
    return !reversements.some(r => r.facture_id === f.id);
  });
  const today = new Date();
  const devisExpires = factures.filter(f =>
    f.type === "devis" && f.statut === "envoyé" && f.echeance && parseLocalDate(f.echeance) < today
  );
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const voyagesProches = factures.filter(f => {
    if (f.statut !== "confirmé") return false;
    if (!f.date_depart) return false;
    const diff = (parseLocalDate(f.date_depart).getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const kpis = [
    {
      label: "CA Brut encaissé",
      value: fmt(caBrut),
      prev: variation(caBrut, caPrev),
      icon: Wallet,
      color: "bg-blue-50 text-blue-600",
      sub: `${voyagesCurr} voyage${voyagesCurr > 1 ? "s" : ""}`,
    },
    {
      label: "Dû aux partenaires",
      value: fmt(chargesCurr),
      prev: variation(chargesCurr, chargesPrev),
      icon: ArrowDownCircle,
      color: "bg-red-50 text-red-500",
      sub: "reversements",
      invertTrend: true,
    },
    {
      label: "Marge nette",
      value: fmt(margeBrute),
      prev: variation(margeBrute, margePrev),
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      sub: `${tauxMarge.toFixed(1)}% du CA`,
    },
    {
      label: "Panier moyen",
      value: fmt(panierMoyen),
      prev: variation(panierMoyen, panierPrev),
      icon: Target,
      color: "bg-amber-50 text-amber-600",
      sub: `${clientsUniques} client${clientsUniques > 1 ? "s" : ""} unique${clientsUniques > 1 ? "s" : ""}`,
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
    </div>
  );

  const periodLabel = PERIODS.find(p => p.value === period)?.label || "Ce mois";

  return (
    <div className="space-y-8">

      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700">Tableau de bord exécutif</h2>
        <div className="relative">
          <button onClick={() => setShowPeriod(!showPeriod)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar size={13} className="text-[#408398]" />
            {periodLabel}
            <ChevronDown size={13} className="text-gray-400" />
          </button>
          {showPeriod && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
              {PERIODS.map(p => (
                <button key={p.value} onClick={() => { setPeriod(p.value); setShowPeriod(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${period === p.value ? "bg-[#408398]/10 text-[#408398] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const isPositive = k.invertTrend ? k.prev <= 0 : k.prev >= 0;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                <k.icon size={18} />
              </div>
              <p className="text-xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400">{k.sub}</span>
                {period !== "all" && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {pct(k.prev)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Taux de conversion", value: `${tauxConversion}%`, sub: "devis → facture", icon: Activity, color: "text-[#408398]" },
          { label: "Clients uniques", value: clientsUniques, sub: "sur la période", icon: Users, color: "text-purple-600" },
          { label: "Documents actifs", value: factures.filter(f => !["payé"].includes(f.statut)).length, sub: "en cours de traitement", icon: FileText, color: "text-amber-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
            className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-[10px] text-gray-300">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alertes */}
      {(reversementsEnAttente.length > 0 || paidNonCloturees.length > 0 || devisExpires.length > 0 || voyagesProches.length > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Alertes & Actions requises</h2>
          <div className="space-y-2">
            {reversementsEnAttente.length > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700 flex-1">
                  <span className="font-bold">{reversementsEnAttente.length} reversement{reversementsEnAttente.length > 1 ? "s" : ""}</span> en attente de paiement aux sites —{" "}
                  <span className="font-bold">{fmt(montantEnAttente)}</span>
                </p>
              </div>
            )}
            {paidNonCloturees.length > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Clock size={15} className="text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 flex-1">
                  <span className="font-bold">{paidNonCloturees.length} facture{paidNonCloturees.length > 1 ? "s" : ""} payée{paidNonCloturees.length > 1 ? "s" : ""}</span> non encore clôturée{paidNonCloturees.length > 1 ? "s" : ""} dans les reversements
                </p>
              </div>
            )}
            {devisExpires.length > 0 && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                <FileText size={15} className="text-orange-500 shrink-0" />
                <p className="text-sm text-orange-700 flex-1">
                  <span className="font-bold">{devisExpires.length} devis</span> expiré{devisExpires.length > 1 ? "s" : ""} sans réponse — relancer les clients
                </p>
              </div>
            )}
            {voyagesProches.length > 0 && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <CheckCircle size={15} className="text-blue-500 shrink-0" />
                <p className="text-sm text-blue-700 flex-1">
                  <span className="font-bold">{voyagesProches.length} voyage{voyagesProches.length > 1 ? "s" : ""}</span> confirmé{voyagesProches.length > 1 ? "s" : ""} dans les 7 prochains jours
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart + Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Évolution — 6 derniers mois</h3>
          <BarChart factures={factures} reversements={reversements} />
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pipeline des voyages</h3>
          <PipelineFunnel factures={factures} />
        </div>
      </div>

    </div>
  );
}
