"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, Facture, LigneFacture } from "@/lib/supabase";
import { Plus, Trash2, X, FileText, Check, Send, Eye, TrendingUp, Clock, ArrowRight, BookOpen, ChevronRight, Settings, Upload, Download, Edit2, MessageCircle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import DocumentPreview from "./DocumentPreview";
import CatalogModal from "./CatalogModal";

// Date locale au format YYYY-MM-DD (évite le décalage UTC)
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type PersoModel = { inclus: string[]; non_inclus: string[]; conditions: string };

function buildPersoText(inclus: string[], non_inclus: string[], conditions: string): string {
  const parts: string[] = [];
  if (inclus.length > 0) parts.push("✅ INCLUS\n" + inclus.map(x => `• ${x}`).join("\n"));
  if (non_inclus.length > 0) parts.push("❌ NON INCLUS\n" + non_inclus.map(x => `• ${x}`).join("\n"));
  if (conditions.trim()) parts.push(conditions.trim());
  return parts.join("\n\n");
}

const MODELE_STANDARD_DEFAULT = `✅ INCLUS
• Hébergement selon formule choisie (sauf formule Journée uniquement)
• Repas selon formule choisie

❌ NON INCLUS
• Soft Drinks / Boissons alcoolisées / Dépenses personnelles
• Toutes choses non mentionnées ci-dessus
• Assurance voyage

📍 INFORMATIONS LOGISTIQUES
• Rendez-vous : Gabode 5, Zone Stid — Djibouti-Ville
• Heure de départ : 7h00 (sauf indication contraire)
• À prévoir : chapeau, crème solaire, eau, chaussures adaptées

🚫 CONDITIONS D'ANNULATION
• Annulation gratuite jusqu'à 72h avant le départ
• Entre 72h et 24h avant le départ : 50% du montant retenu
• Moins de 24h ou non-présentation : 100% du montant dû

💳 MODALITÉS DE PAIEMENT
• Paiement en espèces uniquement (FDJ)
• Totalité du montant requise 5 jours avant la sortie`;

const PERSO_DEFAULT_INCLUS = [
  "Hébergement selon formule choisie (sauf formule Journée uniquement)",
  "Petit-déjeuner et dîner (déjeuner inclus selon formule choisie)",
];
const PERSO_DEFAULT_NON_INCLUS = [
  "Boissons et dépenses personnelles",
  "Visite Mangrove (Godoria uniquement — 2 000 FDJ/adulte · 1 000 FDJ/enfant)",
  "Activités nautiques : snorkeling, plongée (Hougeif et Sables Blancs uniquement)",
  "Assurance voyage",
];
const PERSO_DEFAULT_CONDITIONS = `💳 MODALITÉS DE PAIEMENT
• Paiement en espèces uniquement (FDJ)
• Acompte de 50% requis pour confirmer la réservation
• Solde à régler avant le départ

🚫 CONDITIONS D'ANNULATION
• Annulation gratuite jusqu'à 72h avant le départ
• Entre 72h et 24h avant le départ : 50% du montant retenu
• Moins de 24h avant le départ : 100% du montant retenu

📍 INFORMATIONS LOGISTIQUES
• Rendez-vous : Gabode 5, Zone Stid — Djibouti-Ville
• Heure de départ : 7h00 (sauf indication contraire)
• À prévoir : chapeau, crème solaire, eau, chaussures adaptées`;

const statutConfig = {
  brouillon:      { label: "Brouillon",      bg: "bg-gray-100",    text: "text-gray-500",    dot: "bg-gray-400" },
  envoyé:         { label: "Envoyé",         bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500" },
  accepté:        { label: "Accepté ✓",      bg: "bg-emerald-50",  text: "text-emerald-600", dot: "bg-emerald-500" },
  en_negociation: { label: "En discussion",  bg: "bg-amber-50",    text: "text-amber-600",   dot: "bg-amber-400" },
  confirmé:       { label: "Confirmé",       bg: "bg-purple-50",   text: "text-purple-600",  dot: "bg-purple-500" },
  payé:           { label: "Payé",           bg: "bg-teal-50",     text: "text-teal-600",    dot: "bg-teal-500" },
};

const emptyLigne: LigneFacture = { description: "", quantite: 1, prix_unitaire: 0, total: 0 };

function generateNumero(factures: Facture[], type: "facture" | "devis") {
  const year = new Date().getFullYear();
  const prefix = type === "devis" ? "DEV" : "FAC";
  const existing = factures.filter(f => f.numero.startsWith(`${prefix}-${year}-`));
  const next = (existing.length + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${next}`;
}

export default function FacturesSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"facture" | "devis">("facture");
  const [selected, setSelected] = useState<Facture | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Facture | null>(null);
  const [filterType, setFilterType] = useState<"all" | "facture" | "devis">("all");
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Facture | null>(null);
  const [sendingMsg, setSendingMsg] = useState<string | null>(null);
  const [msgPreview, setMsgPreview] = useState<{ doc: Facture; type: "payment_confirmation" | "return_message"; text: string; whatsappNumber: string | null } | null>(null);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState<{ ok: number; errors: string[] } | null>(null);

  // Modèles de notes
  const [modeles, setModeles] = useState({
    standard: MODELE_STANDARD_DEFAULT,
    personnalise: buildPersoText(PERSO_DEFAULT_INCLUS, PERSO_DEFAULT_NON_INCLUS, PERSO_DEFAULT_CONDITIONS),
    personnaliseData: { inclus: PERSO_DEFAULT_INCLUS, non_inclus: PERSO_DEFAULT_NON_INCLUS, conditions: PERSO_DEFAULT_CONDITIONS } as PersoModel,
  });
  const [showModelEditor, setShowModelEditor] = useState(false);
  const [editTab, setEditTab] = useState<"standard" | "personnalise">("standard");
  const [editStandard, setEditStandard] = useState("");
  const [editPerso, setEditPerso] = useState<PersoModel>({ inclus: [], non_inclus: [], conditions: "" });

  const [form, setForm] = useState({
    client_id: "",
    client_nom: "",
    client_email: "",
    date: localDateStr(),
    date_depart: "",
    date_retour: "",
    echeance: "",
    notes: "",
    lignes: [{ ...emptyLigne }] as LigneFacture[],
  });

  useEffect(() => {
    loadData(true);
    loadModeles();
    const channel = supabase
      .channel("factures-section")
      .on("postgres_changes", { event: "*", schema: "public", table: "factures" }, () => { loadData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async (initial = false) => {
    if (initial) setLoading(true);
    const [{ data: f }, { data: c }] = await Promise.all([
      supabase.from("factures").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("nom"),
    ]);
    setFactures(f || []);
    setClients(c || []);
    if (initial) setLoading(false);
  };

  const downloadTemplate = async () => {
    const headers = [
      "type", "numero", "client_nom", "client_email",
      "date", "date_depart", "date_retour", "echeance", "statut", "notes",
      "description_1", "quantite_1", "prix_1",
      "description_2", "quantite_2", "prix_2",
      "description_3", "quantite_3", "prix_3",
      "description_4", "quantite_4", "prix_4",
      "description_5", "quantite_5", "prix_5",
    ];
    const example = [
      "facture", "FAC-2024-001", "Ahmed Hassan", "ahmed@email.com",
      "15/01/2024", "20/01/2024", "22/01/2024", "", "payé",
      "Hébergement inclus, petit-déjeuner compris",
      "Nuitée Lac Abbé — 2 adultes", "1", "54000",
      "Transport aller-retour", "1", "15000",
      "", "", "", "", "", "", "", "", "",
    ];
    const example2 = [
      "devis", "", "Fatima Ali", "fatima@email.com",
      "10/03/2024", "15/03/2024", "17/03/2024", "30/03/2024", "envoyé", "",
      "Excursion Hougeif — 2 adultes 1 enfant", "1", "45000",
      "Snorkeling", "2", "5000",
      "", "", "", "", "", "", "", "", "",
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example, example2]);
    ws["!cols"] = headers.map((h, i) => ({
      wch: i < 10 ? (h === "notes" ? 40 : 18) : (i % 3 === 0 ? 30 : 8),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Factures & Devis");
    XLSX.writeFile(wb, "modele_import_voyagevoyage.xlsx");
    toast.success("Modèle téléchargé ✓");
  };

  const parseDate = (val: string | number | undefined): string | null => {
    if (!val) return null;
    if (typeof val === "number") {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      return localDateStr(d);
    }
    const s = String(val).trim();
    const [a, b, c] = s.split(/[\/\-]/);
    if (!a || !b || !c) return null;
    if (c.length === 4) return `${c}-${b.padStart(2,"0")}-${a.padStart(2,"0")}`;
    return `${a}-${b.padStart(2,"0")}-${c.padStart(2,"0")}`;
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResults(null);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, { defval: "" });

      let ok = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        const type = String(row["type"] || "").toLowerCase().trim();
        const client_nom = String(row["client_nom"] || "").trim();

        if (!type || !["facture", "devis"].includes(type)) {
          errors.push(`Ligne ${rowNum} : type invalide (doit être "facture" ou "devis")`);
          continue;
        }
        if (!client_nom) {
          errors.push(`Ligne ${rowNum} : client_nom manquant`);
          continue;
        }

        const lignes: LigneFacture[] = [];
        for (let n = 1; n <= 5; n++) {
          const desc = String(row[`description_${n}`] || "").trim();
          if (!desc) continue;
          const qte = Number(row[`quantite_${n}`]) || 1;
          const prix = Number(row[`prix_${n}`]) || 0;
          lignes.push({ description: desc, quantite: qte, prix_unitaire: prix, total: qte * prix });
        }
        if (lignes.length === 0) {
          errors.push(`Ligne ${rowNum} : aucune prestation trouvée`);
          continue;
        }

        const total = lignes.reduce((s, l) => s + l.total, 0);
        const rawNumero = String(row["numero"] || "").trim();
        const numero = rawNumero || generateNumero([...factures, ...Array(ok).fill({ numero: `TMP-${ok}` }) as Facture[]], type as "facture" | "devis");
        const statut = String(row["statut"] || "brouillon").trim() as Facture["statut"];
        const validStatuts = ["brouillon","envoyé","accepté","en_negociation","confirmé","payé"];

        const { error } = await supabase.from("factures").insert({
          numero,
          type,
          client_nom,
          client_email: String(row["client_email"] || "").trim(),
          date: parseDate(row["date"] as string) || localDateStr(),
          date_depart: parseDate(row["date_depart"] as string),
          date_retour: parseDate(row["date_retour"] as string),
          echeance: parseDate(row["echeance"] as string),
          statut: validStatuts.includes(statut) ? statut : "brouillon",
          lignes,
          total,
          notes: String(row["notes"] || "").trim(),
          token: crypto.randomUUID(),
        });

        if (error) {
          errors.push(`Ligne ${rowNum} (${client_nom}) : ${error.message}`);
        } else {
          ok++;
        }
      }

      setImportResults({ ok, errors });
      if (ok > 0) {
        toast.success(`${ok} document${ok > 1 ? "s" : ""} importé${ok > 1 ? "s" : ""} ✓`);
        loadData();
      }
    } catch (e) {
      toast.error("Erreur de lecture du fichier Excel");
    } finally {
      setImporting(false);
    }
  };

  const loadModeles = async () => {
    const { data } = await supabase.from("document_modeles").select("*");
    if (!data || data.length === 0) return;
    const std = data.find((d: { type: string; contenu: string }) => d.type === "standard");
    const perso = data.find((d: { type: string; contenu: string }) => d.type === "personnalise");
    setModeles(prev => {
      const next = { ...prev };
      if (std) next.standard = std.contenu;
      if (perso) {
        try {
          const parsed: PersoModel = JSON.parse(perso.contenu);
          next.personnaliseData = parsed;
          next.personnalise = buildPersoText(parsed.inclus, parsed.non_inclus, parsed.conditions);
        } catch {
          next.personnalise = perso.contenu;
        }
      }
      return next;
    });
  };

  const openModelEditor = () => {
    setEditStandard(modeles.standard);
    setEditPerso({ ...modeles.personnaliseData });
    setEditTab("standard");
    setShowModelEditor(true);
  };

  const saveModeles = async () => {
    const persoText = buildPersoText(editPerso.inclus, editPerso.non_inclus, editPerso.conditions);
    const persoJson = JSON.stringify(editPerso);
    await Promise.all([
      supabase.from("document_modeles").upsert({ type: "standard", contenu: editStandard, updated_at: new Date().toISOString() }, { onConflict: "type" }),
      supabase.from("document_modeles").upsert({ type: "personnalise", contenu: persoJson, updated_at: new Date().toISOString() }, { onConflict: "type" }),
    ]);
    setModeles({ standard: editStandard, personnalise: persoText, personnaliseData: editPerso });
    setShowModelEditor(false);
    toast.success("Modèles enregistrés ✓");
  };

  const openForm = (type: "facture" | "devis") => {
    setEditingDoc(null);
    setFormType(type);
    setForm({ client_id: "", client_nom: "", client_email: "", date: localDateStr(), date_depart: "", date_retour: "", echeance: "", notes: "", lignes: [{ ...emptyLigne }] });
    setShowForm(true);
  };

  const openEdit = (doc: Facture) => {
    setEditingDoc(doc);
    setFormType(doc.type);
    setForm({
      client_id: doc.client_id || "",
      client_nom: doc.client_nom,
      client_email: doc.client_email || "",
      date: doc.date,
      date_depart: doc.date_depart || "",
      date_retour: doc.date_retour || "",
      echeance: doc.echeance || "",
      notes: doc.notes || "",
      lignes: doc.lignes.length > 0 ? doc.lignes : [{ ...emptyLigne }],
    });
    setSelected(null);
    setShowForm(true);
  };

  const totalLignes = (lignes: LigneFacture[]) =>
    lignes.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0);

  const updateLigne = (i: number, field: keyof LigneFacture, value: string | number) => {
    const newLignes = [...form.lignes];
    newLignes[i] = { ...newLignes[i], [field]: value };
    newLignes[i].total = newLignes[i].quantite * newLignes[i].prix_unitaire;
    setForm({ ...form, lignes: newLignes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_nom) { toast.error("Sélectionnez ou entrez un client"); return; }
    const lignesValides = form.lignes.filter(l => l.description.trim());
    if (lignesValides.length === 0) { toast.error("Ajoutez au moins une prestation"); return; }
    const total = totalLignes(lignesValides);

    if (editingDoc) {
      // Modification d'un document existant
      const { error } = await supabase.from("factures").update({
        client_id: form.client_id || null,
        client_nom: form.client_nom, client_email: form.client_email,
        date: form.date, echeance: form.echeance || null,
        lignes: lignesValides, total, notes: form.notes,
        date_depart: form.date_depart || null,
        date_retour: form.date_retour || null,
      }).eq("id", editingDoc.id);
      if (error) { toast.error("Erreur lors de la modification"); return; }
      toast.success(`${formType === "devis" ? "Devis" : "Facture"} ${editingDoc.numero} modifié(e) ✓`);
    } else {
      // Création d'un nouveau document
      const numero = generateNumero(factures, formType);
      const token = crypto.randomUUID();
      const { error } = await supabase.from("factures").insert({
        numero, type: formType,
        client_id: form.client_id || null,
        client_nom: form.client_nom, client_email: form.client_email,
        date: form.date, echeance: form.echeance || null,
        statut: "brouillon", lignes: lignesValides, total, notes: form.notes,
        date_depart: form.date_depart || null,
        date_retour: form.date_retour || null,
        token,
      });
      if (error) { toast.error("Erreur lors de la création"); return; }
      toast.success(`${formType === "devis" ? "Devis" : "Facture"} ${numero} créé(e)`);
    }
    setShowForm(false);
    setEditingDoc(null);
    loadData();
  };

  const changeStatut = async (id: string, statut: Facture["statut"]) => {
    const update: Record<string, unknown> = { statut };
    if (statut === "payé") update.date_paiement = localDateStr();
    await supabase.from("factures").update(update).eq("id", id);
    toast.success(`Statut mis à jour : ${statutConfig[statut].label}`);
    loadData();
    if (selected?.id === id) setSelected({ ...selected, statut });
  };

  const convertirEnFacture = async (doc: Facture) => {
    const numero = generateNumero(factures, "facture");
    const token = crypto.randomUUID();
    const { error } = await supabase.from("factures").insert({
      numero,
      type: "facture",
      client_id: doc.client_id || null,
      client_nom: doc.client_nom,
      client_email: doc.client_email,
      date: localDateStr(),
      echeance: null,
      statut: "confirmé",
      lignes: doc.lignes,
      total: doc.total,
      notes: doc.notes,
      token,
      signature_client: doc.signature_client || null,
      date_signature: doc.date_signature || null,
    });
    if (error) { toast.error("Erreur lors de la conversion"); return; }
    toast.success(`Facture ${numero} créée depuis le devis ${doc.numero} ✓`);
    setSelected(null);
    loadData();
  };

  const deleteFacture = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    await supabase.from("factures").delete().eq("id", id);
    toast.success("Document supprimé");
    setSelected(null);
    loadData();
  };

  const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} DJF`;
  const fmtDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("fr-FR");
  };
  const filtered = factures.filter(f => filterType === "all" || f.type === filterType);

  // Stats
  const totalFactures = factures.filter(f => f.type === "facture").length;
  const totalDevis = factures.filter(f => f.type === "devis").length;
  const totalPaye = factures.filter(f => f.statut === "payé").reduce((s, f) => s + f.total, 0);
  const totalEnAttente = factures.filter(f => f.statut !== "payé").reduce((s, f) => s + f.total, 0);

  // Detail panel inner content — shared between bottom sheet and desktop side panel
  const fmtDateMsg = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  };
  const fmtMoneyMsg = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;

  const buildDefaultText = (doc: Facture, type: "payment_confirmation" | "return_message"): string => {
    const firstName = doc.client_nom?.split(" ")[0] || doc.client_nom;
    if (type === "payment_confirmation") {
      let text = `Bonjour ${firstName} 👋\n\nNous avons bien reçu votre paiement de *${fmtMoneyMsg(doc.total)}* pour la facture *${doc.numero}*. Votre voyage est confirmé ! 🎉`;
      if (doc.date_depart) text += `\n\n📅 Départ : ${fmtDateMsg(doc.date_depart)}`;
      if (doc.date_retour) text += `\n📅 Retour : ${fmtDateMsg(doc.date_retour)}`;
      text += `\n\nMerci de votre confiance. Nous vous contacterons bientôt pour les derniers détails.\n\n🎁 Parrainez un proche et bénéficiez de 5% de réduction sur votre prochain voyage !\n\nL'équipe *Voyage Voyage* 🌍\n📞 +253 77 07 33 77`;
      return text;
    } else {
      return `Bonjour ${firstName} 👋\n\nNous espérons que votre voyage s'est passé à merveille ! 🌟\n\nVotre avis nous tient à cœur et aide d'autres voyageurs à découvrir Djibouti. Si vous avez quelques minutes, partagez votre expérience ici :\n👉 https://voyagevoyagedj.com/#avis\n\n🔁 Votre prochaine aventure vous attend ! Contactez-nous pour découvrir nos nouvelles offres.\n📸 Partagez vos plus belles photos avec *#VoyageVoyageDjibouti*\n\nMerci infiniment pour votre confiance !\n\n*L'équipe Voyage Voyage* 🌍\n📞 +253 77 07 33 77`;
    }
  };

  const openMsgPreview = async (doc: Facture, type: "payment_confirmation" | "return_message") => {
    let whatsappNumber: string | null = null;
    if (doc.client_id) {
      const { data } = await supabase.from("clients").select("whatsapp, telephone").eq("id", doc.client_id).single();
      whatsappNumber = data?.whatsapp || data?.telephone || null;
    }
    setMsgPreview({ doc, type, text: buildDefaultText(doc, type), whatsappNumber });
  };

  const confirmSendMessage = async () => {
    if (!msgPreview) return;
    const { doc, type, text, whatsappNumber } = msgPreview;
    setSendingMsg(type);
    try {
      const res = await fetch("/api/send-client-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, doc, clientWhatsapp: whatsappNumber, customMessage: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.emailSent) toast.success(`Email envoyé à ${doc.client_email} ✓`);
      else if (!doc.client_email) toast("Aucun email — WhatsApp uniquement", { icon: "ℹ️" });
      const number = (whatsappNumber || "").replace(/\D/g, "");
      const url = number
        ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      setMsgPreview(null);
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    }
    setSendingMsg(null);
  };

  const DetailPanelContent = ({ doc }: { doc: Facture }) => (
    <>
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${doc.type === "devis" ? "bg-amber-100 text-amber-600" : "bg-[#408398]/10 text-[#408398]"}`}>
              {doc.type === "devis" ? "DEVIS" : "FACTURE"}
            </span>
            <span className="text-sm font-bold text-gray-900">{doc.numero}</span>
          </div>
          <p className="text-xs text-gray-400">{doc.client_nom}</p>
        </div>
        <button onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Statut */}
        {(() => {
          const nextDevis: Record<string, Facture["statut"] | null> = {
            brouillon: "envoyé", envoyé: "accepté", accepté: null,
            en_negociation: "accepté", confirmé: null, payé: null,
          };
          const nextFacture: Record<string, Facture["statut"] | null> = {
            brouillon: "confirmé", envoyé: "confirmé", en_negociation: "confirmé",
            accepté: "confirmé", confirmé: "payé", payé: null,
          };
          const nextStatut = doc.type === "devis" ? nextDevis[doc.statut] : nextFacture[doc.statut];
          const nextCfg = nextStatut ? statutConfig[nextStatut] : null;
          const currCfg = statutConfig[doc.statut as keyof typeof statutConfig] || statutConfig.brouillon;

          const nextBtnColor: Record<string, string> = {
            envoyé:   "bg-blue-500 hover:bg-blue-600",
            accepté:  "bg-emerald-500 hover:bg-emerald-600",
            confirmé: "bg-purple-500 hover:bg-purple-600",
            payé:     "bg-teal-500 hover:bg-teal-600",
          };

          return (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Statut</p>
              {/* Badge statut actuel */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold mb-3 ${currCfg.bg} ${currCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currCfg.dot}`} />
                {currCfg.label}
              </div>
              {/* Bouton étape suivante */}
              {nextStatut && nextCfg && (
                <button
                  onClick={() => changeStatut(doc.id, nextStatut)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${nextBtnColor[nextStatut]}`}
                >
                  <ChevronRight size={13} />
                  Marquer comme {nextCfg.label}
                </button>
              )}
              {!nextStatut && doc.type === "facture" && (
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-teal-600">
                  <Check size={13} /> Dossier clôturé
                </div>
              )}
            </div>
          );
        })()}

        {/* Infos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Client</p>
            <p className="text-xs font-semibold text-gray-900">{doc.client_nom}</p>
            {doc.client_email && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{doc.client_email}</p>}
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Date</p>
            <p className="text-xs font-semibold text-gray-900">{fmtDate(doc.date)}</p>
            {doc.echeance && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                {doc.type === "devis" ? "Valide jusqu'au" : "Éch."} {fmtDate(doc.echeance)}
              </p>
            )}
          </div>
        </div>

        {/* Lignes */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Prestations</p>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            {doc.lignes.map((l, i) => (
              <div key={i} className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-50 last:border-0 bg-white hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 truncate">{l.description}</p>
                  <p className="text-[10px] text-gray-400">×{l.quantite} · {fmt(l.prix_unitaire)}</p>
                </div>
                <p className="text-xs font-bold text-gray-900 ml-3 shrink-0">{fmt(l.quantite * l.prix_unitaire)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between px-3.5 py-3 bg-[#0e2d38]">
              <span className="text-xs font-bold text-white/70">Total TTC</span>
              <span className="text-sm font-bold text-white">{fmt(doc.total)}</span>
            </div>
          </div>
        </div>

        {doc.notes && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Notes</p>
            <p className="text-xs text-gray-600 leading-relaxed">{doc.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {doc.type === "devis" && doc.statut === "accepté" && (
            <button onClick={() => convertirEnFacture(doc)}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors">
              <ArrowRight size={13} /> Convertir en facture
            </button>
          )}
          <button onClick={() => { setPreviewDoc(doc); setSelected(null); }}
            className="flex items-center justify-center gap-2 py-2.5 bg-[#408398] text-white rounded-xl text-xs font-semibold hover:bg-[#326e80] transition-colors">
            <Eye size={13} /> Aperçu & Envoi
          </button>
          {doc.type === "facture" && doc.statut === "payé" && (
            <button
              onClick={() => openMsgPreview(doc, "payment_confirmation")}
              disabled={sendingMsg === "payment_confirmation"}
              className="flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60"
            >
              {sendingMsg === "payment_confirmation"
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={13} />}
              Confirmation paiement
            </button>
          )}
          {doc.type === "facture" && doc.date_retour && (
            <button
              onClick={() => openMsgPreview(doc, "return_message")}
              disabled={sendingMsg === "return_message"}
              className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {sendingMsg === "return_message"
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Star size={13} />}
              Message retour + Avis
            </button>
          )}
          <button onClick={() => openEdit(doc)}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
            <Edit2 size={13} /> Modifier le document
          </button>
          <button onClick={() => deleteFacture(doc.id)}
            className="flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-400 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors">
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex gap-0 h-full">
      {/* Left: main list */}
      <div className={`flex-1 min-w-0 flex flex-col gap-5 transition-all ${selected ? "pr-0" : ""}`}>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Documents", value: factures.length, icon: FileText, color: "text-[#408398]", bg: "bg-[#408398]/8" },
            { label: "En attente", value: fmt(totalEnAttente), icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Encaissé", value: fmt(totalPaye), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Devis actifs", value: totalDevis, icon: Send, color: "text-purple-500", bg: "bg-purple-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
            {([["all", "Tous"], ["facture", "Factures"], ["devis", "Devis"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFilterType(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === v ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto flex-wrap">
            <button onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
              <Upload size={13} /> <span className="hidden sm:inline">Importer Excel</span><span className="sm:hidden">Import</span>
            </button>
            <button onClick={() => openForm("devis")}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors">
              <Plus size={13} /> <span className="hidden sm:inline">Nouveau devis</span><span className="sm:hidden">Devis</span>
            </button>
            <button onClick={() => openForm("facture")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0e2d38] text-white rounded-xl text-xs font-semibold hover:bg-[#1a3f50] transition-colors">
              <Plus size={13} /> <span className="hidden sm:inline">Nouvelle facture</span><span className="sm:hidden">Facture</span>
            </button>
          </div>
        </div>

        {/* Table / Card list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Desktop table header — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 px-5 py-2.5 border-b border-gray-50 bg-gray-50/60">
            <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">N° Document</span>
            <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</span>
            <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</span>
            <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</span>
            <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={28} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">Aucun document</p>
              <p className="text-xs text-gray-300 mt-1">Créez un devis ou une facture pour commencer</p>
            </div>
          ) : filtered.map((f) => {
            const s = statutConfig[f.statut as keyof typeof statutConfig] || statutConfig.brouillon;
            const isDevis = f.type === "devis";
            const isActive = selected?.id === f.id;
            return (
              <div key={f.id}>
                {/* Mobile card — hidden on sm+ */}
                <div
                  onClick={() => setSelected(isActive ? null : f)}
                  className={`sm:hidden px-4 py-3.5 cursor-pointer border-b border-gray-50 last:border-0 transition-all
                    ${isActive ? "bg-[#408398]/5 border-l-2 border-l-[#408398]" : "hover:bg-gray-50/70"}`}
                >
                  {/* Row 1: icon + numero + type badge | total */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDevis ? "bg-amber-50" : "bg-[#408398]/8"}`}>
                        <FileText size={12} className={isDevis ? "text-amber-500" : "text-[#408398]"} />
                      </div>
                      <span className="text-xs font-bold text-gray-900">{f.numero}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDevis ? "bg-amber-100 text-amber-600" : "bg-[#408398]/10 text-[#408398]"}`}>
                        {isDevis ? "DEVIS" : "FACTURE"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{fmt(f.total)}</span>
                  </div>
                  {/* Row 2: client name | statut badge */}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[55%]">{f.client_nom}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                  {/* Row 3: date | eye icon */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">{fmtDate(f.date)}</p>
                    <button
                      onClick={e => { e.stopPropagation(); setPreviewDoc(f); }}
                      className="p-1.5 text-gray-400 hover:text-[#408398] hover:bg-[#408398]/10 rounded-lg transition-all"
                    >
                      <Eye size={13} />
                    </button>
                  </div>
                </div>

                {/* Desktop table row — hidden on mobile */}
                <div
                  onClick={() => setSelected(isActive ? null : f)}
                  className={`hidden sm:grid grid-cols-12 items-center px-5 py-3.5 cursor-pointer transition-all border-b border-gray-50 last:border-0 group
                    ${isActive ? "bg-[#408398]/5 border-l-2 border-l-[#408398]" : "hover:bg-gray-50/70"}`}
                >
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDevis ? "bg-amber-50" : "bg-[#408398]/8"}`}>
                      <FileText size={12} className={isDevis ? "text-amber-500" : "text-[#408398]"} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{f.numero}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDevis ? "bg-amber-100 text-amber-600" : "bg-[#408398]/10 text-[#408398]"}`}>
                        {isDevis ? "DEVIS" : "FACTURE"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs font-semibold text-gray-800 truncate">{f.client_nom}</p>
                    {f.client_email && <p className="text-[10px] text-gray-400 truncate">{f.client_email}</p>}
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">{fmtDate(f.date)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <p className="text-xs font-bold text-gray-900">{fmt(f.total)}</p>
                    <button onClick={e => { e.stopPropagation(); setPreviewDoc(f); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#408398] hover:bg-[#408398]/10 rounded-lg transition-all">
                      <Eye size={13} />
                    </button>
                    <ArrowRight size={13} className={`transition-colors ${isActive ? "text-[#408398]" : "text-gray-200 group-hover:text-gray-400"}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop detail panel — inline side panel, hidden on mobile */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 340 }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className="hidden sm:block shrink-0 overflow-hidden"
          >
            <div className="w-[340px] ml-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit sticky top-0">
              <div className="overflow-y-auto">
                <DetailPanelContent doc={selected} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet detail panel */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelected(null)}
            />
            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <DetailPanelContent doc={selected} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
              <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[92vh] overflow-y-auto">

                {/* Modal header */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formType === "devis" ? "bg-amber-100" : "bg-[#408398]/10"}`}>
                      <FileText size={14} className={formType === "devis" ? "text-amber-600" : "text-[#408398]"} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {editingDoc
                          ? `Modifier — ${editingDoc.numero}`
                          : formType === "devis" ? "Nouveau devis" : "Nouvelle facture"}
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        {editingDoc ? "Modifiez les informations ci-dessous" : "Remplissez les informations ci-dessous"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                  {/* Client */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Client *</label>
                    {clients.length > 0 && (
                      <select value={form.client_id}
                        onChange={e => {
                          const c = clients.find(c => c.id === e.target.value);
                          setForm({ ...form, client_id: e.target.value, client_nom: c?.nom || "", client_email: c?.email || "" });
                        }}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] bg-white">
                        <option value="">Sélectionner un client existant...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.nom}{c.email ? ` — ${c.email}` : ""}</option>)}
                      </select>
                    )}
                    <div className="grid grid-cols-2 gap-2.5">
                      <input value={form.client_nom} onChange={e => setForm({ ...form, client_nom: e.target.value })}
                        placeholder="Nom du client *"
                        className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                      <input type="email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })}
                        placeholder="Email client"
                        className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Date d&apos;émission</label>
                      <input type="date" value={form.date} readOnly
                        className="w-full px-3.5 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-500 bg-gray-50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        {formType === "devis" ? "Validité jusqu'au" : "Échéance"}
                      </label>
                      <input type="date" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398]" />
                    </div>
                  </div>

                  {/* Dates départ / retour */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        📅 Date de départ
                      </label>
                      <input type="date" value={form.date_depart} onChange={e => setForm({ ...form, date_depart: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-[#408398]/40 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] bg-[#408398]/5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        🔙 Date de retour
                      </label>
                      <input type="date" value={form.date_retour} onChange={e => setForm({ ...form, date_retour: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-[#408398]/40 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] bg-[#408398]/5" />
                    </div>
                  </div>

                  {/* Lignes */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Prestations *</label>
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-12 gap-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="col-span-6 text-[10px] font-semibold text-gray-400">Description</span>
                        <span className="col-span-2 text-[10px] font-semibold text-gray-400 text-center">Qté</span>
                        <span className="col-span-3 text-[10px] font-semibold text-gray-400 text-right">Prix (DJF)</span>
                      </div>
                      {form.lignes.map((ligne, i) => (
                        <div key={i} className="grid grid-cols-12 gap-0 items-center border-b border-gray-100 last:border-0">
                          <input value={ligne.description} onChange={e => updateLigne(i, "description", e.target.value)}
                            placeholder="Ex: Safari Lac Assal"
                            className="col-span-6 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:bg-blue-50/30 border-r border-gray-100 bg-white" />
                          <input type="number" min="1" value={ligne.quantite} onChange={e => updateLigne(i, "quantite", Number(e.target.value))}
                            className="col-span-2 px-2 py-2.5 text-sm text-gray-900 focus:outline-none focus:bg-blue-50/30 text-center border-r border-gray-100 bg-white" />
                          <input type="number" min="0" value={ligne.prix_unitaire} onChange={e => updateLigne(i, "prix_unitaire", Number(e.target.value))}
                            placeholder="0"
                            className="col-span-3 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:bg-blue-50/30 text-right border-r border-gray-100 bg-white" />
                          <button type="button" onClick={() => form.lignes.length > 1 && setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) })}
                            className="col-span-1 flex items-center justify-center py-2.5 text-gray-300 hover:text-red-400 transition-colors bg-white">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button type="button" onClick={() => setForm({ ...form, lignes: [...form.lignes, { ...emptyLigne }] })}
                        className="flex items-center gap-1 text-xs text-[#408398] font-medium hover:underline">
                        <Plus size={11} /> Ajouter une ligne
                      </button>
                      <button type="button" onClick={() => setShowCatalog(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors">
                        <BookOpen size={11} /> Catalogue des tarifs
                      </button>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <div className="bg-[#0e2d38] rounded-xl px-4 py-2.5 flex items-center gap-6">
                        <span className="text-xs text-white/60">Total TTC</span>
                        <span className="text-base font-bold text-white">{fmt(totalLignes(form.lignes))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Notes / Conditions</label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button type="button" onClick={() => setForm({ ...form, notes: modeles.standard })}
                          className="text-[10px] font-semibold text-[#408398] bg-[#408398]/10 hover:bg-[#408398]/20 px-2.5 py-1 rounded-lg transition-colors">
                          Standard
                        </button>
                        <button type="button" onClick={() => setForm({ ...form, notes: modeles.personnalise })}
                          className="text-[10px] font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors">
                          Personnalisé
                        </button>
                        <button type="button" onClick={openModelEditor}
                          title="Modifier les modèles"
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Settings size={11} />
                        </button>
                        <button type="button" onClick={() => setForm({ ...form, notes: "" })}
                          className="text-[10px] font-semibold text-gray-400 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors">
                          Vider
                        </button>
                      </div>
                    </div>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={5}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] resize-none font-mono"
                      placeholder="Laisser vide ou choisir un modèle..." />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Annuler
                    </button>
                    <button type="submit"
                      className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors ${formType === "devis" ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0e2d38] hover:bg-[#1a3f50]"}`}>
                      {editingDoc ? "Enregistrer les modifications" : `Créer ${formType === "devis" ? "le devis" : "la facture"}`}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Document Preview */}
      <AnimatePresence>
        {previewDoc && (
          <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />
        )}
      </AnimatePresence>

      {/* Catalog Modal */}
      <AnimatePresence>
        {showCatalog && (
          <CatalogModal
            onAdd={(lignes) => {
              setForm(f => ({ ...f, lignes: [...f.lignes.filter(l => l.description.trim() !== ""), ...lignes] }));
              setShowCatalog(false);
              toast.success(`${lignes.length} ligne${lignes.length > 1 ? "s" : ""} ajoutée${lignes.length > 1 ? "s" : ""}`);
            }}
            onClose={() => setShowCatalog(false)}
          />
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => { setShowImportModal(false); setImportResults(null); }} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
              <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg">

                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Upload size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Importer des factures / devis</h3>
                      <p className="text-[10px] text-gray-400">Fichier Excel (.xlsx) selon le modèle fourni</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowImportModal(false); setImportResults(null); }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Step 1 — Download template */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-700 mb-1">Étape 1 — Télécharger le modèle</p>
                    <p className="text-[11px] text-blue-600 mb-3">Remplissez ce fichier Excel avec vos anciennes factures et devis, puis importez-le.</p>
                    <button onClick={downloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                      <Download size={13} /> Télécharger le modèle Excel
                    </button>
                  </div>

                  {/* Step 2 — Import file */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-700 mb-1">Étape 2 — Importer le fichier rempli</p>
                    <p className="text-[11px] text-gray-500 mb-3">Sélectionnez votre fichier Excel (.xlsx) complété.</p>
                    <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-xs font-semibold transition-colors cursor-pointer
                      ${importing ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"}`}>
                      {importing ? (
                        <><div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /> Importation en cours...</>
                      ) : (
                        <><Upload size={14} /> Choisir le fichier Excel</>
                      )}
                      <input type="file" accept=".xlsx,.xls" className="hidden" disabled={importing}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }} />
                    </label>
                  </div>

                  {/* Results */}
                  {importResults && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border overflow-hidden">
                      <div className={`px-4 py-3 flex items-center gap-2 ${importResults.ok > 0 ? "bg-emerald-50" : "bg-gray-50"}`}>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-700">
                          {importResults.ok} document{importResults.ok > 1 ? "s" : ""} importé{importResults.ok > 1 ? "s" : ""} avec succès
                        </span>
                      </div>
                      {importResults.errors.length > 0 && (
                        <div className="px-4 py-3 bg-red-50">
                          <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Lignes ignorées ({importResults.errors.length})</p>
                          <ul className="space-y-1">
                            {importResults.errors.map((e, i) => (
                              <li key={i} className="text-[11px] text-red-500">{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Format hint */}
                  <div className="text-[10px] text-gray-400 space-y-0.5">
                    <p className="font-semibold text-gray-500">Format des dates :</p>
                    <p>• DD/MM/AAAA (ex: 15/01/2024) ou AAAA-MM-JJ (ex: 2024-01-15)</p>
                    <p className="font-semibold text-gray-500 mt-1">Valeurs valides pour "statut" :</p>
                    <p>• brouillon · envoyé · accepté · confirmé · payé</p>
                    <p className="font-semibold text-gray-500 mt-1">Valeurs valides pour "type" :</p>
                    <p>• facture · devis</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Model Editor Modal */}
      <AnimatePresence>
        {showModelEditor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowModelEditor(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
              <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Settings size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Modifier les modèles</h3>
                      <p className="text-[10px] text-gray-400">Les modifications s&apos;appliquent immédiatement après enregistrement</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModelEditor(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 flex gap-1 bg-white border-b border-gray-100">
                  {([["standard", "Modèle Standard"], ["personnalise", "Modèle Personnalisé"]] as const).map(([tab, label]) => (
                    <button key={tab} onClick={() => setEditTab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${editTab === tab ? (tab === "personnalise" ? "text-purple-600 border-purple-500 bg-purple-50/50" : "text-[#408398] border-[#408398] bg-[#408398]/5") : "text-gray-400 border-transparent hover:text-gray-600"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="px-6 py-5 space-y-4">
                  {editTab === "standard" ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Contenu du modèle standard</p>
                      <textarea value={editStandard} onChange={e => setEditStandard(e.target.value)} rows={14}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] resize-none font-mono" />
                      <button type="button" onClick={() => setEditStandard(MODELE_STANDARD_DEFAULT)}
                        className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 underline">
                        Réinitialiser au contenu par défaut
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* INCLUS bullets */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">✅ INCLUS</p>
                        <div className="space-y-2">
                          {editPerso.inclus.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-emerald-500 text-sm shrink-0">•</span>
                              <input value={item} onChange={e => {
                                const next = [...editPerso.inclus];
                                next[i] = e.target.value;
                                setEditPerso({ ...editPerso, inclus: next });
                              }}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-emerald-400" />
                              <button type="button" onClick={() => setEditPerso({ ...editPerso, inclus: editPerso.inclus.filter((_, idx) => idx !== i) })}
                                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => setEditPerso({ ...editPerso, inclus: [...editPerso.inclus, ""] })}
                          className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline">
                          <Plus size={11} /> Ajouter un élément inclus
                        </button>
                      </div>

                      {/* NON INCLUS bullets */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">❌ NON INCLUS</p>
                        <div className="space-y-2">
                          {editPerso.non_inclus.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-red-400 text-sm shrink-0">•</span>
                              <input value={item} onChange={e => {
                                const next = [...editPerso.non_inclus];
                                next[i] = e.target.value;
                                setEditPerso({ ...editPerso, non_inclus: next });
                              }}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-red-300" />
                              <button type="button" onClick={() => setEditPerso({ ...editPerso, non_inclus: editPerso.non_inclus.filter((_, idx) => idx !== i) })}
                                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => setEditPerso({ ...editPerso, non_inclus: [...editPerso.non_inclus, ""] })}
                          className="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium hover:underline">
                          <Plus size={11} /> Ajouter un élément non inclus
                        </button>
                      </div>

                      {/* Conditions bloc */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Conditions (paiement, annulation, logistique)</p>
                        <textarea value={editPerso.conditions} onChange={e => setEditPerso({ ...editPerso, conditions: e.target.value })} rows={10}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-purple-400 resize-none font-mono" />
                      </div>

                      <button type="button" onClick={() => setEditPerso({ inclus: PERSO_DEFAULT_INCLUS, non_inclus: PERSO_DEFAULT_NON_INCLUS, conditions: PERSO_DEFAULT_CONDITIONS })}
                        className="text-[10px] text-gray-400 hover:text-gray-600 underline">
                        Réinitialiser au contenu par défaut
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setShowModelEditor(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Annuler
                    </button>
                    <button type="button" onClick={saveModeles}
                      className="flex-1 py-2.5 bg-[#0e2d38] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3f50] transition-colors">
                      Enregistrer les modèles
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modale prévisualisation message */}
      <AnimatePresence>
        {msgPreview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]" onClick={() => setMsgPreview(null)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[81] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {msgPreview.type === "payment_confirmation" ? "✅ Confirmation de paiement" : "🌟 Message de retour + Avis"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Modifiez le message avant d&apos;envoyer</p>
                </div>
                <button onClick={() => setMsgPreview(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={15} />
                </button>
              </div>

              {/* Textarea éditable */}
              <div className="p-5 flex-1 overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageCircle size={12} className="text-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Message WhatsApp + Email</span>
                </div>
                <textarea
                  value={msgPreview.text}
                  onChange={e => setMsgPreview({ ...msgPreview, text: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10 resize-none leading-relaxed"
                />
                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Destinataire : <strong className="text-gray-600">{msgPreview.doc.client_nom}</strong></span>
                  <span>{msgPreview.text.length} caractères</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2 shrink-0">
                <button onClick={() => setMsgPreview(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={confirmSendMessage} disabled={sendingMsg !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#408398] hover:bg-[#326e80] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                  {sendingMsg ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                  {sendingMsg ? "Envoi..." : "Envoyer Email + WhatsApp"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
