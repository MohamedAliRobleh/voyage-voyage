import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Client = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  notes: string;
  created_at: string;
};

export type LigneFacture = {
  description: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
};

export type Facture = {
  id: string;
  numero: string;
  type: "facture" | "devis";
  client_id: string;
  client_nom: string;
  client_email: string;
  date: string;
  echeance: string;
  statut: "brouillon" | "envoyé" | "payé";
  lignes: LigneFacture[];
  total: number;
  notes: string;
  created_at: string;
};
