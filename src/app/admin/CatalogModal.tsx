"use client";

import { useState, useEffect } from "react";
import { X, Plus, ChevronDown, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { catalog } from "@/lib/catalog";
import type { CatalogFormule } from "@/lib/catalog";
import type { LigneFacture, CatalogFormuleCustom } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

interface Props {
  onAdd: (lignes: LigneFacture[]) => void;
  onClose: () => void;
}

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

const emptyDraft = () => ({
  label: "",
  description: "",
  type: "par_personne" as "par_personne" | "fixe",
  prix_adulte: "" as string | number,
  prix_enfant: "" as string | number,
  prix_fixe: "" as string | number,
  note_fixe: "",
});

export default function CatalogModal({ onAdd, onClose }: Props) {
  const [siteId, setSiteId] = useState(catalog[0].id);
  const [qty, setQty] = useState<Record<string, { adultes: number; enfants: number; fixe: number }>>({});
  const [customFormules, setCustomFormules] = useState<CatalogFormuleCustom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("catalog_formules_custom").select("*").order("created_at").then(({ data }) => {
      if (data) setCustomFormules(data);
    });
  }, []);

  const site = catalog.find(s => s.id === siteId)!;

  const customForSite: CatalogFormule[] = customFormules
    .filter(c => c.site_id === siteId)
    .map(c => ({
      id: c.id,
      label: c.label,
      description: c.description,
      type: c.type,
      prixAdulte: c.prix_adulte ?? undefined,
      prixEnfant: c.prix_enfant ?? undefined,
      prixFixe: c.prix_fixe ?? undefined,
      noteFixe: c.note_fixe ?? undefined,
    }));

  const allFormules = [...site.formules, ...customForSite];

  const getQty = (id: string) => qty[id] ?? { adultes: 1, enfants: 0, fixe: 1 };

  const setField = (id: string, field: "adultes" | "enfants" | "fixe", val: number) => {
    setQty(q => ({ ...q, [id]: { ...getQty(id), [field]: Math.max(0, val) } }));
  };

  const handleAdd = (formulId: string) => {
    const formule = allFormules.find(f => f.id === formulId)!;
    const q = getQty(formulId);
    const lignes: LigneFacture[] = [];

    if (formule.type === "fixe") {
      if (q.fixe > 0) lignes.push({
        description: `${site.nom} — ${formule.label}${formule.description ? ` (${formule.description})` : ""}`,
        quantite: q.fixe,
        prix_unitaire: formule.prixFixe!,
        total: q.fixe * formule.prixFixe!,
      });
    } else {
      if (q.adultes > 0) lignes.push({
        description: `${site.nom} — ${formule.label} · Adulte${formule.description ? ` (${formule.description})` : ""}`,
        quantite: q.adultes,
        prix_unitaire: formule.prixAdulte!,
        total: q.adultes * formule.prixAdulte!,
      });
      if (q.enfants > 0) lignes.push({
        description: `${site.nom} — ${formule.label} · Enfant${formule.ageEnfant ? ` (${formule.ageEnfant})` : ""}${formule.description ? ` (${formule.description})` : ""}`,
        quantite: q.enfants,
        prix_unitaire: formule.prixEnfant!,
        total: q.enfants * formule.prixEnfant!,
      });
    }

    if (lignes.length === 0) return;
    onAdd(lignes);
    setQty(q => ({ ...q, [formulId]: { adultes: 1, enfants: 0, fixe: 1 } }));
  };

  const handleSave = async () => {
    if (!draft.label) return;
    setSaving(true);
    const row = {
      site_id: siteId,
      label: draft.label,
      description: draft.description,
      type: draft.type,
      prix_adulte: draft.type === "par_personne" && draft.prix_adulte !== "" ? Number(draft.prix_adulte) : null,
      prix_enfant: draft.type === "par_personne" && draft.prix_enfant !== "" ? Number(draft.prix_enfant) : null,
      prix_fixe: draft.type === "fixe" && draft.prix_fixe !== "" ? Number(draft.prix_fixe) : null,
      note_fixe: draft.note_fixe || null,
      age_enfant: null,
    };
    const { data, error } = await supabase.from("catalog_formules_custom").insert(row).select().single();
    if (!error && data) {
      setCustomFormules(prev => [...prev, data]);
      setShowForm(false);
      setDraft(emptyDraft());
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("catalog_formules_custom").delete().eq("id", id);
    setCustomFormules(prev => prev.filter(c => c.id !== id));
  };

  const canSave = draft.label && (
    draft.type === "fixe" ? Number(draft.prix_fixe) > 0 : Number(draft.prix_adulte) > 0
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[71]
          bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Catalogue des tarifs</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Cliquez sur une formule pour l&apos;ajouter</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Site tabs */}
        <div className="px-4 pt-3 pb-0 flex gap-1.5 overflow-x-auto shrink-0 border-b border-gray-100">
          {catalog.map(s => (
            <button
              key={s.id}
              onClick={() => { setSiteId(s.id); setShowForm(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                siteId === s.id ? "text-gray-900 border-[#408398] bg-gray-50" : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.nom}</span>
            </button>
          ))}
        </div>

        {/* Formules */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div key={siteId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="space-y-3">

              {allFormules.map(formule => {
                const q = getQty(formule.id);
                const isCustom = customForSite.some(c => c.id === formule.id);
                return (
                  <div key={formule.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
                    <div className="px-4 py-3 flex items-start justify-between gap-3" style={{ borderLeft: `3px solid ${isCustom ? "#f59e0b" : site.couleur}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{formule.label}</p>
                          {isCustom && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Perso</span>}
                        </div>
                        {formule.description && <p className="text-[11px] text-gray-400 mt-0.5">{formule.description}</p>}
                        {formule.type === "par_personne" && (
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-xs font-semibold text-gray-700">Adulte : <span style={{ color: isCustom ? "#f59e0b" : site.couleur }}>{fmt(formule.prixAdulte!)}</span></span>
                            {formule.prixEnfant && <span className="text-xs font-semibold text-gray-700">Enfant : <span style={{ color: isCustom ? "#f59e0b" : site.couleur }}>{fmt(formule.prixEnfant)}</span></span>}
                          </div>
                        )}
                        {formule.type === "fixe" && (
                          <p className="text-xs font-semibold mt-1" style={{ color: isCustom ? "#f59e0b" : site.couleur }}>
                            {fmt(formule.prixFixe!)} {formule.noteFixe && <span className="text-gray-400 font-normal">/ {formule.noteFixe}</span>}
                          </p>
                        )}
                      </div>
                      {isCustom && (
                        <button type="button" onClick={() => handleDelete(formule.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 flex-wrap">
                      {formule.type === "par_personne" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-500 w-14">Adultes</span>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button type="button" onClick={() => setField(formule.id, "adultes", q.adultes - 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">−</button>
                              <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">{q.adultes}</span>
                              <button type="button" onClick={() => setField(formule.id, "adultes", q.adultes + 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">+</button>
                            </div>
                          </div>
                          {formule.prixEnfant !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-500 w-14">Enfants</span>
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                <button type="button" onClick={() => setField(formule.id, "enfants", q.enfants - 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">−</button>
                                <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">{q.enfants}</span>
                                <button type="button" onClick={() => setField(formule.id, "enfants", q.enfants + 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">+</button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-gray-500">Quantité</span>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button type="button" onClick={() => setField(formule.id, "fixe", q.fixe - 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">−</button>
                            <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">{q.fixe}</span>
                            <button type="button" onClick={() => setField(formule.id, "fixe", q.fixe + 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">+</button>
                          </div>
                        </div>
                      )}
                      <div className="ml-auto text-xs font-bold text-gray-500">
                        {formule.type === "par_personne"
                          ? fmt((q.adultes * (formule.prixAdulte ?? 0)) + (q.enfants * (formule.prixEnfant ?? 0)))
                          : fmt(q.fixe * (formule.prixFixe ?? 0))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdd(formule.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                        style={{ background: isCustom ? "#f59e0b" : site.couleur }}
                      >
                        <Plus size={11} /> Ajouter
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Bouton ajouter formule */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowForm(v => !v)}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2"><Plus size={15} /> Ajouter une formule permanente</span>
                  <ChevronDown size={14} className={`transition-transform ${showForm ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 bg-amber-50 border-t border-amber-100">
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className="col-span-2">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Nom de la formule *</label>
                            <input type="text" value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                              placeholder="Ex: Formule spéciale weekend"
                              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                            <input type="text" value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                              placeholder="Ex: Dîner + Petit-déjeuner"
                              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Type de tarif</label>
                            <div className="flex gap-2 mt-1">
                              <button type="button" onClick={() => setDraft(d => ({ ...d, type: "par_personne" }))}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${draft.type === "par_personne" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-500 border-gray-200"}`}>
                                Par personne
                              </button>
                              <button type="button" onClick={() => setDraft(d => ({ ...d, type: "fixe" }))}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${draft.type === "fixe" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-500 border-gray-200"}`}>
                                Prix fixe
                              </button>
                            </div>
                          </div>

                          {draft.type === "par_personne" ? (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Prix adulte (FDJ) *</label>
                                <input type="number" min={0} value={draft.prix_adulte} onChange={e => setDraft(d => ({ ...d, prix_adulte: e.target.value }))}
                                  placeholder="0"
                                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Prix enfant (FDJ)</label>
                                <input type="number" min={0} value={draft.prix_enfant} onChange={e => setDraft(d => ({ ...d, prix_enfant: e.target.value }))}
                                  placeholder="Optionnel"
                                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Prix (FDJ) *</label>
                                <input type="number" min={0} value={draft.prix_fixe} onChange={e => setDraft(d => ({ ...d, prix_fixe: e.target.value }))}
                                  placeholder="0"
                                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Unité</label>
                                <input type="text" value={draft.note_fixe} onChange={e => setDraft(d => ({ ...d, note_fixe: e.target.value }))}
                                  placeholder="ex: par nuit"
                                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => { setShowForm(false); setDraft(emptyDraft()); }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                            Annuler
                          </button>
                          <button type="button" onClick={handleSave} disabled={!canSave || saving}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-40">
                            {saving ? "Enregistrement..." : "Enregistrer"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
