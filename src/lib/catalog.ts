export type CatalogFormule = {
  id: string;
  label: string;
  description: string;
  type: "par_personne" | "fixe";
  prixAdulte?: number;
  prixEnfant?: number; // enfants 5-12 ans sauf indication
  ageEnfant?: string;
  prixFixe?: number;
  noteFixe?: string; // ex: "par chambre / par nuit"
};

export type CatalogSite = {
  id: string;
  nom: string;
  emoji: string;
  couleur: string;
  formules: CatalogFormule[];
};

export const catalog: CatalogSite[] = [
  {
    id: "hougeif",
    nom: "Hougeif",
    emoji: "🏖️",
    couleur: "#408398",
    formules: [
      {
        id: "hougeif-f1",
        label: "Formule 1",
        description: "Dîner, Petit-déjeuner, Déjeuner",
        type: "par_personne",
        prixAdulte: 10000,
        prixEnfant: 6500,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "hougeif-f2",
        label: "Formule 2",
        description: "Dîner, Petit-déjeuner",
        type: "par_personne",
        prixAdulte: 7500,
        prixEnfant: 4500,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "hougeif-journee",
        label: "Journée uniquement",
        description: "Avec déjeuner",
        type: "par_personne",
        prixAdulte: 3000,
        prixEnfant: 2000,
        ageEnfant: "5 à 10 ans",
      },
    ],
  },
  {
    id: "loubatanleh",
    nom: "Loubatanleh",
    emoji: "🌿",
    couleur: "#059669",
    formules: [
      {
        id: "loub-mabla-double",
        label: "Chambre Mabla — Double",
        description: "70 m² · jusqu'à 6 pers. · Pdj + Dîner inclus · -10% 2ème nuit",
        type: "fixe",
        prixFixe: 44000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-mabla-famille",
        label: "Chambre Mabla — Famille",
        description: "70 m² · jusqu'à 6 pers. · 2 adultes + 2 enfants · Pdj + Dîner inclus",
        type: "fixe",
        prixFixe: 65000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-arrey-double",
        label: "Chambre Arrey — Double",
        description: "55 m² · jusqu'à 6 pers. · Pdj + Dîner inclus · -10% 2ème nuit",
        type: "fixe",
        prixFixe: 40000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-arrey-famille",
        label: "Chambre Arrey — Famille",
        description: "55 m² · jusqu'à 6 pers. · 2 adultes + 2 enfants · Pdj + Dîner inclus",
        type: "fixe",
        prixFixe: 55000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-goda-simple",
        label: "Chambre Goda — Simple",
        description: "35 m² · jusqu'à 3 pers. · Pdj + Dîner inclus",
        type: "fixe",
        prixFixe: 20000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-goda-double",
        label: "Chambre Goda — Double",
        description: "35 m² · jusqu'à 3 pers. · Pdj + Dîner inclus",
        type: "fixe",
        prixFixe: 34000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-ripta-double",
        label: "Chambre Ripta — Double",
        description: "45 m² · jusqu'à 5 pers. · Pdj + Dîner inclus · -10% 2ème nuit",
        type: "fixe",
        prixFixe: 40000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-ripta-famille",
        label: "Chambre Ripta — Famille",
        description: "45 m² · jusqu'à 5 pers. · 2 adultes + 2 enfants · Pdj + Dîner inclus",
        type: "fixe",
        prixFixe: 55000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "loub-belle-etoile",
        label: "Nuitée à la Belle Étoile",
        description: "Lit simple 90×190 · SDB partagée · Pdj + Dîner inclus · max 10 pers.",
        type: "par_personne",
        prixAdulte: 8000,
        prixEnfant: 4000,
        ageEnfant: "moins de 12 ans",
      },
      {
        id: "loub-adulte-supp",
        label: "Adulte supplémentaire",
        description: "Par adulte supplémentaire dans la chambre",
        type: "fixe",
        prixFixe: 10000,
        noteFixe: "par personne / par nuit",
      },
      {
        id: "loub-enfant-supp",
        label: "Enfant supplémentaire",
        description: "4 à 12 ans · Gratuit pour 0 à 3 ans",
        type: "fixe",
        prixFixe: 6000,
        noteFixe: "par enfant / par nuit",
      },
    ],
  },
  {
    id: "sables-blancs",
    nom: "Sables Blancs",
    emoji: "🏄",
    couleur: "#25D366",
    formules: [
      {
        id: "sb-paillote-f1",
        label: "Paillote — Formule 1",
        description: "Dîner, Petit-déjeuner",
        type: "par_personne",
        prixAdulte: 11000,
        prixEnfant: 6500,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "sb-paillote-f2",
        label: "Paillote — Formule 2",
        description: "Dîner, Petit-déjeuner, Déjeuner",
        type: "par_personne",
        prixAdulte: 13000,
        prixEnfant: 8500,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "sb-paillote-f3",
        label: "Paillote — Formule 3",
        description: "Déjeuner, Dîner, Petit-déjeuner et Déjeuner (tout inclus)",
        type: "par_personne",
        prixAdulte: 16000,
        prixEnfant: 10500,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "sb-hotel-familiale",
        label: "Hôtel — Chambre Familiale",
        description: "4 personnes · 1 grand lit + 2 petits lits · Petit-déjeuner inclus",
        type: "fixe",
        prixFixe: 34500,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "sb-hotel-double",
        label: "Hôtel — Chambre Double",
        description: "2 personnes · 1 grand lit + salon + frigo · Petit-déjeuner inclus",
        type: "fixe",
        prixFixe: 25000,
        noteFixe: "par chambre / par nuit",
      },
      {
        id: "sb-repas",
        label: "Repas",
        description: "Par repas, par personne",
        type: "par_personne",
        prixAdulte: 4000,
        prixEnfant: 2000,
        ageEnfant: "5 à 10 ans",
      },
    ],
  },
  {
    id: "ditilou",
    nom: "Ditilou",
    emoji: "🦅",
    couleur: "#7c3aed",
    formules: [
      {
        id: "dit-f1",
        label: "Formule 1",
        description: "Dîner, Petit-déjeuner",
        type: "par_personne",
        prixAdulte: 8000,
        prixEnfant: 6000,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "dit-f2",
        label: "Formule 2",
        description: "Dîner, Petit-déjeuner, Déjeuner",
        type: "par_personne",
        prixAdulte: 10000,
        prixEnfant: 8000,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "dit-f3",
        label: "Formule 3",
        description: "Déjeuner, Dîner, Petit-déjeuner et Déjeuner (tout inclus)",
        type: "par_personne",
        prixAdulte: 12000,
        prixEnfant: 10000,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "dit-journee",
        label: "Journée uniquement",
        description: "Avec déjeuner",
        type: "par_personne",
        prixAdulte: 3000,
        prixEnfant: 2000,
        ageEnfant: "5 à 10 ans",
      },
    ],
  },
  {
    id: "godoria",
    nom: "Godoria",
    emoji: "🌴",
    couleur: "#0891b2",
    formules: [
      {
        id: "god-f1",
        label: "Formule 1",
        description: "Dîner, Petit-déjeuner, Repas du midi",
        type: "par_personne",
        prixAdulte: 12000,
        prixEnfant: 8000,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "god-f2",
        label: "Formule 2",
        description: "Dîner, Petit-déjeuner (sans repas du midi)",
        type: "par_personne",
        prixAdulte: 7500,
        prixEnfant: 4500,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "god-journee",
        label: "Journée uniquement",
        description: "Avec déjeuner",
        type: "par_personne",
        prixAdulte: 4000,
        prixEnfant: 3000,
        ageEnfant: "5 à 10 ans",
      },
      {
        id: "god-mangrove",
        label: "Visite Mangrove",
        description: "Visite du site des mangroves · faune et flore · pêche sportive",
        type: "par_personne",
        prixAdulte: 2000,
        prixEnfant: 1000,
        ageEnfant: "5 à 10 ans",
      },
    ],
  },
];
