"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  BarChart2, TrendingUp, Users, MapPin, Target, ArrowUpRight,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const SITES = ["Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria"];

const SITE_COLORS: Record<string, string> = {
  Hougeif:         "bg-[#408398]",
  Loubatanleh:     "bg-emerald-500",
  "Sables Blancs": "bg-green-500",
  Ditilou:         "bg-purple-500",
  Godoria:         "bg-cyan-500",
  Autre:           "bg-gray-400",
};

const SITE_LIGHT: Record<string, string> = {
  Hougeif:         "bg-[#408398]/15 text-[#408398]",
  Loubatanleh:     "bg-emerald-100 text-emerald-700",
  "Sables Blancs": "bg-green-100 text-green-700",
  Ditilou:         "bg-purple-100 text-purple-700",
  Godoria:         "bg-cyan-100 text-cyan-700",
  Autre:           "bg-gray-100 text-gray-500",
};

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

function detectSite(facture: Facture): string {
  const desc = facture.lignes.map(l => l.description).join(" ");
  return SITES.find(s => desc.toLowerCase().includes(s.toLowerCase())) || "Autre";
}

// ─── Charts ───────────────────────────────────────────────────────────────────

/** Évolution CA sur 12 mois (barres) */
function CAChart({ factures }: { factures: Facture[] }) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
  });

  const data = months.map(m => ({
    ...m,
    ca: factures
      .filter(f => { const [y, mo] = f.date.split("-").map(Number); return f.statut === "payé" && f.type === "facture" && y === m.year && (mo - 1) === m.month; })
      .reduce((s, f) => s + f.total, 0),
    pipeline: factures
      .filter(f => { const [y, mo] = f.date.split("-").map(Number); return ["confirmé", "accepté"].includes(f.statut) && y === m.year && (mo - 1) === m.month; })
      .reduce((s, f) => s + f.total, 0),
  }));

  const maxVal = Math.max(...data.map(d => d.ca + d.pipeline), 1);
  const H = 90;

  return (
    <div>
      <div className="flex items-end gap-1 h-28 px-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-stretch justify-end" style={{ height: `${H}px` }}>
              {d.pipeline > 0 && (
                <div
                  className="w-full bg-purple-200 rounded-t-sm"
                  style={{ height: `${Math.max((d.pipeline / maxVal) * H, 3)}px` }}
                  title={`Pipeline: ${fmt(d.pipeline)}`}
                />
              )}
              <div
                className="w-full bg-[#408398]/70 rounded-t-sm"
                style={{ height: `${Math.max((d.ca / maxVal) * H, d.ca > 0 ? 3 : 0)}px` }}
                title={`CA encaissé: ${fmt(d.ca)}`}
              />
            </div>
            <span className="text-[8px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#408398]/70" />
          <span className="text-[10px] text-gray-400">CA encaissé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-purple-200" />
          <span className="text-[10px] text-gray-400">Pipeline confirmé</span>
        </div>
      </div>
    </div>
  );
}

/** Saisonnalité : répartition des voyages par mois (tous ans confondus) */
function SeasonChart({ factures }: { factures: Facture[] }) {
  const data = MONTH_LABELS.map((label, m) => ({
    label,
    count: factures.filter(f =>
      f.statut === "payé" && f.type === "facture" && f.date_depart && (Number(f.date_depart.split("-")[1]) - 1) === m
    ).length,
  }));

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-20 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-amber-400/70 rounded-t-sm transition-all"
            style={{ height: `${Math.max((d.count / maxCount) * 72, d.count > 0 ? 4 : 0)}px` }}
            title={`${d.label}: ${d.count} voyage${d.count > 1 ? "s" : ""}`}
          />
          <span className="text-[8px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AnalyticsSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("factures").select("*").then(({ data }) => {
      setFactures((data as Facture[]) || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
      </div>
    );
  }

  // ── Taux de conversion ──────────────────────────────────────────────────────
  const totalDevis = factures.filter(f => f.type === "devis").length;
  const devisConvertis = factures.filter(f =>
    f.type === "devis" && ["accepté", "confirmé", "payé"].includes(f.statut)
  ).length;
  const tauxConversion = totalDevis > 0 ? Math.round((devisConvertis / totalDevis) * 100) : 0;

  const funnelSteps = [
    { label: "Devis envoyés", count: totalDevis, color: "bg-blue-200 text-blue-700" },
    { label: "En négociation", count: factures.filter(f => f.type === "devis" && ["en_negociation", "accepté", "confirmé", "payé"].includes(f.statut)).length, color: "bg-amber-200 text-amber-700" },
    { label: "Acceptés", count: factures.filter(f => f.type === "devis" && ["accepté", "confirmé", "payé"].includes(f.statut)).length, color: "bg-emerald-200 text-emerald-700" },
    { label: "Payés", count: factures.filter(f => f.type === "devis" && f.statut === "payé").length, color: "bg-teal-200 text-teal-700" },
  ];
  const funnelMax = funnelSteps[0].count || 1;

  // ── Top destinations ────────────────────────────────────────────────────────
  const siteStats = [...SITES, "Autre"].map(site => {
    const siteFacs = factures.filter(f => detectSite(f) === site && f.statut === "payé" && f.type === "facture");
    return {
      site,
      count: siteFacs.length,
      ca: siteFacs.reduce((s, f) => s + f.total, 0),
    };
  }).sort((a, b) => b.ca - a.ca);
  const maxCA = Math.max(...siteStats.map(s => s.ca), 1);

  // ── Top clients ─────────────────────────────────────────────────────────────
  const clientMap: Record<string, { nom: string; count: number; ca: number }> = {};
  factures.filter(f => f.statut === "payé" && f.type === "facture").forEach(f => {
    const key = f.client_id || f.client_nom;
    if (!key) return;
    if (!clientMap[key]) clientMap[key] = { nom: f.client_nom, count: 0, ca: 0 };
    clientMap[key].count++;
    clientMap[key].ca += f.total;
  });
  const topClients = Object.values(clientMap).sort((a, b) => b.ca - a.ca).slice(0, 8);
  const maxClientCA = Math.max(...topClients.map(c => c.ca), 1);

  // ── KPIs rapides ─────────────────────────────────────────────────────────────
  const totalPaye = factures.filter(f => f.statut === "payé" && f.type === "facture");
  const caTotal = totalPaye.reduce((s, f) => s + f.total, 0);
  const panierMoyen = totalPaye.length > 0 ? Math.round(caTotal / totalPaye.length) : 0;
  const clientsUniques = new Set(totalPaye.map(f => f.client_id)).size;

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 size={20} className="text-[#408398]" />
          Analytics & Performance
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Analyse globale — tous statuts inclus</p>
      </div>

      {/* ── KPIs rapides ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CA total encaissé", value: fmt(caTotal), icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
          { label: "Voyages réalisés", value: totalPaye.length, icon: Target, color: "bg-teal-50 text-teal-600" },
          { label: "Clients uniques", value: clientsUniques, icon: Users, color: "bg-purple-50 text-purple-600" },
          { label: "Panier moyen", value: fmt(panierMoyen), icon: ArrowUpRight, color: "bg-amber-50 text-amber-600" },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
              <k.icon size={16} />
            </div>
            <p className="text-lg font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Évolution CA 12 mois + Saisonnalité ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Évolution CA — 12 mois</h3>
          <CAChart factures={factures} />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Saisonnalité des voyages</h3>
          <p className="text-[10px] text-gray-300 mb-4">Voyages payés par mois de départ (toutes années)</p>
          <SeasonChart factures={factures} />
        </div>
      </div>

      {/* ── Conversion funnel + Top destinations ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Funnel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Taux de conversion devis → facture</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-[#408398]">{tauxConversion}%</span>
            <span className="text-xs text-gray-400">{devisConvertis} / {totalDevis} devis convertis</span>
          </div>
          <div className="space-y-2">
            {funnelSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-28 shrink-0 text-right">{step.label}</span>
                <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${step.color.split(" ")[0]} rounded-lg flex items-center px-2.5 transition-all`}
                    style={{ width: step.count > 0 ? `${Math.max((step.count / funnelMax) * 100, 8)}%` : "0%" }}
                  >
                    {step.count > 0 && (
                      <span className={`text-[10px] font-bold ${step.color.split(" ")[1]}`}>{step.count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top destinations */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <MapPin size={12} />
            Top destinations — CA encaissé
          </h3>
          <div className="space-y-3">
            {siteStats.filter(s => s.ca > 0).map((s, i) => (
              <div key={s.site} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-28 text-center shrink-0 ${SITE_LIGHT[s.site]}`}>
                  {s.site}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${SITE_COLORS[s.site]} rounded-full transition-all`}
                    style={{ width: `${(s.ca / maxCA) * 100}%` }}
                  />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-700">{fmt(s.ca)}</p>
                  <p className="text-[10px] text-gray-300">{s.count} voyage{s.count > 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
            {siteStats.every(s => s.ca === 0) && (
              <p className="text-sm text-gray-300 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Top clients ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Users size={12} />
          Top clients — CA encaissé
        </h3>
        {topClients.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-4">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-2">
            {topClients.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                <span className="text-sm font-medium text-gray-700 w-40 truncate shrink-0">{c.nom}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all"
                    style={{ width: `${(c.ca / maxClientCA) * 100}%` }}
                  />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-700">{fmt(c.ca)}</p>
                  <p className="text-[10px] text-gray-300">{c.count} voyage{c.count > 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
