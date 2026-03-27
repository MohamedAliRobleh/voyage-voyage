"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, MessageSquare, TrendingUp, MapPin, Search, ChevronDown } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          fill={value >= s ? "#f59e0b" : "none"}
          stroke={value >= s ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

function ratingColor(avg: number): string {
  if (avg >= 4.5) return "text-emerald-600";
  if (avg >= 3.5) return "text-amber-500";
  return "text-red-500";
}

function ratingBg(avg: number): string {
  if (avg >= 4.5) return "bg-emerald-50 border-emerald-100";
  if (avg >= 3.5) return "bg-amber-50 border-amber-100";
  return "bg-red-50 border-red-100";
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReputationSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating_desc" | "rating_asc">("date");

  const load = useCallback(async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("reviews").delete().eq("id", id);
    setReviews(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
    setConfirmDelete(null);
  };

  // ── Stats globales ──────────────────────────────────────────────────────────
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const distrib = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  // ── Stats par destination ──────────────────────────────────────────────────
  const destMap: Record<string, { count: number; sum: number }> = {};
  reviews.forEach(r => {
    const key = r.destination?.trim() || "Sans destination";
    if (!destMap[key]) destMap[key] = { count: 0, sum: 0 };
    destMap[key].count++;
    destMap[key].sum += r.rating;
  });
  const destStats = Object.entries(destMap)
    .map(([dest, { count, sum }]) => ({ dest, count, avg: sum / count }))
    .sort((a, b) => b.avg - a.avg);

  // ── Évolution mensuelle (6 mois) ───────────────────────────────────────────
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: d.toLocaleDateString("fr-FR", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });
  const monthlyData = months.map(m => {
    const mReviews = reviews.filter(r => {
      const d = new Date(r.created_at);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    return { ...m, count: mReviews.length, avg: mReviews.length ? mReviews.reduce((s, r) => s + r.rating, 0) / mReviews.length : 0 };
  });

  // ── Filtres & tri ──────────────────────────────────────────────────────────
  const filtered = reviews
    .filter(r => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase()) || (r.destination || "").toLowerCase().includes(search.toLowerCase());
      const matchRating = filterRating === "all" || r.rating === filterRating;
      return matchSearch && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === "rating_desc") return b.rating - a.rating;
      if (sortBy === "rating_asc") return a.rating - b.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Star size={20} className="text-amber-400" fill="#fbbf24" />
          Réputation & Qualité
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">{reviews.length} avis clients au total</p>
      </div>

      {/* ── KPIs + Distribution ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Note globale */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className={`text-5xl font-black ${ratingColor(avg)}`}>{avg > 0 ? avg.toFixed(1) : "—"}</p>
            <StarDisplay value={Math.round(avg)} size={18} />
            <p className="text-xs text-gray-400 mt-1">{reviews.length} avis</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {distrib.map(d => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4 shrink-0">{d.star}</span>
                <Star size={10} fill="#fbbf24" stroke="#fbbf24" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right shrink-0">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Évolution mensuelle */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <TrendingUp size={12} />
            Avis reçus — 6 derniers mois
          </h3>
          <div className="flex items-end gap-2 h-20">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 60 }}>
                  <div
                    className="w-full rounded-t-md bg-amber-400/70 transition-all"
                    style={{ height: m.count > 0 ? `${Math.max((m.count / Math.max(...monthlyData.map(x => x.count), 1)) * 60, 4)}px` : "0px" }}
                    title={`${m.count} avis — ${m.avg > 0 ? m.avg.toFixed(1) + "★" : ""}`}
                  />
                </div>
                <span className="text-[9px] text-gray-400">{m.label}</span>
                {m.count > 0 && <span className="text-[8px] text-gray-300">{m.count}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notes par destination ──────────────────────────────────────────── */}
      {destStats.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <MapPin size={12} />
            Note moyenne par destination
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {destStats.map(d => (
              <div key={d.dest} className={`flex items-center gap-3 p-3 rounded-xl border ${ratingBg(d.avg)}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{d.dest}</p>
                  <StarDisplay value={Math.round(d.avg)} size={12} />
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-black ${ratingColor(d.avg)}`}>{d.avg.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-400">{d.count} avis</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Table des avis ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-700">Tous les avis</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#408398]/20 bg-gray-50"
            />
          </div>

          {/* Filter rating */}
          <div className="relative">
            <select
              value={String(filterRating)}
              onChange={e => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none bg-gray-50"
            >
              <option value="all">Toutes notes</option>
              {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} étoile{s > 1 ? "s" : ""}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none bg-gray-50"
            >
              <option value="date">Plus récents</option>
              <option value="rating_desc">Meilleures notes</option>
              <option value="rating_asc">Moins bonnes notes</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <span className="text-xs text-gray-400 ml-auto">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <MessageSquare size={32} />
            <p className="text-sm mt-2">Aucun avis trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {filtered.map(r => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#408398] to-[#5bb8d4] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {r.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                      {r.destination && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#408398]/10 text-[#408398] font-medium">
                          📍 {r.destination}
                        </span>
                      )}
                      <StarDisplay value={r.rating} size={12} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    <p className="text-xs text-gray-300 mt-1">{fmtDate(r.created_at)}</p>
                  </div>

                  {/* Delete */}
                  <div className="shrink-0">
                    {confirmDelete === r.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === r.id ? "..." : "Confirmer"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(r.id)}
                        className="p-2 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors"
                        title="Supprimer cet avis"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
