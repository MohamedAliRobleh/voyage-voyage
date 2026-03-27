"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Facture, Client, Reversement } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  FileDown, Printer, Table2, Building2, CalendarDays, ChevronDown,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const SITES = [
  "Hougeif", "Loubatanleh", "Sables Blancs", "Ditilou", "Godoria",
  "Lac Assal", "Lac Abbé", "Requin-Baleine", "Goubet", "Bankoualeh",
  "Allos", "Obock", "Forêt du Day", "Abourma", "Moucha",
];
const MONTH_LABELS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} FDJ`;
function fmtDate(d: string): string {
  if (!d) return "—";
  if (d.includes("T") || d.length > 10) return new Date(d).toLocaleDateString("fr-FR");
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("fr-FR");
}

function detectSite(facture: Facture): string {
  const desc = facture.lignes.map(l => l.description).join(" ");
  return SITES.find(s => desc.toLowerCase().includes(s.toLowerCase())) || "Autre";
}

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const BOM = "\uFEFF";
  const content = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Print styles (injected once) ────────────────────────────────────────────

const PRINT_STYLE = `
@media print {
  body > *:not(#rapport-print) { display: none !important; }
  #rapport-print { display: block !important; }
  @page { margin: 20mm; }
}
`;

function injectPrintStyle() {
  if (document.getElementById("rapport-print-style")) return;
  const s = document.createElement("style");
  s.id = "rapport-print-style";
  s.textContent = PRINT_STYLE;
  document.head.appendChild(s);
}

function printElement(html: string) {
  injectPrintStyle();
  let el = document.getElementById("rapport-print");
  if (!el) {
    el = document.createElement("div");
    el.id = "rapport-print";
    el.style.display = "none";
    document.body.appendChild(el);
  }
  el.innerHTML = html;
  el.style.display = "block";
  window.print();
  setTimeout(() => { if (el) el.style.display = "none"; }, 500);
}

// ─── Report generators ────────────────────────────────────────────────────────

function buildMonthlyHTML(
  factures: Facture[],
  reversements: Reversement[],
  year: number,
  month: number
): string {
  const monthFacs = factures.filter(f => {
    const [y, m] = f.date.split("-").map(Number);
    return y === year && (m - 1) === month;
  });
  const paid = monthFacs.filter(f => f.statut === "payé" && f.type === "facture");
  const caTotal = paid.reduce((s, f) => s + f.total, 0);
  const revMonth = reversements.filter(r => {
    const d = new Date(r.created_at);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const charges = revMonth.reduce((s, r) => s + r.marge, 0);
  const marge = caTotal - charges;

  const rows = monthFacs.map(f => `
    <tr>
      <td>${f.numero}</td>
      <td>${f.client_nom}</td>
      <td>${f.type === "devis" ? "Devis" : "Facture"}</td>
      <td>${f.statut}</td>
      <td>${fmtDate(f.date)}</td>
      <td style="text-align:right">${fmt(f.total)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
        <div>
          <h1 style="margin:0; font-size:22px; color:#408398;">Voyage Voyage</h1>
          <p style="margin:4px 0 0; color:#888; font-size:13px;">Résumé mensuel — ${MONTH_LABELS[month]} ${year}</p>
        </div>
        <p style="color:#aaa; font-size:11px; margin:0;">Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
      </div>

      <div style="display:flex; gap:16px; margin-bottom:28px;">
        ${[
          { label: "CA encaissé", value: fmt(caTotal), color: "#408398" },
          { label: "Dû aux partenaires", value: fmt(charges), color: "#ef4444" },
          { label: "Commission agence", value: fmt(marge), color: "#8b5cf6" },
          { label: "Voyages payés", value: String(paid.length), color: "#f59e0b" },
        ].map(k => `
          <div style="flex:1; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
            <p style="margin:0; font-size:11px; color:#9ca3af;">${k.label}</p>
            <p style="margin:4px 0 0; font-size:16px; font-weight:700; color:${k.color};">${k.value}</p>
          </div>
        `).join("")}
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">N°</th>
            <th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Client</th>
            <th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Type</th>
            <th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Statut</th>
            <th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Date</th>
            <th style="padding:8px; text-align:right; border-bottom:2px solid #e5e7eb;">Montant</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" style="padding:16px;text-align:center;color:#aaa;">Aucun document ce mois</td></tr>'}</tbody>
        <tfoot>
          <tr style="background:#f9fafb; font-weight:700;">
            <td colspan="5" style="padding:8px; border-top:2px solid #e5e7eb;">Total encaissé</td>
            <td style="padding:8px; text-align:right; border-top:2px solid #e5e7eb; color:#408398;">${fmt(caTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function buildSiteHTML(factures: Facture[], reversements: Reversement[], site: string): string {
  const siteFacs = factures.filter(f => detectSite(f) === site);
  const paid = siteFacs.filter(f => f.statut === "payé");
  const caTotal = paid.reduce((s, f) => s + f.total, 0);
  const revSite = reversements.filter(r => r.site_nom === site);
  const totalMarge = revSite.reduce((s, r) => s + r.marge, 0);
  const totalCommission = revSite.reduce((s, r) => s + r.montant_reverser, 0);

  const rows = paid.map(f => `
    <tr>
      <td>${f.numero}</td>
      <td>${f.client_nom}</td>
      <td>${f.date_depart ? fmtDate(f.date_depart) : "—"}</td>
      <td style="text-align:right">${fmt(f.total)}</td>
    </tr>
  `).join("");

  const revRows = revSite.map(r => `
    <tr>
      <td>${r.facture_numero}</td>
      <td>${r.client_nom}</td>
      <td style="text-align:right">${fmt(r.marge)}</td>
      <td>${r.statut === "reversé" ? "✓ Reversé" : "En attente"}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
        <div>
          <h1 style="margin:0; font-size:22px; color:#408398;">Voyage Voyage</h1>
          <p style="margin:4px 0 0; color:#888; font-size:13px;">Bilan partenaire — ${site}</p>
        </div>
        <p style="color:#aaa; font-size:11px; margin:0;">Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
      </div>

      <div style="display:flex; gap:16px; margin-bottom:28px;">
        ${[
          { label: "CA généré", value: fmt(caTotal), color: "#408398" },
          { label: "Dû au partenaire", value: fmt(totalMarge), color: "#10b981" },
          { label: "Commission agence", value: fmt(totalCommission), color: "#8b5cf6" },
          { label: "Voyages", value: String(paid.length), color: "#f59e0b" },
        ].map(k => `
          <div style="flex:1; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
            <p style="margin:0; font-size:11px; color:#9ca3af;">${k.label}</p>
            <p style="margin:4px 0 0; font-size:16px; font-weight:700; color:${k.color};">${k.value}</p>
          </div>
        `).join("")}
      </div>

      <h3 style="font-size:13px; color:#6b7280; margin:0 0 8px;">Voyages réalisés</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:24px;">
        <thead><tr style="background:#f3f4f6;">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">N°</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Client</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Départ</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb;">Montant</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#aaa;">Aucun voyage</td></tr>'}</tbody>
      </table>

      <h3 style="font-size:13px; color:#6b7280; margin:0 0 8px;">Reversements</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead><tr style="background:#f3f4f6;">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Facture</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Client</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb;">Montant</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Statut</th>
        </tr></thead>
        <tbody>${revRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#aaa;">Aucun reversement</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RapportsSection() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reversements, setReversements] = useState<Reversement[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selSite, setSelSite] = useState(SITES[0]);

  useEffect(() => {
    Promise.all([
      supabase.from("factures").select("*"),
      supabase.from("clients").select("*"),
      supabase.from("reversements").select("*"),
    ]).then(([{ data: f }, { data: c }, { data: r }]) => {
      setFactures((f as Facture[]) || []);
      setClients((c as Client[]) || []);
      setReversements((r as Reversement[]) || []);
      setLoading(false);
    });
  }, []);

  // CSV Clients
  const exportClientsCSV = () => {
    const headers = ["Nom", "Email", "Téléphone", "Adresse", "Source", "Notes", "Créé le"];
    const rows = clients.map(c => [
      c.nom, c.email, c.telephone, c.adresse,
      c.source, c.notes, fmtDate(c.created_at),
    ]);
    downloadCSV(`clients_${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
  };

  // CSV Factures
  const exportFacturesCSV = () => {
    const headers = ["N°", "Type", "Client", "Email", "Statut", "Date", "Date départ", "Échéance", "Total (FDJ)", "Site", "Notes"];
    const rows = factures.map(f => [
      f.numero, f.type, f.client_nom, f.client_email,
      f.statut, fmtDate(f.date),
      f.date_depart ? fmtDate(f.date_depart) : "",
      f.echeance ? fmtDate(f.echeance) : "",
      String(f.total), detectSite(f), f.notes,
    ]);
    downloadCSV(`factures_${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
  };

  // CSV Reversements
  const exportReversementsCSV = () => {
    const headers = ["Facture", "Client", "Site", "Total client (FDJ)", "Commission agence (FDJ)", "Dû au partenaire (FDJ)", "Statut", "Créé le"];
    const rows = reversements.map(r => [
      r.facture_numero, r.client_nom, r.site_nom,
      String(r.total_client), String(r.montant_reverser), String(r.marge),
      r.statut, fmtDate(r.created_at),
    ]);
    downloadCSV(`reversements_${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
  };

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

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
          <FileDown size={20} className="text-[#408398]" />
          Rapports exportables
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Export CSV et résumés imprimables</p>
      </div>

      {/* ── Exports CSV ─────────────────────────────────────────────────────── */}
      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Table2 size={13} />
          Exports CSV
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Clients",
              sub: `${clients.length} enregistrement${clients.length > 1 ? "s" : ""}`,
              color: "bg-purple-50 border-purple-100 hover:bg-purple-100",
              icon: "👥",
              action: exportClientsCSV,
            },
            {
              label: "Factures & Devis",
              sub: `${factures.length} document${factures.length > 1 ? "s" : ""}`,
              color: "bg-blue-50 border-blue-100 hover:bg-blue-100",
              icon: "📄",
              action: exportFacturesCSV,
            },
            {
              label: "Reversements",
              sub: `${reversements.length} entrée${reversements.length > 1 ? "s" : ""}`,
              color: "bg-amber-50 border-amber-100 hover:bg-amber-100",
              icon: "💸",
              action: exportReversementsCSV,
            },
          ].map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={item.action}
              className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-colors ${item.color}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <FileDown size={16} className="ml-auto text-gray-400 shrink-0" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Résumé mensuel ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <CalendarDays size={13} />
          Résumé mensuel imprimable
        </h3>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          {/* Année */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Année</label>
            <div className="relative">
              <select
                value={selYear}
                onChange={e => setSelYear(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#408398]/20 bg-white"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mois */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mois</label>
            <div className="relative">
              <select
                value={selMonth}
                onChange={e => setSelMonth(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#408398]/20 bg-white"
              >
                {MONTH_LABELS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => printElement(buildMonthlyHTML(factures, reversements, selYear, selMonth))}
            className="flex items-center gap-2 px-5 py-2 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors ml-auto"
          >
            <Printer size={15} />
            Imprimer / PDF
          </button>
        </div>

        {/* Preview stats */}
        {(() => {
          const monthFacs = factures.filter(f => {
            const [y, m] = f.date.split("-").map(Number);
            return y === selYear && (m - 1) === selMonth;
          });
          const paid = monthFacs.filter(f => f.statut === "payé" && f.type === "facture");
          const caTotal = paid.reduce((s, f) => s + f.total, 0);
          return (
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Documents", value: monthFacs.length },
                { label: "Voyages payés", value: paid.length },
                { label: "CA encaissé", value: fmt(caTotal) },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-sm font-bold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* ── Bilan par site ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 size={13} />
          Bilan partenaire imprimable
        </h3>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Site partenaire</label>
            <div className="relative">
              <select
                value={selSite}
                onChange={e => setSelSite(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#408398]/20 bg-white"
              >
                {SITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => printElement(buildSiteHTML(factures, reversements, selSite))}
            className="flex items-center gap-2 px-5 py-2 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors ml-auto"
          >
            <Printer size={15} />
            Imprimer / PDF
          </button>
        </div>

        {/* Preview stats pour le site sélectionné */}
        {(() => {
          const siteFacs = factures.filter(f => detectSite(f) === selSite && f.statut === "payé" && f.type === "facture");
          const caTotal = siteFacs.reduce((s, f) => s + f.total, 0);
          const revSite = reversements.filter(r => r.site_nom === selSite);
          const totalMargePrev = revSite.reduce((s, r) => s + r.marge, 0);
          const totalCommissionPrev = revSite.reduce((s, r) => s + r.montant_reverser, 0);
          return (
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Voyages réalisés", value: siteFacs.length },
                { label: "CA généré", value: fmt(caTotal) },
                { label: "Dû au partenaire", value: fmt(totalMargePrev) },
                { label: "Commission agence", value: fmt(totalCommissionPrev) },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-sm font-bold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

    </div>
  );
}
