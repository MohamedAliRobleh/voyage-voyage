"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { catalog } from "@/lib/catalog";
import type { LigneFacture } from "@/lib/supabase";

interface Props {
  onAdd: (lignes: LigneFacture[]) => void;
  onClose: () => void;
}

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

export default function CatalogModal({ onAdd, onClose }: Props) {
  const [siteId, setSiteId] = useState(catalog[0].id);
  const [qty, setQty] = useState<Record<string, { adultes: number; enfants: number; fixe: number }>>({});

  const site = catalog.find(s => s.id === siteId)!;

  const getQty = (id: string) => qty[id] ?? { adultes: 1, enfants: 0, fixe: 1 };

  const setField = (id: string, field: "adultes" | "enfants" | "fixe", val: number) => {
    setQty(q => ({ ...q, [id]: { ...getQty(id), [field]: Math.max(0, val) } }));
  };

  const handleAdd = (formulId: string) => {
    const formule = site.formules.find(f => f.id === formulId)!;
    const q = getQty(formulId);
    const lignes: LigneFacture[] = [];

    if (formule.type === "fixe") {
      if (q.fixe > 0) {
        lignes.push({
          description: `${site.nom} — ${formule.label} (${formule.description})`,
          quantite: q.fixe,
          prix_unitaire: formule.prixFixe!,
          total: q.fixe * formule.prixFixe!,
        });
      }
    } else {
      if (q.adultes > 0) {
        lignes.push({
          description: `${site.nom} — ${formule.label} · Adulte (${formule.description})`,
          quantite: q.adultes,
          prix_unitaire: formule.prixAdulte!,
          total: q.adultes * formule.prixAdulte!,
        });
      }
      if (q.enfants > 0) {
        lignes.push({
          description: `${site.nom} — ${formule.label} · Enfant ${formule.ageEnfant ? `(${formule.ageEnfant})` : ""} (${formule.description})`,
          quantite: q.enfants,
          prix_unitaire: formule.prixEnfant!,
          total: q.enfants * formule.prixEnfant!,
        });
      }
    }

    if (lignes.length === 0) return;
    onAdd(lignes);
    // Reset qty for this formule
    setQty(q => ({ ...q, [formulId]: { adultes: 1, enfants: 0, fixe: 1 } }));
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
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
              onClick={() => setSiteId(s.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                siteId === s.id
                  ? "text-gray-900 border-[#408398] bg-gray-50"
                  : "text-gray-400 border-transparent hover:text-gray-600"
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
            <motion.div
              key={siteId}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {site.formules.map(formule => {
                const q = getQty(formule.id);
                return (
                  <div key={formule.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
                    {/* Formule header */}
                    <div className="px-4 py-3 flex items-start justify-between gap-3" style={{ borderLeft: `3px solid ${site.couleur}` }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{formule.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formule.description}</p>
                        {formule.type === "par_personne" && (
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-xs font-semibold text-gray-700">
                              Adulte : <span style={{ color: site.couleur }}>{fmt(formule.prixAdulte!)}</span>
                            </span>
                            {formule.prixEnfant && (
                              <span className="text-xs font-semibold text-gray-700">
                                Enfant{formule.ageEnfant ? ` (${formule.ageEnfant})` : ""} : <span style={{ color: site.couleur }}>{fmt(formule.prixEnfant)}</span>
                              </span>
                            )}
                          </div>
                        )}
                        {formule.type === "fixe" && (
                          <p className="text-xs font-semibold mt-1" style={{ color: site.couleur }}>
                            {fmt(formule.prixFixe!)} <span className="text-gray-400 font-normal">/ {formule.noteFixe}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity selector */}
                    <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 flex-wrap">
                      {formule.type === "par_personne" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-500 w-14">Adultes</span>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button type="button" onClick={() => setField(formule.id, "adultes", q.adultes - 1)}
                                className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">−</button>
                              <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">{q.adultes}</span>
                              <button type="button" onClick={() => setField(formule.id, "adultes", q.adultes + 1)}
                                className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">+</button>
                            </div>
                          </div>
                          {formule.prixEnfant !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-500 w-14">Enfants</span>
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                <button type="button" onClick={() => setField(formule.id, "enfants", q.enfants - 1)}
                                  className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">−</button>
                                <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">{q.enfants}</span>
                                <button type="button" onClick={() => setField(formule.id, "enfants", q.enfants + 1)}
                                  className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">+</button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-gray-500">Quantité</span>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button type="button" onClick={() => setField(formule.id, "fixe", q.fixe - 1)}
                              className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">−</button>
                            <span className="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">{q.fixe}</span>
                            <button type="button" onClick={() => setField(formule.id, "fixe", q.fixe + 1)}
                              className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-100 text-sm font-bold transition-colors">+</button>
                          </div>
                        </div>
                      )}

                      {/* Total preview */}
                      <div className="ml-auto text-xs font-bold text-gray-500">
                        {formule.type === "par_personne"
                          ? fmt((q.adultes * (formule.prixAdulte ?? 0)) + (q.enfants * (formule.prixEnfant ?? 0)))
                          : fmt(q.fixe * (formule.prixFixe ?? 0))
                        }
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(formule.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                        style={{ background: site.couleur }}
                      >
                        <Plus size={11} /> Ajouter
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
