"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/supabase";
import { Send, MessageCircle, Mail, Users, User, Star, Search, CheckCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

type Cible = "tous" | "abonnes" | "client";
type Canal = "les_deux" | "email" | "whatsapp";

export default function MessagesSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [message, setMessage] = useState("");
  const [cible, setCible] = useState<Cible>("abonnes");
  const [canal, setCanal] = useState<Canal>("les_deux");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ emailsSent: number; waLinks: { nom: string; url: string }[] } | null>(null);

  useEffect(() => {
    supabase.from("clients").select("*").order("nom").then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  const clientsFiltres = clients.filter(c => {
    if (cible === "abonnes") return c.abonne_marketing;
    return true;
  });

  const clientsSearch = clients.filter(c =>
    c.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(clientSearch.toLowerCase())
  ).slice(0, 6);

  const nbCibles = cible === "client" ? (selectedClient ? 1 : 0) : clientsFiltres.length;

  const handleSend = async () => {
    if (!message.trim()) { toast.error("Écrivez un message avant d'envoyer"); return; }
    if (cible === "client" && !selectedClient) { toast.error("Sélectionnez un client"); return; }
    if (nbCibles === 0) { toast.error("Aucun client dans cette cible"); return; }

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, cible, canal, clientId: selectedClient?.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
      if (json.emailsSent > 0) toast.success(`${json.emailsSent} email(s) envoyé(s) ✓`);
      if (json.waLinks?.length > 0) toast(`${json.waLinks.length} lien(s) WhatsApp prêt(s) ci-dessous`, { icon: "💬" });
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Messages marketing</h2>
        <p className="text-sm text-gray-400 mt-0.5">Envoyez un message à vos clients par Email et/ou WhatsApp</p>
      </div>

      {/* Ciblage */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Destinataires</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "tous",     label: "Tous les clients",   icon: <Users size={14}/>,       count: clients.length },
            { id: "abonnes",  label: "Abonnés uniquement", icon: <Star size={14}/>,        count: clients.filter(c => c.abonne_marketing).length },
            { id: "client",   label: "Un client précis",   icon: <User size={14}/>,        count: null },
          ] as { id: Cible; label: string; icon: React.ReactNode; count: number | null }[]).map(opt => (
            <button
              key={opt.id}
              onClick={() => { setCible(opt.id); setSelectedClient(null); setClientSearch(""); }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                cible === opt.id ? "bg-[#408398] text-white border-[#408398]" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#408398]/40"
              }`}
            >
              {opt.icon}
              <span className="text-center leading-tight">{opt.label}</span>
              {opt.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${cible === opt.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {opt.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {cible === "client" && (
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setSelectedClient(null); }}
                placeholder="Rechercher un client..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-900"
              />
            </div>
            {clientSearch && !selectedClient && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {clientsSearch.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-400">Aucun résultat</p>
                ) : clientsSearch.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedClient(c); setClientSearch(c.nom); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-900">{c.nom}</span>
                    <span className="text-xs text-gray-400">{c.email || c.whatsapp}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedClient && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#408398]/10 rounded-xl">
                <CheckCircle size={13} className="text-[#408398]" />
                <span className="text-sm font-semibold text-[#408398]">{selectedClient.nom}</span>
                <span className="text-xs text-gray-400">{selectedClient.email || selectedClient.whatsapp}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Canal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Canal d&apos;envoi</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "les_deux", label: "Email + WhatsApp", icon: <><Mail size={13}/><MessageCircle size={13}/></> },
            { id: "email",    label: "Email seulement",  icon: <Mail size={14}/> },
            { id: "whatsapp", label: "WhatsApp seul",    icon: <MessageCircle size={14}/> },
          ] as { id: Canal; label: string; icon: React.ReactNode }[]).map(opt => (
            <button
              key={opt.id}
              onClick={() => setCanal(opt.id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                canal === opt.id ? "bg-[#408398] text-white border-[#408398]" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#408398]/40"
              }`}
            >
              <span className="flex gap-1">{opt.icon}</span>
              <span className="text-center leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Message</p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          placeholder={`Bonjour,\n\nVoyage Voyage vous propose une offre spéciale...\n\nL'équipe Voyage Voyage 🌍`}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10 resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{message.length} caractères</p>
          <p className="text-xs text-gray-400">
            {nbCibles > 0 ? `${nbCibles} destinataire(s)` : <span className="text-red-400">Aucun destinataire</span>}
          </p>
        </div>
      </div>

      {/* Bouton envoi */}
      <button
        onClick={handleSend}
        disabled={sending || !message.trim() || nbCibles === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#408398] hover:bg-[#326e80] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
      >
        {sending
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <Send size={15} />}
        {sending ? "Envoi en cours..." : `Envoyer à ${nbCibles} client(s)`}
      </button>

      {/* Résultats */}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Résultats</p>
          {result.emailsSent > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
              <CheckCircle size={15} /> {result.emailsSent} email(s) envoyé(s) avec succès
            </div>
          )}
          {result.waLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">Cliquez pour ouvrir WhatsApp avec le message pré-rempli :</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {result.waLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-sm font-medium text-green-700 transition-colors"
                  >
                    <span className="flex items-center gap-2"><MessageCircle size={13}/> {link.nom}</span>
                    <ExternalLink size={12} className="text-green-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {result.emailsSent === 0 && result.waLinks.length === 0 && (
            <p className="text-sm text-gray-400">Aucun client avec email ou WhatsApp dans cette cible.</p>
          )}
        </div>
      )}
    </div>
  );
}
