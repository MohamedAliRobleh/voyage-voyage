"use client";

import { useRef, useState, useEffect } from "react";
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
  const areaRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [docZoom, setDocZoom] = useState(1);

  useEffect(() => {
    const calc = () => {
      if (!areaRef.current) return;
      const avail = areaRef.current.clientWidth;
      const docFull = 906; // 794px content + 56px*2 padding
      setDocZoom(Math.min(1, avail / docFull));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

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

    // Injecter le contenu + styles d'impression dans la page courante
    const printRoot = document.createElement("div");
    printRoot.id = "vv-print-root";
    printRoot.innerHTML = content.innerHTML;

    const style = document.createElement("style");
    style.id = "vv-print-style";
    style.innerHTML = `
      @media screen { #vv-print-root { display: none; } }
      @media print {
        body > *:not(#vv-print-root) { display: none !important; }
        #vv-print-root { display: block !important; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        @page { size: A4 portrait; margin: 14mm 16mm; }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(printRoot);

    const prevTitle = document.title;
    document.title = `${doc.client_nom} - ${doc.numero}`;

    window.print();

    document.title = prevTitle;
    document.head.removeChild(style);
    document.body.removeChild(printRoot);
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
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border-b border-gray-200 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${isDevis ? "bg-amber-100 text-amber-700" : "bg-[#408398]/10 text-[#408398]"}`}>
              {isDevis ? "DEVIS" : "FACTURE"}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{doc.numero}</span>
            <span className="hidden sm:inline text-sm text-gray-400 truncate">— {doc.client_nom}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              disabled={generatingPdf}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {generatingPdf
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <MessageCircle size={14} />
              }
              <span className="hidden sm:inline">{generatingPdf ? "Génération..." : "WhatsApp (PDF)"}</span>
              <span className="sm:hidden">{generatingPdf ? "..." : "WhatsApp"}</span>
            </button>
            {/* Email */}
            <button
              onClick={handleSendEmail}
              disabled={sending || sent}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 ${
                sent ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              {sent ? <Check size={14} /> : sending ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
              <span className="hidden sm:inline">{sent ? "Envoyé !" : sending ? "Envoi..." : `Email — ${doc.client_email || "client"}`}</span>
              <span className="sm:hidden">{sent ? "✓" : sending ? "..." : "Email"}</span>
            </button>
            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#408398] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#326e80] transition-colors"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimer / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Document area */}
        <div ref={areaRef} className="flex-1 overflow-y-auto p-2 sm:p-6">
          <div
            className="bg-white shadow-lg rounded-xl mx-auto"
            style={{ width: "794px", minHeight: "1123px", padding: "48px 56px", fontFamily: "Arial, Helvetica, sans-serif", zoom: docZoom, transformOrigin: "top left" }}
          >
            <div ref={printRef}>
              {/* Header coloré */}
              <div style={{ background: "linear-gradient(135deg, #0e2d38 0%, #265868 60%, #408398 100%)", borderRadius: "12px", padding: "24px 32px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/pics/logo/logovoyage.webp"
                    alt="Voyage Voyage"
                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "contain", background: "white", padding: "4px" }}
                  />
                  <div>
                    <h1 style={{ fontSize: "18px", fontWeight: 900, color: "white", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px" }}>
                      VOYAGE VOYAGE
                    </h1>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", lineHeight: "1.7" }}>
                      Agence de Tourisme — Djibouti<br />
                      Gabode 5, Zone Stid, Extension Lot 227<br />
                      📞 +253 77 07 33 77 &nbsp;|&nbsp; 💬 +253 77 07 33 77
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: isDevis ? "#fbbf24" : "#7dd3ea", textTransform: "uppercase", letterSpacing: "4px" }}>
                    {isDevis ? "DEVIS" : "FACTURE"}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px", fontWeight: 600 }}>{doc.numero}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>voyagevoyagedj.com</div>
                </div>
              </div>

              {/* Bande colorée sous le header */}
              <div style={{ height: "4px", background: `linear-gradient(90deg, ${isDevis ? "#d97706" : "#408398"}, ${isDevis ? "#fbbf24" : "#7dd3ea"})`, borderRadius: "2px", marginBottom: "28px" }} />

              {/* Meta: client + dates */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px", background: "#f8fafc", borderRadius: "10px", padding: "20px 24px" }}>
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: isDevis ? "#d97706" : "#408398", letterSpacing: "1px", marginBottom: "6px" }}>
                    {isDevis ? "Destinataire" : "Facturé à"}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#0e2d38" }}>{doc.client_nom}</p>
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
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", borderRadius: "10px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: `linear-gradient(90deg, #0e2d38, ${isDevis ? "#92400e" : "#265868"})`, color: "white" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", width: "50%" }}>
                      Description
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Qté
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Prix unitaire
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lignes.map((l, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f0f7f9" }}>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#1a1a1a", borderBottom: "1px solid #e2eef2", fontWeight: 500 }}>{l.description}</td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#555", textAlign: "center", borderBottom: "1px solid #e2eef2" }}>{l.quantite}</td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#555", textAlign: "right", borderBottom: "1px solid #e2eef2" }}>{fmt(l.prix_unitaire)}</td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", fontWeight: 700, color: isDevis ? "#92400e" : "#0e2d38", textAlign: "right", borderBottom: "1px solid #e2eef2" }}>{fmt(l.quantite * l.prix_unitaire)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
                <div style={{ width: "280px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", fontSize: "16px", fontWeight: 900, background: `linear-gradient(135deg, #0e2d38, ${isDevis ? "#92400e" : "#408398"})`, color: "white", borderRadius: "10px", letterSpacing: "1px" }}>
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

              {/* Signature & cachet */}
              <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "16px 20px", minHeight: "90px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>
                    {isDevis ? "Bon pour accord — Signature client" : "Signature client"}
                  </p>
                  <p style={{ fontSize: "10px", color: "#aaa" }}>Date : _____ / _____ / _______</p>
                </div>
                <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "16px 20px", minHeight: "90px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>
                    Cachet & Signature — Voyage Voyage
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: "linear-gradient(135deg, #0e2d38, #265868)", borderRadius: "10px", padding: "16px 24px", textAlign: "center", marginTop: "8px" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.9)", lineHeight: "2", margin: 0, fontWeight: 600, letterSpacing: "0.5px" }}>
                  VOYAGE VOYAGE — Agence de Tourisme — Djibouti-Ville, République de Djibouti
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", lineHeight: "1.8", margin: 0 }}>
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
