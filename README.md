# Voyage Voyage — Site Officiel

Site web de **Voyage Voyage**, agence touristique basée à Djibouti-Ville, spécialisée dans les voyages et excursions à travers la République de Djibouti.

---

## À propos du projet

Ce site a été conçu pour présenter les destinations et services de l'agence, offrir une expérience utilisateur moderne et permettre aux visiteurs de prendre contact facilement via WhatsApp ou le formulaire en ligne.

Le site couvre l'ensemble des destinations proposées par l'agence — du Lac Abbé aux Îles Moucha, en passant par le Lac Assal, les Sables Blancs, le Goubet, la Forêt du Day, et bien d'autres — avec des informations détaillées sur chaque lieu (durée, difficulté, meilleure période, points forts).

---

## Fonctionnalités

- **Multilingue (FR / EN / AR)** — contenu entièrement traduit en français, anglais et arabe, avec support RTL pour l'arabe et persistance du choix via `localStorage`
- **13 destinations** avec pages détaillées, galeries photos, highlights et sidebar de réservation
- **Carte interactive** (Leaflet) localisant toutes les destinations
- **Page Djibouti** — présentation complète du pays (géographie, culture, informations pratiques)
- **Formulaire de contact** + liens WhatsApp directs
- **Animations fluides** avec Framer Motion
- **Design responsive** — mobile, tablette et desktop
- **Favicon et métadonnées** Open Graph configurés avec le logo officiel

---

## Stack technique

| Technologie | Usage |
|---|---|
| [Next.js 16](https://nextjs.org) (App Router) | Framework React, routing, metadata |
| [TypeScript](https://www.typescriptlang.org) | Typage statique |
| [Tailwind CSS v4](https://tailwindcss.com) | Styles utilitaires |
| [Framer Motion](https://www.framer.com/motion) | Animations |
| [Leaflet / React Leaflet](https://react-leaflet.js.org) | Carte interactive |
| [Lucide React](https://lucide.dev) | Icônes |
| [React Hot Toast](https://react-hot-toast.com) | Notifications |

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Accueil
│   ├── about/                # À propos de l'agence
│   ├── contact/              # Page contact
│   ├── destinations/         # Liste + pages détaillées [slug]
│   └── djibouti/             # Page pays
├── components/
│   ├── Navigation.tsx        # Navbar avec sélecteur de langue
│   ├── Footer.tsx
│   ├── FloatingButtons.tsx   # Boutons flottants WhatsApp / téléphone
│   ├── ImageCarousel.tsx
│   ├── InteractiveMap.tsx
│   └── FAQAccordion.tsx
├── contexts/
│   └── LanguageContext.tsx   # Contexte i18n (FR/EN/AR)
└── lib/
    ├── destinations.ts       # Données des 13 destinations
    ├── destinationTranslations.ts  # Traductions EN/AR des destinations
    └── translations/
        ├── fr.ts
        ├── en.ts
        └── ar.ts
```

---

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

---

## Contact agence

**Voyage Voyage**
Gabode 5 - Zone Stid, Extension Lot 227, Djibouti-Ville
📞 +253 77 07 33 77
✉️ contact@voyage-voyage-djibouti.com
