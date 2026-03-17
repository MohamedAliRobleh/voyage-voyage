"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, Facture, LigneFacture } from "@/lib/supabase";
import { Plus, Trash2, X, FileText, ChevronRight, Check, Clock, Send, Eye, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const statutConfig = {
  brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-600", icon: Clock },
  envoyé: { label: "Envoyé", color: "bg-blue-50 text-blue-600", icon: Send },
  payé: { label: "Payé", color: "bg-green-50 text-green-600", icon: Check },
};

const emptyLigne: LigneFacture = { description: "", quantite: 1, prix_unitaire: 0, total: 0 };

function generateNumero(factures: Facture[]) {
  const year = new Date().getFullYear();
  const existing = factures.filter(f => f.numero.startsWith(`FAC-${year}-`));
  const next = (existing.length + 1).toString().padStart(3, "0");
  return `FAC-${year}-${next}`;
}

export default function FacturesSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewFacture, setViewFacture] = useState<Facture | null>(null);

  const [form, setForm] = useState({
    client_id: "",
    client_nom: "",
    client_email: "",
    date: new Date().toISOString().split("T")[0],
    echeance: "",
    notes: "",
    lignes: [{ ...emptyLigne }] as LigneFacture[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: f }, { data: c }] = await Promise.all([
      supabase.from("factures").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("nom"),
    ]);
    setFactures(f || []);
    setClients(c || []);
    setLoading(false);
  };

  const totalLignes = (lignes: LigneFacture[]) =>
    lignes.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0);

  const updateLigne = (i: number, field: keyof LigneFacture, value: string | number) => {
    const newLignes = [...form.lignes];
    newLignes[i] = { ...newLignes[i], [field]: value };
    newLignes[i].total = newLignes[i].quantite * newLignes[i].prix_unitaire;
    setForm({ ...form, lignes: newLignes });
  };

  const addLigne = () => setForm({ ...form, lignes: [...form.lignes, { ...emptyLigne }] });

  const removeLigne = (i: number) => {
    if (form.lignes.length === 1) return;
    setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });
  };

  const selectClient = (clientId: string) => {
    const c = clients.find(c => c.id === clientId);
    setForm({ ...form, client_id: clientId, client_nom: c?.nom || "", client_email: c?.email || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_nom) { toast.error("Sélectionnez un client"); return; }

    const lignesValides = form.lignes.filter(l => l.description.trim());
    if (lignesValides.length === 0) { toast.error("Ajoutez au moins une prestation"); return; }

    const numero = generateNumero(factures);
    const total = totalLignes(lignesValides);

    const { error } = await supabase.from("factures").insert({
      numero,
      client_id: form.client_id || null,
      client_nom: form.client_nom,
      client_email: form.client_email,
      date: form.date,
      echeance: form.echeance || null,
      statut: "brouillon",
      lignes: lignesValides,
      total,
      notes: form.notes,
    });

    if (error) { toast.error("Erreur lors de la création"); return; }
    toast.success(`Facture ${numero} créée ✓`);
    setShowForm(false);
    setForm({ client_id: "", client_nom: "", client_email: "", date: new Date().toISOString().split("T")[0], echeance: "", notes: "", lignes: [{ ...emptyLigne }] });
    loadData();
  };

  const changeStatut = async (id: string, statut: Facture["statut"]) => {
    await supabase.from("factures").update({ statut }).eq("id", id);
    toast.success(`Statut mis à jour : ${statutConfig[statut].label}`);
    loadData();
    if (viewFacture?.id === id) setViewFacture({ ...viewFacture, statut });
  };

  const deleteFacture = async (id: string) => {
    if (!confirm("Supprimer cette facture ?")) return;
    await supabase.from("factures").delete().eq("id", id);
    toast.success("Facture supprimée");
    setViewFacture(null);
    loadData();
  };

  const formatMoney = (n: number) => `${Number(n).toLocaleString("fr-FR")} DJF`;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{factures.length} facture{factures.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors"
        >
          <Plus size={15} />
          Nouvelle facture
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
          </div>
        ) : factures.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune facture encore — créez-en une !</p>
          </div>
        ) : (
          factures.map((facture, i) => {
            const s = statutConfig[facture.statut as keyof typeof statutConfig] || statutConfig.brouillon;
            return (
              <div
                key={facture.id}
                className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${i < factures.length - 1 ? "border-b border-gray-50" : ""}`}
                onClick={() => setViewFacture(facture)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#408398]/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-[#408398]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{facture.numero}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{facture.client_nom} — {new Date(facture.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900 text-sm">{formatMoney(facture.total)}</p>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h3 className="font-bold text-gray-900">Nouvelle facture</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Client */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Client *</label>
                    {clients.length > 0 ? (
                      <select
                        value={form.client_id}
                        onChange={e => selectClient(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] bg-white"
                      >
                        <option value="">Sélectionner un client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.email ? `— ${c.email}` : ""}</option>)}
                      </select>
                    ) : null}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <input
                        value={form.client_nom}
                        onChange={e => setForm({ ...form, client_nom: e.target.value })}
                        placeholder="Nom du client *"
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]"
                      />
                      <input
                        type="email"
                        value={form.client_email}
                        onChange={e => setForm({ ...form, client_email: e.target.value })}
                        placeholder="Email du client"
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                      <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Échéance</label>
                      <input type="date" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                    </div>
                  </div>

                  {/* Lignes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prestations</label>
                    <div className="space-y-2">
                      {form.lignes.map((ligne, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            value={ligne.description}
                            onChange={e => updateLigne(i, "description", e.target.value)}
                            placeholder="Description"
                            className="col-span-6 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#408398]"
                          />
                          <input
                            type="number"
                            min="1"
                            value={ligne.quantite}
                            onChange={e => updateLigne(i, "quantite", Number(e.target.value))}
                            className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#408398] text-center"
                          />
                          <input
                            type="number"
                            min="0"
                            value={ligne.prix_unitaire}
                            onChange={e => updateLigne(i, "prix_unitaire", Number(e.target.value))}
                            placeholder="Prix"
                            className="col-span-3 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#408398]"
                          />
                          <button type="button" onClick={() => removeLigne(i)} className="col-span-1 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addLigne} className="mt-2 flex items-center gap-1.5 text-xs text-[#408398] font-medium hover:underline">
                      <Plus size={12} /> Ajouter une ligne
                    </button>

                    {/* Total */}
                    <div className="mt-4 flex justify-end">
                      <div className="bg-gray-50 rounded-xl px-5 py-3 text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Total</p>
                        <p className="text-xl font-bold text-gray-900">{formatMoney(totalLignes(form.lignes))}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] resize-none" placeholder="Conditions, remarques..." />
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                    <button type="submit" className="flex-1 py-3 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors">
                      Créer la facture
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Facture Modal */}
      <AnimatePresence>
        {viewFacture && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setViewFacture(null)} />
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-bold text-gray-900">{viewFacture.numero}</h3>
                  <p className="text-xs text-gray-400">{viewFacture.client_nom}</p>
                </div>
                <button onClick={() => setViewFacture(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Statut */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Statut</p>
                  <div className="flex gap-2">
                    {(Object.keys(statutConfig) as Array<keyof typeof statutConfig>).map(s => (
                      <button
                        key={s}
                        onClick={() => changeStatut(viewFacture.id, s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${viewFacture.statut === s ? statutConfig[s].color + " border-transparent" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
                      >
                        {viewFacture.statut === s && <Check size={11} />}
                        {statutConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Client</p>
                    <p className="text-sm font-semibold text-gray-900">{viewFacture.client_nom}</p>
                    {viewFacture.client_email && <p className="text-xs text-gray-400">{viewFacture.client_email}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(viewFacture.date).toLocaleDateString("fr-FR")}</p>
                    {viewFacture.echeance && <p className="text-xs text-gray-400">Échéance : {new Date(viewFacture.echeance).toLocaleDateString("fr-FR")}</p>}
                  </div>
                </div>

                {/* Lignes */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Prestations</p>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-400 border-b border-gray-100">
                      <span className="col-span-6">Description</span>
                      <span className="col-span-2 text-center">Qté</span>
                      <span className="col-span-2 text-right">Prix</span>
                      <span className="col-span-2 text-right">Total</span>
                    </div>
                    {viewFacture.lignes.map((l, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm border-b border-gray-100 last:border-0">
                        <span className="col-span-6 text-gray-900">{l.description}</span>
                        <span className="col-span-2 text-center text-gray-500">{l.quantite}</span>
                        <span className="col-span-2 text-right text-gray-500">{Number(l.prix_unitaire).toLocaleString("fr-FR")}</span>
                        <span className="col-span-2 text-right font-semibold text-gray-900">{Number(l.quantite * l.prix_unitaire).toLocaleString("fr-FR")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 bg-[#408398]/5">
                      <span className="text-sm font-semibold text-gray-700">Total</span>
                      <span className="text-lg font-bold text-[#408398]">{formatMoney(viewFacture.total)}</span>
                    </div>
                  </div>
                </div>

                {viewFacture.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{viewFacture.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => deleteFacture(viewFacture.id)}
                  className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Supprimer cette facture
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
