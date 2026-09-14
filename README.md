# Belle Cosmétiques — Gestion de Boutique Beauté

Application web complète de gestion d'une boutique de cosmétiques, parfums et soins de beauté, construite en **React 18 + TypeScript + Vite**. Toutes les données sont locales (seed riche + persistance `localStorage` via Zustand). Interface bilingue **Français / Arabe (RTL)**, palette « rose · prune · blush · or champagne », animations Framer Motion partout.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
```

Autres scripts :

```bash
npm run build      # build de production (tsc + vite)
npm run preview    # prévisualiser le build
npm run typecheck  # vérification des types
```

## Connexion

- **Accès Démo Admin** (bouton doré) — connexion instantanée, toutes permissions.
- Identifiants démo : `admin@belle-cosmetiques.com` / `demo2024`
- Vous pouvez aussi créer un compte Admin depuis l'écran de connexion.

## Modules

Dashboard · Gestion de Stock · Achats · Point de Vente (POS) · Ventes · Clients · Fournisseurs · Employés · Dépenses · Caisse · Rapports · Paramètres.

### Dates d'expiration (cosmétiques)

- À l'achat (ou dans la fiche produit), on peut **activer / désactiver** le suivi de la date d'expiration par produit.
- Les produits concernés affichent leur date d'expiration sur leur **carte de stock** (pastille colorée : vert = OK, ambre = bientôt, rouge = expiré).
- Le **tableau de bord** et la cloche de notifications listent les produits **bientôt expirés** (≤ 30 jours) et **expirés**.

Chaque action met à jour l'état global (Zustand) et se reflète immédiatement dans toutes les vues liées : un achat met le stock à jour, une vente le décrémente, les dettes alimentent le dashboard et les rapports, etc.

## Stack

React Router v6 · Zustand (persist) · React Hook Form + Zod · Recharts · Framer Motion ·
date-fns · lucide-react · react-hot-toast · JsBarcode · react-to-print · TailwindCSS.

## Structure

```
src/
├── i18n/          traductions FR/AR + hook useTranslation
├── store/         stores Zustand (auth, products, purchases, sales, ...)
├── data/          données initiales (seed)
├── types/         interfaces TypeScript
├── components/    layout (sidebar, header) + ui + shared (barcode, print, paiement)
├── pages/         une page par module de la sidebar
└── utils/         calculs financiers, animations, helpers, export/import
```

## Notes

- **Sauvegarde / Restauration** : Paramètres → Base de Données (export/import JSON).
- **Impression** : factures d'achat / vente et rapports au format A4 avec en-tête du magasin (NIF/NIS/RC).
- **Codes-barres** : génération EAN-13 + impression depuis la fiche produit.
- Les données seed sont calculées en dates relatives à aujourd'hui pour que le tableau de bord soit toujours peuplé.
- Pour repartir de zéro : videz le `localStorage` du navigateur (clés `cosmetics-*`).
