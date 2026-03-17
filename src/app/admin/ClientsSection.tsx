"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const emptyForm = { nom: "", email: "", telephone: "", adresse: "", notes: "" };

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({ nom: client.nom, email: client.email || "", telephone: client.telephone || "", adresse: client.adresse || "", notes: client.notes || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingClient) {
      const { error } = await supabase.from("clients").update(form).eq("id", editingClient.id);
      if (error) toast.error("Erreur lors de la modification");
      else toast.success("Client modifié ✓");
    } else {
      const { error } = await supabase.from("clients").insert(form);
      if (error) toast.error("Erreur lors de l'ajout");
      else toast.success("Client ajouté ✓");
    }
    setSaving(false);
    setShowForm(false);
    loadClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce client ? Ses factures seront aussi supprimées.")) return;
    await supabase.from("clients").delete().eq("id", id);
    toast.success("Client supprimé");
    loadClients();
  };

  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.telephone || "").includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#408398] bg-white"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors shrink-0"
        >
          <Plus size={15} />
          Nouveau client
        </button>
      </div>

      {/* Stats */}
      <p className="text-xs text-gray-400">{clients.length} client{clients.length !== 1 ? "s" : ""} au total</p>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#408398]/30 border-t-[#408398] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? "Aucun client trouvé" : "Aucun client encore — ajoutez-en un !"}</p>
          </div>
        ) : (
          filtered.map((client, i) => (
            <div
              key={client.id}
              className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? "border-b border-gray-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#408398]/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[#408398] font-bold text-sm">{client.nom.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{client.nom}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {client.email && <span className="text-xs text-gray-400">{client.email}</span>}
                    {client.telephone && <span className="text-xs text-gray-400">{client.telephone}</span>}
                    {client.adresse && <span className="text-xs text-gray-300">{client.adresse}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(client)} className="p-2 text-gray-400 hover:text-[#408398] hover:bg-[#408398]/10 rounded-lg transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">{editingClient ? "Modifier le client" : "Nouveau client"}</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom complet *</label>
                    <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10" placeholder="Mohamed Ali" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Téléphone</label>
                      <input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10" placeholder="+253 77..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Adresse</label>
                    <input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10" placeholder="Djibouti-Ville..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes internes</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#408398] focus:ring-2 focus:ring-[#408398]/10 resize-none" placeholder="Notes..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                    <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#408398] text-white rounded-xl text-sm font-semibold hover:bg-[#326e80] transition-colors disabled:opacity-50">
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
