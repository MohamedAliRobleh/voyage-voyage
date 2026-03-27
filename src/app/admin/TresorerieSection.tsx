"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture, Reversement } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Wallet, Clock, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Banknote, Calendar,
} from "lucide-react";

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;
function parseDateStr(s: string): Date {
  if (s.includes("T") || s.length > 10) return new Date(s);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
const fmtDate = (d: string) => parseDateStr(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const fmtMonth = (d: Date) => d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

const SITES = [
  "Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria",
  "Lac Assal", "Lac Abbé", "Requin-Baleine", "Goubet", "Bankoualeh",
  "Allos", "Obock", "Forêt du Day", "Abourma", "Moucha",
];
function detectSite(facture: Facture): string {
  const desc = facture.lignes.map(l => l.description).join(" ");
  return SITES.find(s => desc.toLowerCase().includes(s.toLowerCase())) || "Autre";
}

const statutColors: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-500",
  envoyé: "bg-blue-100 text-blue-600",
  en_negociation: "bg-amber-100 text-amber-600",
  accepté: "bg-emerald-100 text-emerald-600",
  confirmé: "bg-purple-100 text-purple-600",
  payé: "bg-teal-100 text-teal-600",
};
const statutLabels: Record<string, string> = {
  brouillon: "Brouillon", envoyé: "Envoyé", en_negociation: "En discussion",
  accepté: "Accepté", confirmé: "Confirmé", payé: "Payé",
};

type Period = "3m" | "6m" | "12m" | "all";

export default function TresorerieSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [reversements, setReversements] = useState<Reversement[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("6m");
  const [showEncaissements, setShowEncaissements] = useState(true);
  const [showDecaissements, setShowDecaissements] = useState(true);
  const [showEcheances, setShowEcheances] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: f }, { data: r }] = await Promise.all([
        supabase.from("factures").select("*").order("date", { ascending: false }),
        supabase.from("reversements").select("*").order("created_at", { ascending: false }),
      ]);
      setFactures(f || []);
      setReversements(r || []);
      setLoading(false);
    };
    load();
  }, []);

  const periodStart = useMemo(() => {
    if (period === "all") return new Date("2000-01-01");
    const d = new Date();
    d.setMonth(d.getMonth() - (period === "3m" ? 3 : period === "6m" ? 6 : 12));
    return d;
  }, [period]);

  // Encaissements = factures payées dans la période
  const encaissements = useMemo(() =>
    factures.filter(f => f.statut === "payé" && f.type === "facture" && parseDateStr(f.date) >= periodStart),
    [factures, periodStart]
  );

  // Décaissements = reversements reversés dans la période
  const decaissements = useMemo(() =>
    reversements.filter(r => r.statut === "reversé" && new Date(r.created_at) >= periodStart),
    [reversements, periodStart]
  );

  // Échéances à venir = confirmé/accepté non payé
  const echeances = useMemo(() =>
    factures.filter(f => ["confirmé", "accepté", "en_negociation"].includes(f.statut)),
    [factures]
  );

  // Reversements en attente
  const reversementsAttente = useMemo(() =>
    reversements.filter(r => r.statut === "à reverser"),
    [reversements]
  );

  const caEncaisse = encaissements.reduce((s, f) => s + f.total, 0);
  const chargesDecaissees = decaissements.reduce((s, r) => s + r.marge, 0);
  const margeNette = caEncaisse - chargesDecaissees;
  const enAttente = echeances.reduce((s, f) => s + f.total, 0);
  const soldeAReserver = reversementsAttente.reduce((s, r) => s + r.marge, 0);

  // Monthly cash flow (last N months)
  const monthlyData = useMemo(() => {
    const months: { label: string; ca: number; charges: number; marge: number }[] = [];
    const n = period === "3m" ? 3 : period === "6m" ? 6 : 12;
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const ca = factures
        .filter(f => { const p = parseDateStr(f.date); return f.statut === "payé" && f.type === "facture" && p.getFullYear() === y && p.getMonth() === m; })
        .reduce((s, f) => s + f.total, 0);
      const charges = reversements
        .filter(r => r.statut === "reversé" && new Date(r.created_at).getFullYear() === y && new Date(r.created_at).getMonth() === m)
        .reduce((s, r) => s + r.marge, 0);
      months.push({ label: fmtMonth(d), ca, charges, marge: ca - charges });
    }
    return months;
  }, [factures, reversements, period]);

  const maxVal = useMemo(() => Math.max(...monthlyData.map(m => Math.max(m.ca, m.charges, 1))), [monthlyData]);

  // Par site
  const parSite = useMemo(() => {
    const map: Record<string, { ca: number; charges: number; count: number }> = {};
    encaissements.forEach(f => {
      const site = detectSite(f);
      if (!map[site]) map[site] = { ca: 0, charges: 0, count: 0 };
      map[site].ca += f.total;
      map[site].count += 1;
    });
    decaissements.forEach(r => {
      const site = r.site_nom || "Autre";
      if (!map[site]) map[site] = { ca: 0, charges: 0, count: 0 };
      map[site].charges += r.marge;
    });
    return Object.entries(map)
      .map(([site, d]) => ({ site, ...d, marge: d.ca - d.charges }))
      .sort((a, b) => b.ca - a.ca);
  }, [encaissements, decaissements]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ─── Period Selector ─── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Trésorerie & Comptabilité</h2>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["3m", "6m", "12m", "all"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              {p === "all" ? "Tout" : p}
            </button>
          ))}
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-1.5 text-teal-100 text-xs font-semibold mb-2">
            <TrendingUp size={13} /> CA Encaissé
          </div>
          <p className="text-xl font-black">{fmt(caEncaisse)}</p>
          <p className="text-teal-200 text-[10px] mt-1">{encaissements.length} facture{encaissements.length !== 1 ? "s" : ""}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-1.5 text-red-100 text-xs font-semibold mb-2">
            <TrendingDown size={13} /> Charges Reversées
          </div>
          <p className="text-xl font-black">{fmt(chargesDecaissees)}</p>
          <p className="text-red-200 text-[10px] mt-1">{decaissements.length} reversement{decaissements.length !== 1 ? "s" : ""}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-2xl p-4 text-white ${margeNette >= 0 ? "bg-gradient-to-br from-[#408398] to-[#265868]" : "bg-gradient-to-br from-orange-500 to-orange-600"}`}>
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold mb-2">
            <Wallet size={13} /> Marge Nette
          </div>
          <p className="text-xl font-black">{fmt(margeNette)}</p>
          <p className="text-white/60 text-[10px] mt-1">
            {caEncaisse > 0 ? `${Math.round((margeNette / caEncaisse) * 100)}% du CA` : "—"}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-1.5 text-amber-100 text-xs font-semibold mb-2">
            <Clock size={13} /> En Attente
          </div>
          <p className="text-xl font-black">{fmt(enAttente)}</p>
          <p className="text-amber-100 text-[10px] mt-1">{echeances.length} dossier{echeances.length !== 1 ? "s" : ""}</p>
        </motion.div>
      </div>

      {/* ─── Alerte solde à reverser ─── */}
      {soldeAReserver > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Solde à reverser aux sites</p>
            <p className="text-xs text-red-500 mt-0.5">{fmt(soldeAReserver)} restant dû sur {reversementsAttente.length} reversement{reversementsAttente.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* ─── Graphique flux mensuel ─── */}
      {period !== "all" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Flux de trésorerie mensuel</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /><span className="text-[10px] text-gray-500">CA encaissé</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-[10px] text-gray-500">Charges</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#408398]" /><span className="text-[10px] text-gray-500">Marge</span></div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex items-end gap-0.5 h-28">
                  <div className="flex-1 rounded-t-md bg-teal-400 transition-all" style={{ height: `${maxVal > 0 ? (m.ca / maxVal) * 100 : 0}%` }} />
                  <div className="flex-1 rounded-t-md bg-red-400 transition-all" style={{ height: `${maxVal > 0 ? (m.charges / maxVal) * 100 : 0}%` }} />
                  <div className={`flex-1 rounded-t-md transition-all ${m.marge >= 0 ? "bg-[#408398]" : "bg-orange-400"}`}
                    style={{ height: `${maxVal > 0 ? (Math.abs(m.marge) / maxVal) * 100 : 0}%` }} />
                </div>
                <span className="text-[9px] text-gray-400 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Répartition par site ─── */}
      {parSite.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Répartition par site</h3>
          <div className="space-y-3">
            {parSite.map(({ site, ca, charges, marge, count }) => {
              const pct = ca > 0 ? Math.round((marge / ca) * 100) : 0;
              return (
                <div key={site} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{site}</span>
                      <span className="text-[10px] text-gray-400">{count} voyage{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900">{fmt(ca)}</span>
                      <span className={`ml-2 text-[10px] font-bold ${pct >= 0 ? "text-teal-600" : "text-red-500"}`}>{pct}% marge</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      {charges > 0 && <div className="bg-red-300 h-full" style={{ width: `${(charges / ca) * 100}%` }} />}
                      {marge > 0 && <div className="bg-teal-400 h-full" style={{ width: `${(marge / ca) * 100}%` }} />}
                    </div>
                  </div>
                  <div className="flex gap-4 text-[10px] text-gray-500">
                    <span>Charges : {fmt(charges)}</span>
                    <span className={marge >= 0 ? "text-teal-600 font-semibold" : "text-red-500 font-semibold"}>Marge : {fmt(marge)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Encaissements ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={() => setShowEncaissements(!showEncaissements)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-teal-500" />
            <span className="text-sm font-bold text-gray-900">Encaissements</span>
            <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">{fmt(caEncaisse)}</span>
          </div>
          {showEncaissements ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </button>
        {showEncaissements && (
          <div className="border-t border-gray-50">
            {encaissements.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">Aucun encaissement sur la période</p>
            ) : (
              encaissements.map((f, i) => (
                <div key={f.id} className={`flex items-center justify-between px-5 py-3.5 ${i < encaissements.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                      <Banknote size={14} className="text-teal-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{f.client_nom}</p>
                        <span className="text-[10px] text-gray-400">{f.numero}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={9} />{fmtDate(f.date)}</span>
                        <span className="text-[10px] text-gray-400">{detectSite(f)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-black text-teal-600">{fmt(f.total)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── Décaissements ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={() => setShowDecaissements(!showDecaissements)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingDown size={15} className="text-red-500" />
            <span className="text-sm font-bold text-gray-900">Décaissements (reversements)</span>
            <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">{fmt(chargesDecaissees)}</span>
          </div>
          {showDecaissements ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </button>
        {showDecaissements && (
          <div className="border-t border-gray-50">
            {decaissements.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">Aucun décaissement sur la période</p>
            ) : (
              decaissements.map((r, i) => (
                <div key={r.id} className={`flex items-center justify-between px-5 py-3.5 ${i < decaissements.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                      <TrendingDown size={14} className="text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{r.site_nom}</p>
                        <span className="text-[10px] text-gray-400">{r.facture_numero}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={9} />{fmtDate(r.created_at)}</span>
                        <span className="text-[10px] text-gray-400">{r.client_nom}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-500">-{fmt(r.marge)}</p>
                    <p className="text-[10px] text-gray-400">Commission agence : {fmt(r.montant_reverser)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── Échéances à venir ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={() => setShowEcheances(!showEcheances)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />
            <span className="text-sm font-bold text-gray-900">Dossiers en cours</span>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">{fmt(enAttente)}</span>
          </div>
          {showEcheances ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </button>
        {showEcheances && (
          <div className="border-t border-gray-50">
            {echeances.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">Aucun dossier en cours</p>
            ) : (
              echeances
                .sort((a, b) => (a.date_depart || a.echeance || "").localeCompare(b.date_depart || b.echeance || ""))
                .map((f, i) => {
                  const isUrgent = f.date_depart && (() => {
                    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
                    const diff = (parseDateStr(f.date_depart!).getTime() - today0.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 7;
                  })();
                  return (
                    <div key={f.id} className={`flex items-center justify-between px-5 py-3.5 ${i < echeances.length - 1 ? "border-b border-gray-50" : ""} ${isUrgent ? "bg-amber-50/40" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUrgent ? "bg-amber-100" : "bg-gray-100"}`}>
                          {isUrgent ? <AlertCircle size={14} className="text-amber-500" /> : <Clock size={14} className="text-gray-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{f.client_nom}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statutColors[f.statut]}`}>{statutLabels[f.statut]}</span>
                            {isUrgent && <span className="text-[10px] font-bold text-amber-600">DÉPART IMMINENT</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400">{f.numero}</span>
                            {f.date_depart && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={9} />Départ {fmtDate(f.date_depart)}</span>}
                            <span className="text-[10px] text-gray-400">{detectSite(f)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-black text-amber-600">{fmt(f.total)}</p>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

    </div>
  );
}
