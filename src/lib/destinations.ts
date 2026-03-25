export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  images: string[];
  highlights: string[];
  duration: string;
  difficulty: string;
  bestTime: string;
}

export const destinations: Destination[] = [
  {
    id: "1",
    name: "Lac Assal",
    slug: "lac-assal",
    description: "A -156 m sous le niveau de la mer, le point le plus bas d'Afrique, aux eaux 10x plus salées que la mer.",
    longDescription:
      "A -156 m au-dessous du niveau de la mer, le Lac Assal est le point le plus bas d'Afrique. Sa banquise de sel éclatante entourée de montagnes sombres crée un décor spectaculaire. Baignade saline, photos et, en option, randonnée avec caravane de dromadaires.",
    image: "/images/pics/LAC ASSAL/lacassal.webp",
    images: [
      "/images/pics/LAC ASSAL/lacassal.webp",
      "/images/pics/LAC ASSAL/lacassal2.webp",
      "/images/pics/LAC ASSAL/lacassal3.webp",
    ],
    highlights: ["Point le plus bas d'Afrique", "Banquise de sel", "Sources chaudes"],
    duration: "1 journée",
    difficulty: "Facile",
    bestTime: "Oct - Avril",
  },
  {
    id: "2",
    name: "Lac Abbé",
    slug: "lac-abbe",
    description: "Paysage lunaire unique, cheminées calcaires fumantes, flamants roses et scènes de vie nomade.",
    longDescription:
      "Paysage lunaire unique, cheminées calcaires fumantes, sources bouillonnantes, flamants roses et scènes de vie nomade. Bivouac, lever de soleil et silence du désert font du Lac Abbé une expérience inoubliable.",
    image: "/images/pics/lacabbe/lacabbe1.webp",
    images: [
      "/images/pics/lacabbe/lacabbe1.webp",
      "/images/pics/lacabbe/lacabbe2.webp",
      "/images/pics/lacabbe/lacabbe3.webp",
      "/images/pics/lacabbe/040B5990-8C5B-41F6-8D5A-A985E215E428.webp",
      "/images/pics/lacabbe/4E85FD1E-E4D9-462C-9F9E-02055592DA2A.webp",
      "/images/pics/lacabbe/LRM_EXPORT_341686724896899_20181121_063035689.webp",
    ],
    highlights: ["Cheminées de calcaire", "Flamants roses", "Fumerolles", "Lever et Coucher Soleil"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Mai",
  },
  {
    id: "3",
    name: "Plage des Sables Blancs",
    slug: "sables-blancs",
    description: "Une petite crique de sable immaculé bordée d'une eau émeraude, snorkeling et coucher de soleil sur le Mont Goda.",
    longDescription:
      "La plage des Sables Blancs est une petite crique de sable immaculé bordée d'une eau émeraude, où le temps semble ralentir. On s'y baigne, on y fait du snorkeling au-dessus de fonds marins riches en coraux et poissons multicolores, et son coucher de soleil spectaculaire sur le Mont Goda.",
    image: "/images/pics/SABLE BLANC/sablesblanc1.webp",
    images: [
      "/images/pics/SABLE BLANC/sablesblanc1.webp",
      "/images/pics/SABLE BLANC/sablesblanc2.webp",
      "/images/pics/SABLE BLANC/sablesblanc3.webp",
      "/images/pics/SABLE BLANC/sablesblanc4.webp",
      "/images/pics/SABLE BLANC/sablesblanc5.webp",
      "/images/pics/SABLE BLANC/sablesblanc6.webp",
      "/images/pics/Balneairs plage/plage-djibouti.webp",
      "/images/pics/Balneairs plage/plage-djibouti-2.webp",
    ],
    highlights: ["Eaux cristallines", "Sable fin", "Barrière de Coraux", "Randonner", "Pêche", "Détente"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Mai",
  },
  {
    id: "4",
    name: "Requin-Baleine",
    slug: "requin-baleine",
    description: "De fin octobre à mi-février, nagez en snorkeling à proximité du majestueux requin-baleine.",
    longDescription:
      "De fin octobre à mi-février, nagez en snorkeling à proximité du majestueux requin-baleine, dans le respect des règles d'observation. Une rencontre douce et impressionnante à vivre au moins une fois dans sa vie.",
    image: "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
    images: [
      "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
      "/images/pics/PHOTO REQUIN BALEINE/rq2.webp",
      "/images/pics/PHOTO REQUIN BALEINE/rq3.webp",
    ],
    highlights: ["Observation", "Snorkeling", "Novembre à Janvier"],
    duration: "1 journée",
    difficulty: "Facile",
    bestTime: "Oct - Fév",
  },
  {
    id: "5",
    name: "Loubatanleh",
    slug: "loubatanleh",
    description: "Site de montagne préservé avec panoramas sauvages, vues sur la mer et observation des tortues.",
    longDescription:
      "Site de montagne préservé avec des panoramas sauvages, Loubatanleh offre grands espaces, sentiers et points de vue sur la mer. Lors des sorties en mer et du snorkeling, on y aperçoit souvent des tortues, pour le plus grand plaisir des amoureux de l'océan.",
    image: "/images/pics/loubatanleh/loubatanleh.webp",
    images: [
      "/images/pics/loubatanleh/loubatanleh.webp",
      "/images/pics/loubatanleh/loubatanleh1.png",
      "/images/pics/loubatanleh/loubatanleh2.png",
      "/images/pics/loubatanleh/loubatanleh3.png",
    ],
    highlights: ["Hôtel de charme confortable", "Cadre pittoresque avec vues panoramiques", "Piscine à débordement avec La mer", "Observation Des Tortues"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Avril",
  },
  {
    id: "6",
    name: "Zone Volcanique du Goubet",
    slug: "goubet",
    description: "Champs de lave, faille tectonique, volcan d'Ardoukouba et vue sur l'Île du Diable dans le golfe.",
    longDescription:
      "Entre champs de lave, faille tectonique et vue sur le Golfe de Tadjourah, le Goubet offre un décor puissant. Au milieu des eaux, se dresse la fameuse Île du Diable, montagne en forme de dôme qui semble flotter dans le bleu profond. À proximité, le volcan d'Ardoukouba complète ce paysage d'une géologie extrême. Un classique pour les amateurs des paysages extrêmes.",
    image: "/images/pics/goubet/goubet1.webp",
    images: [
      "/images/pics/goubet/goubet1.webp",
      "/images/pics/goubet/goubet2.webp",
      "/images/pics/goubet/goubet3.webp",
    ],
    highlights: ["Champs de lave", "Faille tectonique", "Ile du Diable", "Vue sur le golfe"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Avril",
  },
  {
    id: "7",
    name: "Bankoualeh",
    slug: "bankoualeh",
    description: "Niché dans un cirque de montagnes, jardins en terrasse, végétation surprenante et rencontre avec les habitants.",
    longDescription:
      "Niché dans un cirque de montagnes, Bankoualeh séduit par ses jardins en terrasse, ses points d'eau et sa végétation surprenante. Une halte paisible pour marcher, se rafraîchir et rencontrer les habitants au cœur des Monts Goda.",
    image: "/images/pics/bankouleh/bankoual%C3%A9.jpg",
    images: [
      "/images/pics/bankouleh/bankoual%C3%A9.jpg",
      "/images/pics/PAYSAGES/paysage-1.webp",
      "/images/pics/PAYSAGES/paysage-4.webp",
      "/images/pics/PAYSAGES/IMG_3940.webp",
      "/images/pics/PAYSAGES/20190115_075101.webp",
    ],
    highlights: ["Village traditionnel authentique", "Paysages montagneux spectaculaires", "Biodiversité locale exceptionnelle", "Artisanat local"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Mai",
  },
  {
    id: "8",
    name: "Ditilou",
    slug: "ditilou",
    description: "Village de montagne entouré d'une vallée verdoyante, grande cascade et vue panoramique sur le Golfe de Tadjourah.",
    longDescription:
      "Dittilou est un village de montagne entouré d'une vallée verdoyante, d'une grande cascade et de jardins irrigués. On y accède par des pistes en 4x4, avec en bonus une vue panoramique sur le Golfe de Tadjourah. Idéal pour ceux qui aiment nature, fraîcheur et aventure.",
    image: "/images/pics/ditilou/Ditilou.webp",
    images: [
      "/images/pics/ditilou/Ditilou.webp",
      "/images/pics/ditilou/F2684BEE-F37F-4FA1-A5AB-12771AFA0502.webp",
      "/images/pics/ditilou/Colibri.webp",
      "/images/pics/ditilou/Singe Ditilou.webp",
      "/images/pics/PAYSAGES/paysage-5.webp",
      "/images/pics/PAYSAGES/paysage-6.webp",
    ],
    highlights: ["Grande Cascade", "Babouins hamadryas endémiques", "Oasis de verdure", "La Faune et La flore", "Vue Panoramique"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Mai",
  },
  {
    id: "9",
    name: "Dépression des Allos",
    slug: "depression-allos",
    description: "Entre palmiers doum, sources chaudes et étendues minérales colorées, un paysage étonnant loin des circuits classiques.",
    longDescription:
      "Entre palmiers doum, sources chaudes et étendues minérales colorées, la dépression des Allols offre un paysage étonnant, loin des circuits classiques. Un spot idéal pour ceux qui aiment les lieux bruts et méconnus.",
    image: "/images/pics/ALLOLS/Allols.webp",
    images: [
      "/images/pics/ALLOLS/Allols.webp",
      "/images/pics/ALLOLS/Allols2.jpg",
    ],
    highlights: ["Une dépression naturelle", "Formations géologiques", "Oasis de tranquillité", "Paysage contrastant avec les environs arides"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Nov - Mars",
  },
  {
    id: "10",
    name: "Obock & Mangroves de Godoria",
    slug: "obock-godoria",
    description: "Ancienne capitale de Djibouti, mangroves de Godoria, phare de Ras Bir et horizon sur le Yémen.",
    longDescription:
      "Obock, ancienne première capitale de Djibouti, est une ville historique et paisible à l'entrée de la mer Rouge, près du détroit de Bab Al Mandab, non loin des îles des Sept Frères et des Monts Mabla. Immortalisée par les récits d'Henri de Monfreid, elle vit aujourd'hui au rythme de la pêche et de l'élevage. A proximité, Ras Bir, le plus haut phare d'Afrique de l'Est, offre par temps clair une vue sur les côtes yéménites, tandis que la mangrove de Godoria dévoile l'un des plus beaux décors du pays, avec ses canaux verdoyants, ses palétuviers et une multitude d'oiseaux.",
    image: "/images/pics/obock/obock1.webp",
    images: [
      "/images/pics/obock/obock1.webp",
      "/images/pics/obock/obock2.webp",
      "/images/pics/obock/obock3.jpeg",
      "/images/pics/obock/obock4.webp",
    ],
    highlights: ["Canaux verdoyants", "Oiseaux", "Paletuviers", "Phare de Ras Bir", "Le Cimentier Marin"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Mai",
  },
  {
    id: "11",
    name: "Forêt du Day",
    slug: "foret-day",
    description: "Oasis de fraîcheur à 1 700 m d'altitude, réserve naturelle et habitat du rare Francolin de Djibouti.",
    longDescription:
      "Située à 1 700 m d'altitude au cœur des Monts Goda, la Forêt du Day est une oasis de fraîcheur. Balades à l'ombre des arbres, observation des oiseaux et vue panoramique sur le Mont Goda en font un spot nature incontournable, avec possibilité de nuit en campement traditionnel.",
    image: "/images/pics/foretduday/foretduday.webp",
    images: [
      "/images/pics/foretduday/foretduday.webp",
      "/images/pics/PAYSAGES/IMG_8638.webp",
      "/images/pics/PAYSAGES/IMG_3619 (1).JPG.webp",
      "/images/pics/PAYSAGES/20210429_182409.webp",
      "/images/pics/PAYSAGES/hanouna.webp",
    ],
    highlights: ["Forêt primaire", "Réserve naturelle", "Francolin de Djibouti", "Acacias", "Microclimat frais unique", "Biodiversité remarquable"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Mai",
  },
  {
    id: "12",
    name: "Gravures Rupestres d'Abourma",
    slug: "abourma",
    description: "Musée à ciel ouvert s'étendant sur 3 km, gravures vieilles de plus de 2 000 ans, accessible en 4x4.",
    longDescription:
      "Étendu sur 3 km, le site d'Abourma est un véritable musée à ciel ouvert. Des gravures vieilles de plus de 2 000 ans racontent scènes de vie, pastoralisme et faune disparue. Accessible en 4x4, c'est une excursion aventure et histoire unique.",
    image: "/images/pics/ABOURMA/Abourma.jpg",
    images: [
      "/images/pics/ABOURMA/Abourma.jpg",
      "/images/pics/ABOURMA/abourma1.jpeg",
      "/images/pics/ABOURMA/abourma2.jpeg",
    ],
    highlights: ["Site à ciel ouvert", "Scènes historiques", "Randonnée"],
    duration: "2 jours min.",
    difficulty: "Difficile",
    bestTime: "Nov - Mars",
  },
  {
    id: "13",
    name: "Îles Moucha & Maskali",
    slug: "iles-moucha-maskali",
    description: "A 45 minutes de bateau, sable blanc, récifs coralliens et mangroves pour une journée 100% mer.",
    longDescription:
      "A 45 minutes de bateau de la capitale, ces îles sont de véritables petits paradis : sable blanc, eau turquoise, récifs coralliens et mangroves. Snorkeling, baignade et farniente sont au programme d'une journée 100% mer.",
    image: "/images/pics/LES ILES/iles1.webp",
    images: [
      "/images/pics/LES ILES/iles1.webp",
      "/images/pics/LES ILES/iles2.webp",
      "/images/pics/LES ILES/iles3.webp",
      "/images/pics/FOND MARIN/Fond Marin Sable Blanc.webp",
      "/images/pics/FOND MARIN/fond-marin-djib.webp",
    ],
    highlights: ["Sable blanc", "Mangroves", "Snorkeling"],
    duration: "2 jours min.",
    difficulty: "Facile",
    bestTime: "Oct - Juin",
  },
];
