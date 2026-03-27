"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, Facture } from "@/lib/supabase";
import {
  Plus, Edit2, Trash2, X, User, Search, Crown, Star, UserCheck, Clock,
  Phone, Mail, MapPin, MessageCircle, Globe, Users, ChevronRight,
  Banknote, Calendar, FileText, TrendingUp, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SOURCES = [
  { value: "direct", label: "Direct", icon: <UserCheck size={12} /> },
  { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={12} /> },
  { value: "site_web", label: "Site web", icon: <Globe size={12} /> },
  { value: "reference", label: "Référence", icon: <Users size={12} /> },
  { value: "autre", label: "Autre", icon: <User size={12} /> },
] as const;

const SOURCE_COLORS: Record<string, string> = {
  direct: "bg-blue-100 text-blue-700",
  whatsapp: "bg-green-100 text-green-700",
  site_web: "bg-purple-100 text-purple-700",
  reference: "bg-amber-100 text-amber-700",
  autre: "bg-gray-100 text-gray-600",
};

type Segment = "VIP" | "Régulier" | "Nouveau" | "Inactif";

const SEGMENT_CONFIG: Record<Segment, { label: string; color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  VIP:      { label: "VIP",      color: "text-amber-600",   bg: "bg-amber-100",   icon: <Crown size={11} />,     desc: "3+ voyages ou 150k+ FDJ" },
  Régulier: { label: "Régulier", color: "text-[#408398]",   bg: "bg-[#408398]/10",icon: <Star size={11} />,      desc: "2 voyages" },
  Nouveau:  { label: "Nouveau",  color: "text-emerald-600", bg: "bg-emerald-100", icon: <UserCheck size={11} />, desc: "1er voyage" },
  Inactif:  { label: "Inactif",  color: "text-gray-400",    bg: "bg-gray-100",    icon: <Clock size={11} />,     desc: ">6 mois sans voyage" },
};

const SITES = [
  "Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria",
  "Lac Assal", "Lac Abbé", "Requin-Baleine", "Goubet", "Bankoualeh",
  "Allos", "Obock", "Forêt du Day", "Abourma", "Moucha",
];

function detectSite(facture: Facture): string {
  const desc = facture.lignes.map(l => l.description).join(" ");
  return SITES.find(s => desc.toLowerCase().includes(s.toLowerCase())) || "Autre";
}

function getSegment(factures: Facture[]): Segment {
  if (factures.length === 0) return "Inactif";
  const total = factures.reduce((s, f) => s + f.total, 0);
  if (factures.length >= 3 || total >= 150000) return "VIP";
  if (factures.length === 2) return "Régulier";
  // Check if inactive (no voyage in 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const lastVoyage = factures
    .filter(f => f.date_depart)
    .sort((a, b) => (b.date_depart || "").localeCompare(a.date_depart || ""))[0];
  if (lastVoyage) {
    const [y, m, d] = lastVoyage.date_depart!.split("-").map(Number);
    if (new Date(y, m - 1, d) < sixMonthsAgo) return "Inactif";
  }
  return "Nouveau";
}

function getFavoriteDestination(factures: Facture[]): string | null {
  const counts: Record<string, number> = {};
  factures.forEach(f => {
    const site = detectSite(f);
    counts[site] = (counts[site] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;
function fmtDate(d: string): string {
  if (!d) return "—";
  if (d.includes("T") || d.length > 10) return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const emptyForm = { nom: "", email: "", telephone: "", adresse: "", notes: "", source: "direct" as Client["source"] };

type FilterSegment = "tous" | Segment;

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [filterSegment, setFilterSegment] = useState<FilterSegment>("tous");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: cls }, { data: fcts }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("factures").select("*").order("created_at", { ascending: false }),
    ]);
    setClients(cls || []);
    setFactures(fcts || []);
    setLoading(false);
  };

  // Per-client computed stats
  const clientStats = useMemo(() => {
    const map: Record<string, { factures: Facture[]; total: number; segment: Segment; favSite: string | null; lastDate: string | null }> = {};
    for (const client of clients) {
      const cf = factures.filter(f => f.client_id === client.id);
      const paid = cf.filter(f => f.type === "facture" && (f.statut === "payé" || f.statut === "confirmé"));
      const total = paid.reduce((s, f) => s + f.total, 0);
      const segment = getSegment(paid);
      const favSite = getFavoriteDestination(cf);
      const dates = cf.filter(f => f.date_depart).map(f => f.date_depart!).sort().reverse();
      map[client.id] = { factures: cf, total, segment, favSite, lastDate: dates[0] || null };
    }
    return map;
  }, [clients, factures]);

  // Global stats
  const stats = useMemo(() => {
    const all = Object.values(clientStats);
    return {
      total: clients.length,
      vip: all.filter(s => s.segment === "VIP").length,
      regulier: all.filter(s => s.segment === "Régulier").length,
      nouveau: all.filter(s => s.segment === "Nouveau").length,
      inactif: all.filter(s => s.segment === "Inactif").length,
      caTotal: all.reduce((s, c) => s + c.total, 0),
    };
  }, [clientStats, clients]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.nom.toLowerCase().includes(search.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.telephone || "").includes(search);
      const seg = clientStats[c.id]?.segment;
      const matchSeg = filterSegment === "tous" || seg === filterSegment;
      return matchSearch && matchSeg;
    });
  }, [clients, search, filterSegment, clientStats]);

  const openAdd = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (client: Client, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingClient(client);
    setForm({
      nom: client.nom,
      email: client.email || "",
      telephone: client.telephone || "",
      adresse: client.adresse || "",
      notes: client.notes || "",
      source: client.source || "direct",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingClient) {
      const { error } = await supabase.from("clients").update(form).eq("id", editingClient.id);
      if (error) toast.error("Erreur lors de la modification");
      else { toast.success("Client modifié ✓"); setShowForm(false); }
    } else {
      const { error } = await supabase.from("clients").insert(form);
      if (error) toast.error("Erreur lors de l'ajout");
      else { toast.success("Client ajouté ✓"); setShowForm(false); }
    }
    setSaving(false);
    loadAll();
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Supprimer ce client ?")) return;
    await supabase.from("clients").delete().eq("id", id);
    toast.success("Client supprimé");
    setSelectedClient(null);
    loadAll();
  };

  const sourceLabel = (s: string) => SOURCES.find(x => x.value === s)?.label || s;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
    </div>
  );

  const detailClient = selectedClient ? clientStats[selectedClient.id] : null;

  return (
    <div className="space-y-5">

      {/* ─── KPI Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["tous", "VIP", "Régulier", "Nouveau", "Inactif"] as const).slice(1).map(seg => {
          const cfg = SEGMENT_CONFIG[seg as Segment];
          const count = stats[seg.toLowerCase() as keyof typeof stats] as number;
          return (
            <button key={seg} onClick={() => setFilterSegment(filterSegment === seg ? "tous" : seg)}
              className={`rounded-2xl border p-4 text-left transition-all ${filterSegment === seg ? `${cfg.bg} border-current` : "bg-white border-gray-100 hover:border-gray-200"}`}>
              <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </div>
              <p className={`text-2xl font-black ${filterSegment === seg ? cfg.color : "text-gray-900"}`}>{count}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{cfg.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ─── CA Total ─── */}
      <div className="bg-gradient-to-r from-[#0e2d38] to-[#265868] rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Valeur totale portefeuille</p>
          <p className="text-white text-2xl font-black mt-0.5">{fmt(stats.caTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs">{stats.total} clients</p>
          <p className="text-white/80 text-sm font-semibold mt-0.5">
            Panier moy. {stats.total > 0 ? fmt(Math.round(stats.caTotal / stats.total)) : "—"}
          </p>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nom, email, téléphone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#408398] bg-white"
          />
        </div>
        {filterSegment !== "tous" && (
          <button onClick={() => setFilterSegment("tous")}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
            <Filter size={12} /> Effacer filtre
          </button>
        )}
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors shrink-0">
          <Plus size={15} /> Nouveau client
        </button>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} client{filtered.length !== 1 ? "s" : ""}{filterSegment !== "tous" ? ` · filtre: ${filterSegment}` : ""}</p>

      {/* ─── Client List ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? "Aucun client trouvé" : "Aucun client — ajoutez-en un !"}</p>
          </div>
        ) : (
          filtered.map((client, i) => {
            const cs = clientStats[client.id];
            const cfg = SEGMENT_CONFIG[cs?.segment || "Nouveau"];
            const src = client.source || "direct";
            return (
              <motion.div key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${i < filtered.length - 1 ? "border-b border-gray-50" : ""}`}>

                {/* Avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <span className={`font-black text-sm ${cfg.color}`}>{client.nom.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">{client.nom}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {client.telephone && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} />{client.telephone}</span>}
                      {client.email && <span className="text-xs text-gray-400 truncate">{client.email}</span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SOURCE_COLORS[src]}`}>{sourceLabel(src)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats + actions */}
                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900">{fmt(cs?.total || 0)}</p>
                    <p className="text-[10px] text-gray-400">{(cs?.factures || []).length} doc{(cs?.factures || []).length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => openEdit(client, e)} className="p-2 text-gray-400 hover:text-[#408398] hover:bg-[#408398]/10 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(client.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className={`text-gray-300 transition-transform ${selectedClient?.id === client.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ─── Detail Panel ─── */}
      <AnimatePresence>
        {selectedClient && detailClient && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header */}
            {(() => {
              const cfg = SEGMENT_CONFIG[detailClient.segment];
              return (
                <div className={`px-6 py-5 flex items-center justify-between ${cfg.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-white/70 flex items-center justify-center`}>
                      <span className={`font-black text-lg ${cfg.color}`}>{selectedClient.nom.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${cfg.color} mb-0.5`}>
                        {cfg.icon} {cfg.label}
                      </div>
                      <h3 className="font-black text-gray-900 text-base">{selectedClient.nom}</h3>
                      <p className="text-xs text-gray-500">{selectedClient.adresse || "Adresse non renseignée"}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
                    <X size={15} className="text-gray-600" />
                  </button>
                </div>
              );
            })()}

            <div className="p-6 space-y-6">

              {/* Contact + Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</h4>
                  {selectedClient.telephone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#408398] shrink-0" />
                      <span className="text-sm text-gray-700">{selectedClient.telephone}</span>
                    </div>
                  )}
                  {selectedClient.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-[#408398] shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.adresse && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#408398] shrink-0" />
                      <span className="text-sm text-gray-700">{selectedClient.adresse}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <TrendingUp size={13} className="text-[#408398] shrink-0" />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[selectedClient.source || "direct"]}`}>
                      {sourceLabel(selectedClient.source || "direct")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activité</h4>
                  <div className="flex items-center gap-2">
                    <Banknote size={13} className="text-[#408398] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">CA total généré</p>
                      <p className="text-sm font-bold text-gray-900">{fmt(detailClient.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-[#408398] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Documents</p>
                      <p className="text-sm font-semibold text-gray-900">{detailClient.factures.length} au total</p>
                    </div>
                  </div>
                  {detailClient.favSite && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#408398] shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Destination favorite</p>
                        <p className="text-sm font-semibold text-gray-900">{detailClient.favSite}</p>
                      </div>
                    </div>
                  )}
                  {detailClient.lastDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#408398] shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Dernier voyage</p>
                        <p className="text-sm font-semibold text-gray-900">{fmtDate(detailClient.lastDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes internes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3" style={{ whiteSpace: "pre-wrap" }}>{selectedClient.notes}</p>
                </div>
              )}

              {/* Historique factures */}
              {detailClient.factures.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Historique des documents</h4>
                  <div className="space-y-2">
                    {detailClient.factures
                      .sort((a, b) => b.created_at.localeCompare(a.created_at))
                      .map(f => {
                        const site = detectSite(f);
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
                        return (
                          <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-700">{f.numero}</span>
                                <span className="text-[10px] text-gray-400">{f.type}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statutColors[f.statut]}`}>
                                  {statutLabels[f.statut]}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{site}{f.date_depart ? ` · départ ${fmtDate(f.date_depart)}` : ""}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 shrink-0">{fmt(f.total)}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => openEdit(selectedClient)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors">
                  <Edit2 size={14} /> Modifier
                </button>
                <button onClick={() => handleDelete(selectedClient.id)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Add/Edit Modal ─── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h3 className="font-bold text-gray-900">{editingClient ? "Modifier le client" : "Nouveau client"}</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom complet *</label>
                    <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10"
                      placeholder="Mohamed Ali" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10"
                        placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Téléphone</label>
                      <input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10"
                        placeholder="+253 77..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Adresse</label>
                    <input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10"
                      placeholder="Djibouti-Ville..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Source d&apos;acquisition</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SOURCES.map(s => (
                        <button key={s.value} type="button" onClick={() => setForm({ ...form, source: s.value })}
                          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all ${form.source === s.value ? "bg-[#408398] text-white border-[#408398]" : "border-gray-200 text-gray-600 hover:border-[#408398]/40"}`}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes internes</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10 resize-none"
                      placeholder="Préférences, allergies, remarques..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Annuler
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-2.5 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors disabled:opacity-50">
                      {saving ? "Enregistrement..." : editingClient ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
