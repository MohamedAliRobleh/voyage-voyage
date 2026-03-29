"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture, Reversement, Partenaire } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ArrowDownCircle, CheckCircle, Wallet, Building2, Send } from "lucide-react";
import toast from "react-hot-toast";

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

const SITES = [
  "Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria",
  "Lac Assal", "Lac Abbé", "Requin-Baleine", "Goubet", "Bankoualeh",
  "Allos", "Obock", "Forêt du Day", "Abourma", "Moucha", "Autre",
];

interface ClotureModal {
  facture: Facture;
}

export default function ReversementsSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [reversements, setReversements] = useState<Reversement[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ClotureModal | null>(null);

  // Cloture form state
  const [siteNom, setSiteNom] = useState(SITES[0]);
  const [unite, setUnite] = useState<"%" | "FDJ">("%");
  const [valeur, setValeur] = useState<string>("");
  const [notesR, setNotesR] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: f }, { data: r }, { data: p }] = await Promise.all([
      supabase.from("factures").select("*").eq("statut", "payé").order("created_at", { ascending: false }),
      supabase.from("reversements").select("*").order("created_at", { ascending: false }),
      supabase.from("partenaires").select("*"),
    ]);
    setFactures(f || []);
    setReversements(r || []);
    setPartenaires(p || []);
    setLoading(false);
  };

  const findPartenaireBySite = (site: string) =>
    partenaires.find(p =>
      (p.sites?.length > 0 ? p.sites : [p.nom]).some(s => s.toLowerCase() === site.toLowerCase())
    );

  const applyCommissionPartenaire = (site: string) => {
    const p = findPartenaireBySite(site);
    if (p && p.commission_defaut) {
      setUnite("%");
      setValeur(String(p.commission_defaut));
    } else {
      setValeur("");
    }
  };

  const detectSite = (facture: Facture): string => {
    const descriptions = facture.lignes.map(l => l.description).join(" ");
    const found = SITES.find(s => descriptions.toLowerCase().includes(s.toLowerCase()));
    return found || SITES[0];
  };

  const openModal = (facture: Facture) => {
    const site = detectSite(facture);
    setModal({ facture });
    setSiteNom(site);
    setNotesR("");
    const p = findPartenaireBySite(site);
    if (p && p.commission_defaut) {
      setUnite("%");
      setValeur(String(p.commission_defaut));
    } else {
      setUnite("%");
      setValeur("");
    }
  };

  const montantCalcule = (): number => {
    if (!modal || !valeur) return 0;
    const v = parseFloat(valeur);
    if (isNaN(v)) return 0;
    if (unite === "%") return Math.round(modal.facture.total * v / 100);
    return v;
  };

  const margeCalculee = (): number => {
    if (!modal) return 0;
    return modal.facture.total - montantCalcule();
  };

  const handleCloture = async () => {
    if (!modal || !valeur || !siteNom) return;
    const montant = montantCalcule();
    const marge = margeCalculee();
    const { error } = await supabase.from("reversements").insert({
      facture_id: modal.facture.id,
      facture_numero: modal.facture.numero,
      client_nom: modal.facture.client_nom,
      site_nom: siteNom,
      total_client: modal.facture.total,
      unite,
      valeur: parseFloat(valeur),
      montant_reverser: montant,
      marge,
      statut: "à reverser",
      notes: notesR,
    });
    if (error) { console.error("Erreur clôture:", error); toast.error(error.message); return; }
    toast.success("Voyage clôturé ✓");
    setModal(null);
    loadData();
  };

  const sendToPartenaire = async (r: Reversement) => {
    const partenaire = findPartenaireBySite(r.site_nom);
    if (!partenaire) {
      toast.error(`Aucun partenaire trouvé pour ${r.site_nom}`);
      return;
    }
    try {
      const res = await fetch("/api/send-partner-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reversement: r, partenaire }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.emailSent) toast.success(`Email envoyé à ${partenaire.nom} ✓`);
      else if (!partenaire.email) toast("Aucun email partenaire — WhatsApp uniquement", { icon: "ℹ️" });
      if (json.waUrl) window.open(json.waUrl, "_blank");
    } catch {
      toast.error("Erreur lors de l'envoi au partenaire");
    }
  };

  const toggleStatut = async (r: Reversement) => {
    const newStatut = r.statut === "à reverser" ? "reversé" : "à reverser";
    await supabase.from("reversements").update({ statut: newStatut }).eq("id", r.id);
    toast.success(newStatut === "reversé" ? "Marqué comme reversé ✓" : "Marqué comme à reverser");
    loadData();
  };

  // IDs des factures déjà clôturées
  const clotureesIds = new Set(reversements.map(r => r.facture_id));
  const facturesEnAttente = factures.filter(f => !clotureesIds.has(f.id));

  // Bilan
  const totalEncaisse = reversements.reduce((s, r) => s + r.total_client, 0);
  const totalAReverser = reversements.filter(r => r.statut === "à reverser").reduce((s, r) => s + r.marge, 0);
  const totalReverser = reversements.filter(r => r.statut === "reversé").reduce((s, r) => s + r.marge, 0);
  const commissionAgence = reversements.reduce((s, r) => s + r.montant_reverser, 0);

  // Bilan par site
  const parSite = SITES.map(site => {
    const rs = reversements.filter(r => r.site_nom === site);
    if (rs.length === 0) return null;
    return {
      site,
      aReverser: rs.filter(r => r.statut === "à reverser").reduce((s, r) => s + r.marge, 0),
      reverser: rs.filter(r => r.statut === "reversé").reduce((s, r) => s + r.marge, 0),
    };
  }).filter(Boolean) as { site: string; aReverser: number; reverser: number }[];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Bilan global */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Bilan global</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total encaissé", value: totalEncaisse, icon: Wallet, color: "bg-blue-50 text-blue-600" },
            { label: "Dû aux partenaires", value: totalAReverser, icon: ArrowDownCircle, color: "bg-red-50 text-red-500" },
            { label: "Déjà reversé", value: totalReverser, icon: CheckCircle, color: "bg-green-50 text-green-600" },
            { label: "Commission agence", value: commissionAgence, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(stat.value)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bilan par site */}
      {parSite.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Par site touristique</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {parSite.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#408398]/10 rounded-lg flex items-center justify-center">
                    <Building2 size={14} className="text-[#408398]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{s.site}</span>
                </div>
                <div className="flex items-center gap-6 text-right">
                  {s.aReverser > 0 && (
                    <div>
                      <p className="text-xs text-red-500 font-bold">{fmt(s.aReverser)}</p>
                      <p className="text-[10px] text-gray-400">à reverser</p>
                    </div>
                  )}
                  {s.reverser > 0 && (
                    <div>
                      <p className="text-xs text-green-600 font-bold">{fmt(s.reverser)}</p>
                      <p className="text-[10px] text-gray-400">reversé</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voyages à clôturer */}
      {facturesEnAttente.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Voyages payés — à clôturer ({facturesEnAttente.length})
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {facturesEnAttente.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{f.client_nom}</p>
                  <p className="text-xs text-gray-400">{f.numero} · {fmt(f.total)}</p>
                </div>
                <button onClick={() => openModal(f)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-[#408398] text-white text-xs font-semibold rounded-xl hover:bg-[#326e80] transition-colors shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">Clôturer le voyage</span>
                  <span className="sm:hidden">Clôturer</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique des reversements */}
      {reversements.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Historique</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {reversements.map((r, i) => (
              <div key={i} className="flex items-start justify-between px-4 sm:px-5 py-3.5 border-b border-gray-50 last:border-0 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.client_nom}</p>
                    <span className="text-[10px] text-gray-400">{r.facture_numero}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{r.site_nom} · {fmt(r.total_client)} encaissé</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div>
                      <p className="text-xs font-bold text-red-500">{fmt(r.marge)}</p>
                      <p className="text-[10px] text-gray-400">dû partenaire</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-purple-600">{fmt(r.montant_reverser)}</p>
                      <p className="text-[10px] text-gray-400">commission agence</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => toggleStatut(r)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                      r.statut === "reversé"
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-red-50 text-red-500 hover:bg-red-100"
                    }`}>
                    {r.statut === "reversé" ? "Reversé ✓" : "À reverser"}
                  </button>
                  <button onClick={() => sendToPartenaire(r)}
                    className="flex items-center justify-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-[#408398]/10 text-[#408398] hover:bg-[#408398]/20 transition-colors">
                    <Send size={10} /> Partenaire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reversements.length === 0 && facturesEnAttente.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Wallet size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun voyage payé pour le moment.</p>
          <p className="text-xs mt-1">Les voyages apparaîtront ici une fois la facture marquée comme Payée.</p>
        </div>
      )}

      {/* Modal clôture */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm" onClick={() => setModal(null)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] bg-white rounded-2xl shadow-2xl max-w-md mx-auto overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Clôturer le voyage</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{modal.facture.client_nom} · {fmt(modal.facture.total)}</p>
                </div>
                <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Site */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Site touristique</label>
                  <select value={siteNom} onChange={e => { setSiteNom(e.target.value); applyCommissionPartenaire(e.target.value); }}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]">
                    {SITES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Montant à reverser */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Commission Voyage Voyage (agence)</label>
                    {findPartenaireBySite(siteNom)?.commission_defaut ? (
                      <span className="text-[10px] text-[#408398] font-semibold bg-[#408398]/10 px-2 py-0.5 rounded-lg">
                        Défaut partenaire : {findPartenaireBySite(siteNom)?.commission_defaut}%
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {/* Toggle unité */}
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden shrink-0">
                      {(["%", "FDJ"] as const).map(u => (
                        <button key={u} type="button" onClick={() => { setUnite(u); setValeur(""); }}
                          className={`px-4 py-2.5 text-sm font-bold transition-colors ${
                            unite === u ? "bg-[#408398] text-white" : "text-gray-400 hover:text-gray-600"
                          }`}>
                          {u}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number" min="0" value={valeur} onChange={e => setValeur(e.target.value)}
                      placeholder={unite === "%" ? "ex: 20" : "ex: 15000"}
                      className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]"
                    />
                  </div>
                </div>

                {/* Résumé calculé */}
                {valeur && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total encaissé client</span>
                      <span className="font-bold text-gray-900">{fmt(modal.facture.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commission agence (VV)</span>
                      <span className="font-bold text-purple-600">{fmt(montantCalcule())}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">Dû au partenaire</span>
                      <span className="font-bold text-red-500">{fmt(margeCalculee())}</span>
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Notes (optionnel)</label>
                  <input type="text" value={notesR} onChange={e => setNotesR(e.target.value)}
                    placeholder="ex: Virement prévu le..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                </div>

                <button onClick={handleCloture} disabled={!valeur || !siteNom}
                  className="w-full py-3 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors disabled:opacity-40">
                  Confirmer la clôture
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
