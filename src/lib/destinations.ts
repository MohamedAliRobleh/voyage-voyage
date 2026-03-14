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
    description: "Le point le plus bas d'Afrique, un lac de sel hypnotique à 155m sous le niveau de la mer.",
    longDescription:
      "Le Lac Assal est un lac salé situé à 155 mètres sous le niveau de la mer, ce qui en fait le point le plus bas d'Afrique et le troisième du monde. Ses eaux turquoise contrastent magnifiquement avec les cristaux de sel blanc qui bordent ses rives. C'est un spectacle unique au monde, entre désert volcanique et mer de sel scintillante.",
    image: "/images/pics/LAC ASSAL/lacassal.webp",
    images: [
      "/images/pics/LAC ASSAL/lacassal.webp",
      "/images/pics/LAC ASSAL/lacassal2.webp",
      "/images/pics/LAC ASSAL/lacassal3.webp",
    ],
    highlights: ["Point le plus bas d'Afrique", "Eaux 10x plus salées que la mer", "Cristaux de sel géants", "Paysage lunaire"],
    duration: "1 journée",
    difficulty: "Facile",
    bestTime: "Oct - Avril",
  },
  {
    id: "2",
    name: "Lac Abbé",
    slug: "lac-abbe",
    description: "Un paysage martien aux cheminées de vapeur, territoire des derniers flamants roses de Djibouti.",
    longDescription:
      "Le Lac Abbé est l'un des sites les plus spectaculaires de Djibouti. Ses cheminées calcaires dressées comme des orgues géantes, ses geysers de vapeur et ses flamants roses en font un paysage de science-fiction. La lumière de l'aube sur ce décor extraterrestre est une expérience inoubliable.",
    image: "/images/pics/lacabbe/lacabbe1.webp",
    images: [
      "/images/pics/lacabbe/lacabbe1.webp",
      "/images/pics/lacabbe/lacabbe2.webp",
      "/images/pics/lacabbe/lacabbe3.webp",
    ],
    highlights: ["Cheminées calcaires géantes", "Flamants roses", "Geysers de vapeur", "Lever de soleil magique"],
    duration: "2 jours",
    difficulty: "Modéré",
    bestTime: "Nov - Mars",
  },
  {
    id: "3",
    name: "Plage des Sables Blancs",
    slug: "sables-blancs",
    description: "Une plage paradisiaque aux eaux cristallines, idéale pour la plongée et le snorkeling.",
    longDescription:
      "La Plage des Sables Blancs est un véritable paradis tropical situé à quelques kilomètres de Djibouti-Ville. Ses eaux turquoise et son sable immaculé en font l'endroit parfait pour se détendre, nager ou explorer les fonds marins colorés du golfe de Tadjoura.",
    image: "/images/pics/SABLE BLANC/sablesblanc1.webp",
    images: [
      "/images/pics/SABLE BLANC/sablesblanc1.webp",
      "/images/pics/SABLE BLANC/sablesblanc2.webp",
      "/images/pics/SABLE BLANC/sablesblanc3.webp",
      "/images/pics/SABLE BLANC/sablesblanc4.webp",
      "/images/pics/SABLE BLANC/sablesblanc5.webp",
      "/images/pics/SABLE BLANC/sablesblanc6.webp",
    ],
    highlights: ["Sable blanc fin", "Eaux cristallines", "Snorkeling et plongée", "Fond marin coloré"],
    duration: "1 journée",
    difficulty: "Facile",
    bestTime: "Toute l'année",
  },
  {
    id: "4",
    name: "Requin-Baleine",
    slug: "requin-baleine",
    description: "Nage avec les géants des mers dans les eaux chaudes du golfe d'Aden.",
    longDescription:
      "Entre novembre et janvier, les eaux de Djibouti accueillent les requins-baleines, les plus grands poissons du monde. Cette expérience unique de nage avec ces géants paisibles est l'une des activités les plus recherchées par les voyageurs. Voyage Voyage organise des sorties encadrées pour vivre ce moment exceptionnel.",
    image: "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
    images: [
      "/images/pics/PHOTO REQUIN BALEINE/rq1.webp",
      "/images/pics/PHOTO REQUIN BALEINE/rq2.webp",
      "/images/pics/PHOTO REQUIN BALEINE/rq3.webp",
    ],
    highlights: ["Plus grand poisson du monde", "Nage en toute sécurité", "Guide certifié", "Expérience unique"],
    duration: "Demi-journée",
    difficulty: "Modéré",
    bestTime: "Nov - Janvier",
  },
  {
    id: "5",
    name: "Loubatanleh",
    slug: "loubatanleh",
    description: "Un oasis de verdure inattendu dans les terres arides de Djibouti.",
    longDescription:
      "Loubatanleh est une destination cachée qui surprend par sa végétation luxuriante au cœur d'un environnement aride. Ce site offre une randonnée pittoresque à travers des paysages variés, idéale pour les amateurs de nature et de découverte.",
    image: "/images/pics/loubatanleh/loubatanleh.webp",
    images: [
      "/images/pics/loubatanleh/loubatanleh.webp",
      "/images/pics/loubatanleh/loubatanleh1.png",
      "/images/pics/loubatanleh/loubatanleh2.png",
      "/images/pics/loubatanleh/loubatanleh3.png",
    ],
    highlights: ["Végétation luxuriante", "Randonnée nature", "Faune locale", "Paysages contrastés"],
    duration: "1 journée",
    difficulty: "Modéré",
    bestTime: "Oct - Avril",
  },
  {
    id: "6",
    name: "Zone Volcanique du Goubet",
    slug: "goubet",
    description: "L'un des endroits les plus géologiquement actifs de la planète, aux eaux mystérieuses.",
    longDescription:
      "Le Goubet est une baie mystérieuse entourée de montagnes volcaniques noires. Ses eaux profondes, ses formations géologiques uniques et son atmosphère sauvage en font une destination fascinante pour les aventuriers et les passionnés de géologie.",
    image: "/images/pics/goubet/goubet1.webp",
    images: [
      "/images/pics/goubet/goubet1.webp",
      "/images/pics/goubet/goubet2.webp",
      "/images/pics/goubet/goubet3.webp",
    ],
    highlights: ["Formations volcaniques", "Eaux profondes mystérieuses", "Géologie unique", "Paysage sauvage"],
    duration: "1 journée",
    difficulty: "Modéré",
    bestTime: "Oct - Avril",
  },
  {
    id: "7",
    name: "Bankoualeh",
    slug: "bankoualeh",
    description: "Un village traditionnel afar au cœur d'un paysage désertique authentique.",
    longDescription:
      "Bankoualeh offre une plongée dans la culture afar traditionnelle. Ce village authentique permet de découvrir le mode de vie nomade, l'artisanat local et l'hospitalité légendaire du peuple afar, tout en admirant des paysages désertiques spectaculaires.",
    image: "/images/pics/bankouleh/bankoual%C3%A9.jpg",
    images: [
      "/images/pics/bankouleh/bankoual%C3%A9.jpg",
    ],
    highlights: ["Culture afar authentique", "Village traditionnel", "Artisanat local", "Hospitalité djiboutienne"],
    duration: "1 journée",
    difficulty: "Facile",
    bestTime: "Oct - Avril",
  },
  {
    id: "8",
    name: "Ditilou",
    slug: "ditilou",
    description: "Un canyon majestueux sculpté par des millions d'années d'érosion dans le désert.",
    longDescription:
      "Ditilou est un canyon spectaculaire qui révèle la puissance de l'érosion naturelle dans le désert djiboutien. Ses parois colorées, ses formations rocheuses et ses sentiers de randonnée en font une destination prisée des amateurs de géotourisme.",
    image: "/images/pics/ditilou/Ditilou.webp",
    images: [
      "/images/pics/ditilou/Ditilou.webp",
      "/images/pics/ditilou/F2684BEE-F37F-4FA1-A5AB-12771AFA0502.webp",
      "/images/pics/ditilou/Colibri.webp",
      "/images/pics/ditilou/Singe Ditilou.webp",
    ],
    highlights: ["Canyon spectaculaire", "Formations rocheuses colorées", "Randonnée", "Photographie nature"],
    duration: "1-2 jours",
    difficulty: "Modéré",
    bestTime: "Nov - Mars",
  },
  {
    id: "9",
    name: "Dépression des Allos",
    slug: "depression-allos",
    description: "Hara Alol & Saku Allol, une dépression géologique unique aux paysages surréalistes.",
    longDescription:
      "La Dépression des Allos comprend deux sites géologiques exceptionnels : Hara Alol et Saku Allol. Ces dépressions offrent des paysages d'une beauté surréaliste avec leurs formations minérales multicolores, leurs sources chaudes et leur atmosphère hors du temps.",
    image: "/images/pics/ALLOLS/Allols.webp",
    images: [
      "/images/pics/ALLOLS/Allols.webp",
      "/images/pics/ALLOLS/Allols2.jpg",
    ],
    highlights: ["Formations minérales colorées", "Sources chaudes", "Paysage surréaliste", "Site géologique rare"],
    duration: "2 jours",
    difficulty: "Difficile",
    bestTime: "Nov - Février",
  },
  {
    id: "10",
    name: "Obock & Mangroves de Godoria",
    slug: "obock-godoria",
    description: "Les mangroves préservées de Godoria, habitat de nombreuses espèces d'oiseaux migrateurs.",
    longDescription:
      "Obock et les Mangroves de Godoria forment un écosystème côtier précieux au nord de Djibouti. Ces mangroves abritent une biodiversité exceptionnelle et offrent une expérience de nature unique, idéale pour les amateurs de birdwatching et d'écotourisme.",
    image: "/images/pics/obock/obock1.webp",
    images: [
      "/images/pics/obock/obock1.webp",
      "/images/pics/obock/obock2.webp",
      "/images/pics/obock/obock4.webp",
    ],
    highlights: ["Mangroves préservées", "Biodiversité côtière", "Birdwatching", "Écotourisme"],
    duration: "2 jours",
    difficulty: "Facile",
    bestTime: "Oct - Avril",
  },
  {
    id: "11",
    name: "Forêt du Day",
    slug: "foret-day",
    description: "La dernière forêt de genévriers de Djibouti, un écosystème montagnard unique.",
    longDescription:
      "La Forêt du Day est un sanctuaire de biodiversité perché à plus de 1000m d'altitude dans le massif du Goda. Cette forêt de genévriers ancestraux abrite des espèces animales et végétales endémiques, dont certaines espèces d'oiseaux qu'on ne trouve nulle part ailleurs au monde.",
    image: "/images/pics/foretduday/foretduday.webp",
    images: [
      "/images/pics/foretduday/foretduday.webp",
    ],
    highlights: ["Genévriers centenaires", "Espèces endémiques", "Altitude fraîche", "Randonnée montagne"],
    duration: "1-2 jours",
    difficulty: "Modéré",
    bestTime: "Oct - Avril",
  },
  {
    id: "12",
    name: "Gravures Rupestres d'Abourma",
    slug: "abourma",
    description: "Des gravures rupestres vieilles de plus de 8000 ans, témoin de la préhistoire africaine.",
    longDescription:
      "Le site d'Abourma abrite l'une des plus grandes concentrations de gravures rupestres de la Corne de l'Afrique. Ces représentations d'animaux et de scènes de vie gravées dans la roche témoignent d'une civilisation préhistorique florissante dans la région il y a plus de 8000 ans.",
    image: "/images/pics/ABOURMA/Abourma.jpg",
    images: [
      "/images/pics/ABOURMA/Abourma.jpg",
      "/images/pics/ABOURMA/abourma1.jpeg",
      "/images/pics/ABOURMA/abourma2.jpeg",
    ],
    highlights: ["Art rupestre préhistorique", "+8000 ans d'histoire", "Site unique en Afrique", "Guide archéologue"],
    duration: "2 jours",
    difficulty: "Difficile",
    bestTime: "Nov - Mars",
  },
  {
    id: "13",
    name: "Îles Moucha & Maskali",
    slug: "iles-moucha-maskali",
    description: "Deux îles paradisiaques aux récifs coralliens préservés dans le golfe de Tadjoura.",
    longDescription:
      "Les Îles Moucha et Maskali sont de véritables joyaux de la mer Rouge. Entourées de récifs coralliens colorés et d'eaux cristallines, ces îles offrent une escapade balnéaire parfaite avec plongée, snorkeling, pêche et farniente sur des plages de rêve.",
    image: "/images/pics/LES ILES/iles1.webp",
    images: [
      "/images/pics/LES ILES/iles1.webp",
      "/images/pics/LES ILES/iles2.webp",
      "/images/pics/LES ILES/iles3.webp",
    ],
    highlights: ["Récifs coralliens", "Plongée et snorkeling", "Plages isolées", "Pêche en haute mer"],
    duration: "1-2 jours",
    difficulty: "Facile",
    bestTime: "Toute l'année",
  },
];
