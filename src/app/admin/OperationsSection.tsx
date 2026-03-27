"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  ClipboardList, User, CalendarDays, ChevronRight,
  Clock, AlertTriangle, CheckCircle2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const SITES = ["Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria"];

const STATUTS: Facture["statut"][] = ["envoyé", "accepté", "confirmé", "payé"];

const STATUT_LABELS: Record<Facture["statut"], string> = {
  brouillon: "Brouillon",
  envoyé: "Envoyé",
  en_negociation: "En discussion",
  accepté: "Accepté",
  confirmé: "Confirmé",
  payé: "Payé",
};

const STATUT_COLORS: Record<Facture["statut"], { card: string; badge: string; header: string }> = {
  brouillon:      { card: "border-gray-200",    badge: "bg-gray-100 text-gray-500",       header: "bg-gray-50 text-gray-500" },
  envoyé:         { card: "border-blue-200",    badge: "bg-blue-100 text-blue-600",       header: "bg-blue-50 text-blue-600" },
  en_negociation: { card: "border-amber-200",   badge: "bg-amber-100 text-amber-600",     header: "bg-amber-50 text-amber-600" },
  accepté:        { card: "border-emerald-200", badge: "bg-emerald-100 text-emerald-600", header: "bg-emerald-50 text-emerald-600" },
  confirmé:       { card: "border-purple-200",  badge: "bg-purple-100 text-purple-600",   header: "bg-purple-50 text-purple-600" },
  payé:           { card: "border-teal-200",    badge: "bg-teal-100 text-teal-600",       header: "bg-teal-50 text-teal-600" },
};

const NEXT_STATUT: Record<Facture["statut"], Facture["statut"] | null> = {
  brouillon:      "envoyé",
  envoyé:         "accepté",
  en_negociation: "accepté",
  accepté:        "confirmé",
  confirmé:       "payé",
  payé:           null,
};

const SITE_COLORS: Record<string, string> = {
  Hougeif:         "bg-[#408398]/15 text-[#408398]",
  Loubatanleh:     "bg-emerald-100 text-emerald-700",
  "Sables Blancs": "bg-green-100 text-green-700",
  Ditilou:         "bg-purple-100 text-purple-700",
  Godoria:         "bg-cyan-100 text-cyan-700",
  Autre:           "bg-gray-100 text-gray-500",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

function detectSite(facture: Facture): string {
  const desc = facture.lignes.map(l => l.description).join(" ");
  return SITES.find(s => desc.toLowerCase().includes(s.toLowerCase())) || "Autre";
}

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayMidnight(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

function countdownLabel(dateStr: string | null): { label: string; urgent: boolean } | null {
  if (!dateStr) return null;
  const diff = Math.ceil((parseDateStr(dateStr).getTime() - todayMidnight().getTime()) / 86400000);
  if (diff < 0) return { label: `Il y a ${-diff}j`, urgent: false };
  if (diff === 0) return { label: "Aujourd'hui !", urgent: true };
  if (diff <= 3) return { label: `Dans ${diff}j`, urgent: true };
  if (diff <= 7) return { label: `Dans ${diff}j`, urgent: false };
  return { label: `Dans ${diff}j`, urgent: false };
}

function isImminent(facture: Facture): boolean {
  if (!facture.date_depart) return false;
  const diff = Math.ceil((parseDateStr(facture.date_depart).getTime() - todayMidnight().getTime()) / 86400000);
  return diff >= 0 && diff <= 7;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownBadge({ date }: { date: string | null }) {
  const cd = countdownLabel(date);
  if (!cd) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      cd.urgent ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-600"
    }`}>
      <Clock size={10} />
      {cd.label}
    </span>
  );
}

function KanbanCard({
  facture,
  onStatusChange,
}: {
  facture: Facture;
  onStatusChange: (id: string, statut: Facture["statut"]) => void;
}) {
  const site = detectSite(facture);
  const next = NEXT_STATUT[facture.statut];
  const colors = STATUT_COLORS[facture.statut];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-white rounded-xl border ${colors.card} p-3 shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Client + site */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-bold text-gray-800 text-sm leading-tight">{facture.client_nom}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{facture.numero}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${SITE_COLORS[site]}`}>
          {site}
        </span>
      </div>

      {/* Date départ */}
      {facture.date_depart && (
        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
          <CalendarDays size={11} />
          <span>{new Date(facture.date_depart).toLocaleDateString("fr-FR")}</span>
          <CountdownBadge date={facture.date_depart} />
        </div>
      )}

      {/* Total + type */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">{fmt(facture.total)}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${facture.type === "devis" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
          {facture.type === "devis" ? "Devis" : "Facture"}
        </span>
      </div>

      {/* Avancer */}
      {next && (
        <button
          onClick={() => onStatusChange(facture.id, next)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-[#408398]/10 hover:bg-[#408398]/20 text-[#408398] transition-colors"
        >
          <ChevronRight size={13} />
          {STATUT_LABELS[next]}
        </button>
      )}
      {!next && (
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 text-teal-600">
          <CheckCircle2 size={13} />
          Payé — à clôturer
        </div>
      )}
    </motion.div>
  );
}

function ImminentCard({ facture }: { facture: Facture }) {
  const site = detectSite(facture);
  const cd = countdownLabel(facture.date_depart);

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4 ${
      cd?.urgent ? "border-red-200" : "border-amber-200"
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        cd?.urgent ? "bg-red-100" : "bg-amber-100"
      }`}>
        {cd?.urgent ? <AlertTriangle size={18} className="text-red-500" /> : <Clock size={18} className="text-amber-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-gray-800 text-sm">{facture.numero}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SITE_COLORS[site]}`}>{site}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><User size={11} />{facture.client_nom}</span>
          <span className="text-gray-400">{site}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <CountdownBadge date={facture.date_depart} />
        <p className="text-xs text-gray-400 mt-1">{new Date(facture.date_depart!).toLocaleDateString("fr-FR")}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OperationsSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("factures")
      .select("*")
      .order("date_depart", { ascending: true, nullsFirst: false });
    setFactures((data as Facture[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, statut: Facture["statut"]) => {
    setUpdating(id);
    await supabase.from("factures").update({ statut }).eq("id", id);
    setFactures(prev => prev.map(f => f.id === id ? { ...f, statut } : f));
    setUpdating(null);
  };

  const filtered = factures.filter(f => f.type === "facture");

  // Voyages imminents (tous sites, uniquement confirmé/payé, 7 jours)
  const imminents = factures.filter(f =>
    f.type === "facture" && isImminent(f) && ["accepté", "confirmé", "payé"].includes(f.statut)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList size={20} className="text-[#408398]" />
          Suivi des dossiers
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} facture{filtered.length > 1 ? "s" : ""} en cours</p>
      </div>

      {/* ── Voyages imminents ── */}
      {imminents.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock size={14} />
            Départs dans les 7 prochains jours ({imminents.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {imminents.map(f => (
              <ImminentCard key={f.id} facture={f} />
            ))}
          </div>
        </section>
      )}

      {/* ── Kanban ── */}
      <section>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${STATUTS.length * 230}px` }}>
            {STATUTS.map(statut => {
              const cards = filtered.filter(f => f.statut === statut);
              const colors = STATUT_COLORS[statut];
              return (
                <div key={statut} className="flex flex-col" style={{ width: 210, flexShrink: 0 }}>
                  {/* Column header */}
                  <div className={`rounded-xl px-3 py-2 mb-3 flex items-center justify-between ${colors.header}`}>
                    <span className="text-xs font-bold uppercase tracking-wide">{STATUT_LABELS[statut]}</span>
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${colors.badge}`}>
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 min-h-[120px]">
                    {cards.length === 0 && (
                      <div className="flex-1 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-300">Vide</span>
                      </div>
                    )}
                    {cards.map(f => (
                      <div key={f.id} className="relative">
                        {updating === f.id && (
                          <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
                            <div className="w-4 h-4 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
                          </div>
                        )}
                        <KanbanCard facture={f} onStatusChange={handleStatusChange} />
                      </div>
                    ))}
                  </div>

                  {/* Column total */}
                  {cards.length > 0 && (
                    <div className="mt-2 text-right text-xs text-gray-400 font-medium">
                      {fmt(cards.reduce((s, f) => s + f.total, 0))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
