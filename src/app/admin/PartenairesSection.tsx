"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Partenaire, Reversement } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Phone, Mail, MapPin, Star, Edit2, X, Check,
  TrendingUp, Wallet, ArrowDownCircle, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

const SITE_COLORS: Record<string, string> = {
  Hougeif:          "#408398",
  Loubatanleh:      "#059669",
  "Sables Blancs":  "#16a34a",
  Ditilou:          "#7c3aed",
  Godoria:          "#0891b2",
  "Lac Assal":      "#0284c7",
  "Lac Abbé":       "#ea580c",
  "Requin-Baleine": "#2563eb",
  Goubet:           "#dc2626",
  Bankoualeh:       "#65a30d",
  Allos:            "#ca8a04",
  Obock:            "#4338ca",
  "Forêt du Day":   "#0d9488",
  Abourma:          "#d97706",
  Moucha:           "#8b5cf6",
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange?.(s)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"}`}>
          <Star size={14} className={s <= value ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
        </button>
      ))}
    </div>
  );
}

export default function PartenairesSection() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [reversements, setReversements] = useState<Reversement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partenaire | null>(null);
  const [selected, setSelected] = useState<Partenaire | null>(null);
  const [form, setForm] = useState<Partial<Partenaire>>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("partenaires").select("*").order("nom"),
      supabase.from("reversements").select("*"),
    ]);
    setPartenaires(p || []);
    setReversements(r || []);
    setLoading(false);
  };

  const openEdit = (p: Partenaire) => {
    setEditing(p);
    setForm({ ...p });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("partenaires").update({
      contact: form.contact,
      telephone: form.telephone,
      email: form.email,
      localisation: form.localisation,
      commission_defaut: form.commission_defaut,
      notes: form.notes,
      note_performance: form.note_performance,
    }).eq("id", editing.id);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Partenaire mis à jour ✓");
    setEditing(null);
    if (selected?.id === editing.id) setSelected({ ...selected, ...form } as Partenaire);
    loadData();
  };

  const getStats = (nom: string) => {
    const rs = reversements.filter(r => r.site_nom === nom);
    const totalEncaisse = rs.reduce((s, r) => s + r.total_client, 0);
    const totalReverser = rs.reduce((s, r) => s + r.marge, 0); // what partner receives
    const commissionVV = rs.reduce((s, r) => s + r.montant_reverser, 0); // VV commission
    const aReverser = rs.filter(r => r.statut === "à reverser").reduce((s, r) => s + r.marge, 0); // pending to partner
    const voyages = rs.length;
    return { totalEncaisse, totalReverser, commissionVV, aReverser, voyages, rs };
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex gap-6">

      {/* Left — partner list */}
      <div className={`flex flex-col gap-4 transition-all ${selected ? "w-64 shrink-0" : "flex-1"}`}>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Sites partenaires</h2>

        {partenaires.map((p, i) => {
          const stats = getStats(p.nom);
          const color = SITE_COLORS[p.nom] || "#408398";
          const isSelected = selected?.id === p.id;

          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(isSelected ? null : p)}
              className={`w-full text-left bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md cursor-pointer ${
                isSelected ? "border-[#408398]/40 ring-1 ring-[#408398]/20" : "border-gray-100"
              }`}>

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}20` }}>
                    <Building2 size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{p.nom}</p>
                    {p.localisation && <p className="text-xs text-gray-400">{p.localisation}</p>}
                  </div>
                </div>
                <StarRating value={p.note_performance} />
              </div>

              {/* Stats row */}
              {!selected && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: "Voyages", value: stats.voyages, color: "text-gray-700" },
                    { label: "CA", value: stats.totalEncaisse > 0 ? `${(stats.totalEncaisse / 1000).toFixed(0)}k` : "—", color: "text-blue-600" },
                    { label: "Dû", value: stats.totalReverser > 0 ? `${(stats.totalReverser / 1000).toFixed(0)}k` : "—", color: "text-red-500" },
                    { label: "Dû", value: stats.aReverser > 0 ? `${(stats.aReverser / 1000).toFixed(0)}k` : "—", color: stats.aReverser > 0 ? "text-red-500" : "text-gray-300" },
                  ].map((s, j) => (
                    <div key={j} className="text-center">
                      <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Alert */}
              {stats.aReverser > 0 && (
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-red-500 font-semibold">
                  <AlertTriangle size={11} />
                  {fmt(stats.aReverser)} à reverser
                </div>
              )}

              {/* Commission */}
              <div className="mt-2 text-[10px] text-gray-400">
                Commission par défaut : <span className="font-bold text-gray-600">{p.commission_defaut}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right — detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="flex-1 min-w-0 space-y-4">

            {/* Detail header */}
            {(() => {
              const stats = getStats(selected.nom);
              const color = SITE_COLORS[selected.nom] || "#408398";
              return (
                <>
                  {/* Header card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${color}20` }}>
                          <Building2 size={22} style={{ color }} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{selected.nom}</h3>
                          {selected.localisation && <p className="text-xs text-gray-400">{selected.localisation}</p>}
                          <StarRating value={selected.note_performance} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(selected)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-600 transition-colors">
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button onClick={() => setSelected(null)}
                          className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                          <X size={15} className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Phone, label: "Téléphone", value: selected.telephone || "—" },
                        { icon: Mail, label: "Email", value: selected.email || "—" },
                        { icon: Building2, label: "Contact", value: selected.contact || "—" },
                        { icon: MapPin, label: "Localisation", value: selected.localisation || "—" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                          <item.icon size={13} className="text-gray-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] text-gray-400 uppercase font-bold">{item.label}</p>
                            <p className="text-xs font-semibold text-gray-700 truncate">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selected.notes && (
                      <div className="mt-3 bg-amber-50 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Notes</p>
                        <p className="text-xs text-amber-800">{selected.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Financial KPIs */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "CA total généré", value: fmt(stats.totalEncaisse), icon: Wallet, color: "bg-blue-50 text-blue-600" },
                      { label: "Dû au partenaire", value: fmt(stats.totalReverser), icon: ArrowDownCircle, color: "bg-red-50 text-red-500" },
                      { label: "Commission agence", value: fmt(stats.commissionVV), icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
                      { label: "Solde dû", value: fmt(stats.aReverser), icon: AlertTriangle, color: stats.aReverser > 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600" },
                    ].map((k, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}>
                          <k.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{k.value}</p>
                          <p className="text-[10px] text-gray-400">{k.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Commission info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Commission par défaut</p>
                      <p className="text-2xl font-bold text-gray-900">{selected.commission_defaut}<span className="text-base text-gray-400">%</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Commission agence moy.</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.totalEncaisse > 0 ? ((stats.commissionVV / stats.totalEncaisse) * 100).toFixed(1) : "—"}<span className="text-base text-purple-300">%</span>
                      </p>
                    </div>
                  </div>

                  {/* Historique reversements */}
                  {stats.rs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique des voyages</p>
                      </div>
                      {stats.rs.map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{r.client_nom}</p>
                            <p className="text-xs text-gray-400">{r.facture_numero}</p>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <p className="text-xs font-bold text-gray-700">{fmt(r.total_client)}</p>
                              <p className="text-[10px] text-gray-400">encaissé</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-red-500">{fmt(r.marge)}</p>
                              <p className="text-[10px] text-gray-400">dû au partenaire</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              r.statut === "reversé" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                            }`}>
                              {r.statut === "reversé" ? "✓" : "En attente"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {stats.rs.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Building2 size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucun voyage réalisé avec ce partenaire.</p>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm" onClick={() => setEditing(null)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] bg-white rounded-2xl shadow-2xl max-w-md mx-auto overflow-hidden"
              onClick={e => e.stopPropagation()}>

              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Modifier — {editing.nom}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={15} className="text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                {[
                  { label: "Personne de contact", field: "contact", placeholder: "Nom du responsable" },
                  { label: "Téléphone", field: "telephone", placeholder: "+253 77 XX XX XX" },
                  { label: "Email", field: "email", placeholder: "contact@site.dj" },
                  { label: "Localisation", field: "localisation", placeholder: "Région / ville" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
                    <input type="text" value={(form as Record<string, string>)[field] || ""} placeholder={placeholder}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Commission par défaut (%)</label>
                  <input type="number" min="0" max="100" value={form.commission_defaut || 0}
                    onChange={e => setForm({ ...form, commission_defaut: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Note de performance</label>
                  <StarRating value={form.note_performance || 0} onChange={v => setForm({ ...form, note_performance: v })} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Notes internes</label>
                  <textarea value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                    placeholder="Conditions particulières, remarques..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] resize-none" />
                </div>

                <button onClick={saveEdit}
                  className="w-full py-3 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors flex items-center justify-center gap-2">
                  <Check size={15} /> Enregistrer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
