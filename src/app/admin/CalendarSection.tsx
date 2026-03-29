"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar, MapPin, User, Banknote } from "lucide-react";

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;
const fmtDate = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const SITES = [
  "Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria",
  "Lac Assal", "Lac Abbé", "Requin-Baleine", "Goubet", "Bankoualeh",
  "Allos", "Obock", "Forêt du Day", "Abourma", "Moucha",
];
const SITE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Hougeif:           { bg: "bg-[#408398]/15",  text: "text-[#408398]",   dot: "bg-[#408398]" },
  Loubatanleh:       { bg: "bg-emerald-100",    text: "text-emerald-700", dot: "bg-emerald-500" },
  "Sables Blancs":   { bg: "bg-green-100",      text: "text-green-700",   dot: "bg-green-500" },
  Ditilou:           { bg: "bg-purple-100",     text: "text-purple-700",  dot: "bg-purple-500" },
  Godoria:           { bg: "bg-cyan-100",       text: "text-cyan-700",    dot: "bg-cyan-500" },
  "Lac Assal":       { bg: "bg-sky-100",        text: "text-sky-700",     dot: "bg-sky-500" },
  "Lac Abbé":        { bg: "bg-orange-100",     text: "text-orange-700",  dot: "bg-orange-500" },
  "Requin-Baleine":  { bg: "bg-blue-100",       text: "text-blue-700",    dot: "bg-blue-500" },
  Goubet:            { bg: "bg-red-100",        text: "text-red-700",     dot: "bg-red-500" },
  Bankoualeh:        { bg: "bg-lime-100",       text: "text-lime-700",    dot: "bg-lime-500" },
  Allos:             { bg: "bg-yellow-100",     text: "text-yellow-700",  dot: "bg-yellow-500" },
  Obock:             { bg: "bg-indigo-100",     text: "text-indigo-700",  dot: "bg-indigo-500" },
  "Forêt du Day":    { bg: "bg-teal-100",       text: "text-teal-700",    dot: "bg-teal-500" },
  Abourma:           { bg: "bg-amber-100",      text: "text-amber-700",   dot: "bg-amber-500" },
  Moucha:            { bg: "bg-violet-100",     text: "text-violet-700",  dot: "bg-violet-500" },
  Autre:             { bg: "bg-gray-100",       text: "text-gray-600",    dot: "bg-gray-400" },
};

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

function detectSite(facture: Facture): string {
  const desc = facture.lignes.map(l => l.description).join(" ");
  return SITES.find(s => desc.toLowerCase().includes(s.toLowerCase())) || "Autre";
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return (day + 1) % 7; // Saturday = 0
}

export default function CalendarSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Facture | null>(null);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("factures").select("*").not("date_depart", "is", null).order("date_depart");
      setFactures(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const facturesByDay = (day: number): Facture[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return factures.filter(f => f.date_depart === dateStr);
  };

  const monthName = new Date(year, month, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const DAYS = ["Sam", "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven"];

  // Upcoming trips (next 30 days)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const future30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  const future30Str = `${future30.getFullYear()}-${String(future30.getMonth() + 1).padStart(2, "0")}-${String(future30.getDate()).padStart(2, "0")}`;
  const upcoming = factures.filter(f =>
    f.date_depart && f.date_depart >= todayStr && f.date_depart <= future30Str
  ).sort((a, b) => (a.date_depart || "").localeCompare(b.date_depart || ""));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Upcoming strip */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Prochains voyages — 30 jours</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {upcoming.map((f, i) => {
              const site = detectSite(f);
              const colors = SITE_COLORS[site] || SITE_COLORS.Autre;
              const [dy, dm, dd] = f.date_depart!.split("-").map(Number);
              const depLocal = new Date(dy, dm - 1, dd);
              const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const diff = Math.round((depLocal.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <motion.button key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(f)}
                  className="shrink-0 bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md transition-all w-48">
                  <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${colors.bg} ${colors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {site}
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{f.client_nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(f.total)}</p>
                  <p className={`text-[10px] font-bold mt-2 ${diff === 0 ? "text-red-500" : diff <= 3 ? "text-amber-500" : "text-gray-400"}`}>
                    {diff === 0 ? "Aujourd'hui" : diff === 1 ? "Demain" : `Dans ${diff} jours`}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header navigation */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <h3 className="text-sm font-bold text-gray-900 capitalize">{monthName}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayFactures = facturesByDay(day);
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const col = (firstDay + i) % 7;
            const isWeekend = col === 5 || col === 6;

            return (
              <div key={day}
                className={`min-h-[80px] border-b border-r border-gray-50 p-1.5 transition-colors
                  ${isWeekend ? "bg-gray-50/40" : ""}
                  ${isPast && !isToday ? "opacity-60" : ""}
                `}>
                {/* Day number */}
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${
                  isToday ? "bg-[#408398] text-white" : "text-gray-500"
                }`}>
                  {day}
                </div>

                {/* Trips */}
                <div className="space-y-0.5">
                  {dayFactures.map((f, j) => {
                    const site = detectSite(f);
                    const colors = SITE_COLORS[site] || SITE_COLORS.Autre;
                    return (
                      <button key={j} onClick={() => setSelected(f)}
                        className={`w-full text-left px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate transition-all hover:opacity-80 ${colors.bg} ${colors.text}`}>
                        {f.client_nom}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(SITE_COLORS).filter(([k]) => k !== "Autre").map(([site, colors]) => (
          <div key={site} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span className="text-xs text-gray-500">{site}</span>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] bg-white rounded-2xl shadow-2xl max-w-sm mx-auto overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              {(() => {
                const site = detectSite(selected);
                const colors = SITE_COLORS[site] || SITE_COLORS.Autre;
                return (
                  <div className={`px-5 py-4 ${colors.bg} flex items-center justify-between`}>
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} mb-0.5`}>{site}</div>
                      <h3 className="text-sm font-bold text-gray-900">{selected.client_nom}</h3>
                      <p className="text-xs text-gray-500">{selected.numero}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-black/10 rounded-xl transition-colors">
                      <X size={15} className="text-gray-600" />
                    </button>
                  </div>
                );
              })()}

              <div className="p-5 space-y-4">
                {/* Info rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-[#408398] shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Date de départ</p>
                      <p className="text-sm font-semibold text-gray-800">{selected.date_depart ? fmtDate(selected.date_depart) : "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-[#408398] shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Client</p>
                      <p className="text-sm font-semibold text-gray-800">{selected.client_nom}</p>
                      {selected.client_email && <p className="text-xs text-gray-400">{selected.client_email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Banknote size={14} className="text-[#408398] shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Montant total</p>
                      <p className="text-sm font-bold text-gray-900">{fmt(selected.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-[#408398] shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Prestations</p>
                      <div className="mt-0.5 space-y-0.5">
                        {selected.lignes.map((l, i) => (
                          <p key={i} className="text-xs text-gray-700">{l.description} × {l.quantite}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${statutColors[selected.statut]}`}>
                  {statutLabels[selected.statut]}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
