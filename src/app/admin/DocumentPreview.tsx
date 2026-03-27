"use client";

import { useRef, useState } from "react";
import type { Facture } from "@/lib/supabase";
import { X, Printer, Send, Check, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface Props {
  document: Facture;
  onClose: () => void;
}

const TVA_RATE = 0; // Djibouti : pas de TVA standard, mettre 0

export default function DocumentPreview({ document: doc, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleSendEmail = async () => {
    if (!doc.client_email) {
      toast.error("Aucun email client renseigné pour ce document");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc }),
      });
      if (res.ok) {
        setSent(true);
        toast.success(`${doc.type === "devis" ? "Devis" : "Facture"} envoyé(e) à ${doc.client_email} ✓`);
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ? `Erreur : ${body.error}` : "Erreur lors de l'envoi. Vérifiez la configuration email.", { duration: 8000 });
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setSending(false);
  };

  const isDevis = doc.type === "devis";
  const total_ht = doc.total;
  const tva = total_ht * TVA_RATE;
  const total_ttc = total_ht + tva;

  const handleWhatsApp = async () => {
    setGeneratingPdf(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const content = printRef.current;
      if (!content) return;

      // Wrapper avec les styles du document
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; background: white; padding: 14mm 16mm; width: 210mm;";
      wrapper.innerHTML = content.innerHTML;
      document.body.appendChild(wrapper);

      const opt = {
        margin: 0,
        filename: `${doc.numero}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      const blob: Blob = await html2pdf().from(wrapper).set(opt).outputPdf("blob");
      document.body.removeChild(wrapper);

      const file = new File([blob], `${doc.numero}.pdf`, { type: "application/pdf" });

      // Mobile : partage natif (ouvre WhatsApp directement)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: doc.numero });
      } else {
        // Desktop : téléchargement + ouverture WhatsApp Web
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${doc.numero}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        setTimeout(() => window.open("https://web.whatsapp.com/", "_blank"), 400);
        toast("PDF téléchargé. Glissez-le dans la conversation WhatsApp Web.", { icon: "📎", duration: 6000 });
      }
    } catch {
      toast.error("Erreur lors de la génération du PDF");
    }
    setGeneratingPdf(false);
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${doc.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; background: white; }
          .page { width: 210mm; min-height: 297mm; padding: 18mm 16mm; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
          .company-info h1 { font-size: 18px; font-weight: 900; color: #0e2d38; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
          .company-info p { font-size: 11px; color: #555; line-height: 1.6; }
          .doc-badge { text-align: right; }
          .doc-badge .type { font-size: 28px; font-weight: 900; color: #408398; text-transform: uppercase; letter-spacing: 3px; }
          .doc-badge .numero { font-size: 13px; color: #555; margin-top: 4px; }
          .divider { border: none; border-top: 2px solid #408398; margin: 20px 0; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 32px; }
          .meta-block h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #408398; letter-spacing: 1px; margin-bottom: 6px; }
          .meta-block p { font-size: 12px; color: #1a1a1a; line-height: 1.7; }
          .dates { display: flex; gap: 32px; margin-bottom: 32px; }
          .date-item { }
          .date-item .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 1px; }
          .date-item .value { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead tr { background: #0e2d38; color: white; }
          thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
          thead th:last-child { text-align: right; }
          tbody tr:nth-child(even) { background: #f5f9fb; }
          tbody td { padding: 10px 12px; font-size: 12px; color: #333; border-bottom: 1px solid #e8f0f3; }
          tbody td:nth-child(2), tbody td:nth-child(3) { text-align: center; }
          tbody td:nth-child(4) { text-align: center; }
          tbody td:last-child { text-align: right; font-weight: 600; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
          .totals-box { width: 260px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #eee; }
          .totals-row.total { background: #0e2d38; color: white; padding: 10px 12px; border-radius: 6px; font-size: 15px; font-weight: 800; margin-top: 8px; border-bottom: none; }
          .notes-section { margin-bottom: 32px; }
          .notes-section h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #408398; letter-spacing: 1px; margin-bottom: 6px; }
          .notes-section p { font-size: 11px; color: #555; line-height: 1.6; background: #f5f9fb; padding: 10px 12px; border-radius: 6px; border-left: 3px solid #408398; }
          .conditions { margin-bottom: 32px; }
          .conditions h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #408398; letter-spacing: 1px; margin-bottom: 6px; }
          .conditions p { font-size: 11px; color: #555; line-height: 1.6; }
          .footer { border-top: 1px solid #ddd; padding-top: 14px; text-align: center; }
          .footer p { font-size: 10px; color: #888; line-height: 1.8; }
          .logo-area { display: flex; align-items: center; gap: 12px; }
          .logo-area img { width: 52px; height: 52px; border-radius: 50%; object-fit: contain; }
          @media print {
            body { margin: 0; }
            .page { padding: 12mm 14mm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${content.innerHTML}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} DJF`;
  const fmtDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 20 }}
        className="fixed inset-4 z-[61] flex flex-col bg-gray-100 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDevis ? "bg-amber-100 text-amber-700" : "bg-[#408398]/10 text-[#408398]"}`}>
              {isDevis ? "DEVIS" : "FACTURE"}
            </span>
            <span className="text-sm font-semibold text-gray-700">{doc.numero}</span>
            <span className="text-sm text-gray-400">— {doc.client_nom}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp en premier */}
            <button
              onClick={handleWhatsApp}
              disabled={generatingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {generatingPdf
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <MessageCircle size={15} />
              }
              {generatingPdf ? "Génération..." : "WhatsApp (PDF)"}
            </button>
            {/* Email */}
            <button
              onClick={handleSendEmail}
              disabled={sending || sent}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                sent ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              {sent ? <Check size={15} /> : sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
              {sent ? "Envoyé !" : sending ? "Envoi..." : `Email — ${doc.client_email || "client"}`}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors"
            >
              <Printer size={15} />
              Imprimer / PDF
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="bg-white shadow-lg rounded-xl mx-auto"
            style={{ maxWidth: "794px", minHeight: "1123px", padding: "48px 56px", fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            <div ref={printRef}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/pics/logo/logovoyage.webp"
                    alt="Voyage Voyage"
                    style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "contain" }}
                  />
                  <div>
                    <h1 style={{ fontSize: "17px", fontWeight: 900, color: "#0e2d38", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
                      VOYAGE VOYAGE
                    </h1>
                    <p style={{ fontSize: "11px", color: "#555", lineHeight: "1.6" }}>
                      Agence de Tourisme — Djibouti<br />
                      Gabode 5 - Zone Stid, Extension Lot 227<br />
                      Djibouti-Ville, République de Djibouti<br />
                      📞 +253 77 07 33 77 &nbsp;|&nbsp; 💬 WhatsApp : +253 77 07 33 77<br />
                      voyagevoyagedjib@gmail.com
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "30px", fontWeight: 900, color: isDevis ? "#d97706" : "#408398", textTransform: "uppercase", letterSpacing: "3px" }}>
                    {isDevis ? "DEVIS" : "FACTURE"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{doc.numero}</div>
                </div>
              </div>

              {/* Divider */}
              <hr style={{ border: "none", borderTop: `2px solid ${isDevis ? "#d97706" : "#408398"}`, marginBottom: "24px" }} />

              {/* Meta: client + dates */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: isDevis ? "#d97706" : "#408398", letterSpacing: "1px", marginBottom: "6px" }}>
                    {isDevis ? "Destinataire" : "Facturé à"}
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{doc.client_nom}</p>
                  {doc.client_email && <p style={{ fontSize: "12px", color: "#555" }}>{doc.client_email}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>
                      {isDevis ? "Date d'émission" : "Date de facturation"}
                    </p>
                    <p style={{ fontSize: "13px", fontWeight: 600 }}>{fmtDate(doc.date)}</p>
                  </div>
                  {doc.date_depart && (
                    <div style={{ marginBottom: "8px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>
                        Date de départ
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: isDevis ? "#d97706" : "#408398" }}>{fmtDate(doc.date_depart)}</p>
                    </div>
                  )}
                  {doc.date_retour && (
                    <div style={{ marginBottom: "8px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>
                        Date de retour
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: isDevis ? "#d97706" : "#408398" }}>{fmtDate(doc.date_retour)}</p>
                    </div>
                  )}
                  {doc.echeance && (
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px" }}>
                        {isDevis ? "Validité jusqu'au" : "Date d'échéance"}
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: isDevis ? "#d97706" : "#e53e3e" }}>{fmtDate(doc.echeance)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
                <thead>
                  <tr style={{ background: "#0e2d38", color: "white" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", width: "50%" }}>
                      Description
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Qté
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Prix unitaire
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lignes.map((l, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f5f9fb" }}>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#333", borderBottom: "1px solid #e8f0f3" }}>{l.description}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#333", textAlign: "center", borderBottom: "1px solid #e8f0f3" }}>{l.quantite}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "#333", textAlign: "right", borderBottom: "1px solid #e8f0f3" }}>{fmt(l.prix_unitaire)}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", fontWeight: 600, color: "#1a1a1a", textAlign: "right", borderBottom: "1px solid #e8f0f3" }}>{fmt(l.quantite * l.prix_unitaire)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
                <div style={{ width: "260px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", fontSize: "15px", fontWeight: 800, background: "#0e2d38", color: "white", borderRadius: "6px" }}>
                    <span>TOTAL</span>
                    <span>{fmt(total_ht)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {doc.notes && (
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: isDevis ? "#d97706" : "#408398", letterSpacing: "1px", marginBottom: "6px" }}>
                    Notes
                  </p>
                  <p style={{ fontSize: "11px", color: "#555", lineHeight: "1.6", background: "#f5f9fb", padding: "10px 12px", borderRadius: "6px", borderLeft: `3px solid ${isDevis ? "#d97706" : "#408398"}`, whiteSpace: "pre-wrap" }}>
                    {doc.notes}
                  </p>
                </div>
              )}

              {/* Conditions */}
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "6px" }}>
                  Conditions
                </p>
                <p style={{ fontSize: "11px", color: "#555", lineHeight: "1.8" }}>
                  {isDevis
                    ? `Ce devis est valable ${doc.echeance ? `jusqu'au ${fmtDate(doc.echeance)}` : "30 jours à compter de sa date d'émission"}. Tout devis accepté constitue un engagement contractuel. Un acompte de 30% sera demandé à la confirmation.`
                    : "Paiement à réception de facture. Tout retard de paiement entraîne des pénalités conformément aux conditions générales de vente. Aucun escompte pour paiement anticipé."
                  }
                </p>
              </div>

              {/* Signature zone for devis */}
              {isDevis && (
                <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                  <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "16px 20px", minHeight: "80px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>
                      Bon pour accord — Signature client
                    </p>
                    <p style={{ fontSize: "10px", color: "#aaa" }}>Date : _____ / _____ / _______</p>
                  </div>
                  <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "16px 20px", minHeight: "80px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>
                      Cachet & Signature — Voyage Voyage
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ borderTop: "1px solid #ddd", paddingTop: "14px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "#aaa", lineHeight: "1.8" }}>
                  VOYAGE VOYAGE — Agence de Tourisme — Djibouti-Ville, République de Djibouti<br />
                  📞 +253 77 07 33 77 &nbsp;|&nbsp; 💬 WhatsApp : +253 77 07 33 77 &nbsp;|&nbsp; voyagevoyagedjib@gmail.com &nbsp;|&nbsp; voyagevoyagedj.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
