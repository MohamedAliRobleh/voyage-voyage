import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  destination: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  notes: string;
  source: "direct" | "whatsapp" | "site_web" | "reference" | "autre";
  created_at: string;
};

export type LigneFacture = {
  description: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
};

export type Partenaire = {
  id: string;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  localisation: string;
  commission_defaut: number;
  notes: string;
  note_performance: number;
  created_at: string;
};

export type Reversement = {
  id: string;
  facture_id: string;
  facture_numero: string;
  client_nom: string;
  site_nom: string;
  total_client: number;
  unite: "%" | "FDJ";
  valeur: number;
  montant_reverser: number;
  marge: number;
  statut: "à reverser" | "reversé";
  notes: string;
  created_at: string;
};

export type CatalogFormuleCustom = {
  id: string;
  site_id: string;
  label: string;
  description: string;
  type: "par_personne" | "fixe";
  prix_adulte: number | null;
  prix_enfant: number | null;
  age_enfant: string | null;
  prix_fixe: number | null;
  note_fixe: string | null;
  created_at: string;
};

export type Facture = {
  id: string;
  numero: string;
  type: "facture" | "devis";
  client_id: string;
  client_nom: string;
  client_email: string;
  date: string;
  date_depart: string | null;
  date_retour: string | null;
  echeance: string | null;
  statut: "brouillon" | "envoyé" | "accepté" | "en_negociation" | "confirmé" | "payé";
  lignes: LigneFacture[];
  total: number;
  notes: string;
  token: string;
  client_message: string;
  created_at: string;
};
