// ============================================================================
// initialData.ts — Constant demo dataset for Suppirette
// ----------------------------------------------------------------------------
// Every store seeds its initial state from this file, so this is what fills the
// whole app (dashboard, stock, POS, sales, reports…) on a fresh install.
//
// Dates are derived from "today" rather than hard-coded, so expiry alerts,
// month-to-date totals and the report charts stay meaningful whenever the app
// is opened. The *content* is constant — only the calendar anchor moves.
// ============================================================================

import type {
  AppUser,
  CaisseTransaction,
  Client,
  Expense,
  Permissions,
  Product,
  Purchase,
  Sale,
  StoreSettings,
  Supplier,
  Worker,
} from '@/types'
import { fullPermissions } from '@/utils/helpers'

// ----------------------------------------------------------------------------
// Date helpers — all seed dates are relative to the current day.
// ----------------------------------------------------------------------------

const DAY = 86_400_000

const iso = (offsetDays: number): string => {
  const d = new Date(Date.now() + offsetDays * DAY)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** `n` days in the past. */
const ago = (n: number) => iso(-n)
/** `n` days in the future. */
const ahead = (n: number) => iso(n)

// ----------------------------------------------------------------------------
// Taxonomy
// ----------------------------------------------------------------------------

export const INITIAL_CATEGORIES: string[] = [
  'Épicerie',
  'Boissons',
  'Produits laitiers',
  'Hygiène & Beauté',
  'Entretien',
  'Snacks & Confiserie',
  'Boulangerie',
  'Surgelés',
  'Conserves',
  'Bébé',
]

export const INITIAL_BRANDS: string[] = [
  'Cevital',
  'SIM',
  'Elio',
  'Soummam',
  'Candia',
  'Hamoud Boualem',
  'Ifri',
  'Rouiba',
  'Bimo',
  'Amor Benamor',
  'Coca-Cola',
  'Molfix',
  'Isis',
  'Moulin d’Or',
  'Palmolive',
]

// ----------------------------------------------------------------------------
// Products — a representative Algerian supermarket catalogue (prices in DA)
// ----------------------------------------------------------------------------

interface Seed {
  id: string
  name: string
  description: string
  barcode: string
  brand: string
  category: string
  purchasePrice: number
  salePrice: number
  quantity: number
  minQuantity: number
  /** days from today until expiry; omit for non-perishable goods */
  exp?: number
}

const PRODUCT_SEED: Seed[] = [
  // --- Épicerie -------------------------------------------------------------
  { id: 'p-001', name: 'Huile de table Elio 5L', description: 'Huile de tournesol raffinée, bidon 5 litres', barcode: '6130001000012', brand: 'Elio', category: 'Épicerie', purchasePrice: 690, salePrice: 780, quantity: 48, minQuantity: 12, exp: 300 },
  { id: 'p-002', name: 'Semoule fine SIM 10kg', description: 'Semoule de blé dur extra fine, sac 10 kg', barcode: '6130001000029', brand: 'SIM', category: 'Épicerie', purchasePrice: 850, salePrice: 940, quantity: 35, minQuantity: 10, exp: 240 },
  { id: 'p-003', name: 'Sucre cristallisé Cevital 1kg', description: 'Sucre blanc cristallisé, sachet 1 kg', barcode: '6130001000036', brand: 'Cevital', category: 'Épicerie', purchasePrice: 95, salePrice: 115, quantity: 120, minQuantity: 30, exp: 420 },
  { id: 'p-004', name: 'Farine de blé tendre 5kg', description: 'Farine panifiable type 55, sac 5 kg', barcode: '6130001000043', brand: 'Amor Benamor', category: 'Épicerie', purchasePrice: 340, salePrice: 395, quantity: 26, minQuantity: 10, exp: 180 },
  { id: 'p-005', name: 'Pâtes Spaghetti SIM 500g', description: 'Spaghetti de blé dur, paquet 500 g', barcode: '6130001000050', brand: 'SIM', category: 'Épicerie', purchasePrice: 78, salePrice: 95, quantity: 140, minQuantity: 40, exp: 330 },
  { id: 'p-006', name: 'Couscous moyen SIM 1kg', description: 'Couscous grain moyen, paquet 1 kg', barcode: '6130001000067', brand: 'SIM', category: 'Épicerie', purchasePrice: 130, salePrice: 155, quantity: 88, minQuantity: 25, exp: 300 },
  { id: 'p-007', name: 'Riz long grain 1kg', description: 'Riz blanc long grain, sachet 1 kg', barcode: '6130001000074', brand: 'Cevital', category: 'Épicerie', purchasePrice: 145, salePrice: 175, quantity: 62, minQuantity: 20, exp: 365 },
  { id: 'p-008', name: 'Lentilles blondes 1kg', description: 'Lentilles blondes calibrées, sachet 1 kg', barcode: '6130001000081', brand: 'Amor Benamor', category: 'Épicerie', purchasePrice: 210, salePrice: 250, quantity: 44, minQuantity: 15, exp: 400 },
  { id: 'p-009', name: 'Pois chiches 1kg', description: 'Pois chiches secs, sachet 1 kg', barcode: '6130001000098', brand: 'Amor Benamor', category: 'Épicerie', purchasePrice: 195, salePrice: 235, quantity: 9, minQuantity: 15, exp: 400 },
  { id: 'p-010', name: 'Café moulu supérieur 250g', description: 'Café moulu arabica, paquet 250 g', barcode: '6130001000104', brand: 'Cevital', category: 'Épicerie', purchasePrice: 320, salePrice: 390, quantity: 54, minQuantity: 18, exp: 210 },

  // --- Conserves ------------------------------------------------------------
  { id: 'p-011', name: 'Double concentré de tomate 800g', description: 'Concentré de tomate 28%, boîte 800 g', barcode: '6130002000011', brand: 'Amor Benamor', category: 'Conserves', purchasePrice: 185, salePrice: 225, quantity: 76, minQuantity: 24, exp: 540 },
  { id: 'p-012', name: 'Thon à l’huile végétale 160g', description: 'Miettes de thon à l’huile, boîte 160 g', barcode: '6130002000028', brand: 'Amor Benamor', category: 'Conserves', purchasePrice: 240, salePrice: 290, quantity: 58, minQuantity: 20, exp: 600 },
  { id: 'p-013', name: 'Sardines à la sauce tomate 125g', description: 'Sardines préparées, boîte 125 g', barcode: '6130002000035', brand: 'Amor Benamor', category: 'Conserves', purchasePrice: 110, salePrice: 140, quantity: 95, minQuantity: 30, exp: 540 },
  { id: 'p-014', name: 'Harissa forte 380g', description: 'Purée de piment relevée, boîte 380 g', barcode: '6130002000042', brand: 'Amor Benamor', category: 'Conserves', purchasePrice: 130, salePrice: 165, quantity: 41, minQuantity: 12, exp: 480 },

  // --- Boissons -------------------------------------------------------------
  { id: 'p-015', name: 'Coca-Cola 2L', description: 'Boisson gazeuse cola, bouteille 2 litres', barcode: '6130003000010', brand: 'Coca-Cola', category: 'Boissons', purchasePrice: 165, salePrice: 200, quantity: 132, minQuantity: 36, exp: 120 },
  { id: 'p-016', name: 'Selecto 1L', description: 'Boisson gazeuse pomme, bouteille 1 litre', barcode: '6130003000027', brand: 'Hamoud Boualem', category: 'Boissons', purchasePrice: 95, salePrice: 120, quantity: 108, minQuantity: 30, exp: 150 },
  { id: 'p-017', name: 'Eau minérale Ifri 1.5L', description: 'Eau minérale naturelle, pack 6 × 1,5 L', barcode: '6130003000034', brand: 'Ifri', category: 'Boissons', purchasePrice: 240, salePrice: 300, quantity: 84, minQuantity: 24, exp: 270 },
  { id: 'p-018', name: 'Jus d’orange Rouiba 1L', description: 'Nectar d’orange, brique 1 litre', barcode: '6130003000041', brand: 'Rouiba', category: 'Boissons', purchasePrice: 120, salePrice: 150, quantity: 7, minQuantity: 20, exp: 21 },
  { id: 'p-019', name: 'Limonade Hamoud 1L', description: 'Limonade traditionnelle, bouteille 1 litre', barcode: '6130003000058', brand: 'Hamoud Boualem', category: 'Boissons', purchasePrice: 90, salePrice: 115, quantity: 96, minQuantity: 30, exp: 150 },

  // --- Produits laitiers ----------------------------------------------------
  { id: 'p-020', name: 'Lait UHT Candia 1L', description: 'Lait demi-écrémé longue conservation, 1 litre', barcode: '6130004000019', brand: 'Candia', category: 'Produits laitiers', purchasePrice: 105, salePrice: 130, quantity: 156, minQuantity: 48, exp: 45 },
  { id: 'p-021', name: 'Yaourt nature Soummam ×4', description: 'Yaourt brassé nature, pack de 4 pots', barcode: '6130004000026', brand: 'Soummam', category: 'Produits laitiers', purchasePrice: 115, salePrice: 145, quantity: 64, minQuantity: 24, exp: 12 },
  { id: 'p-022', name: 'Lben Soummam 1L', description: 'Lait fermenté traditionnel, bouteille 1 litre', barcode: '6130004000033', brand: 'Soummam', category: 'Produits laitiers', purchasePrice: 85, salePrice: 110, quantity: 38, minQuantity: 20, exp: 6 },
  { id: 'p-023', name: 'Fromage fondu 24 portions', description: 'Fromage fondu à tartiner, boîte 24 portions', barcode: '6130004000040', brand: 'Soummam', category: 'Produits laitiers', purchasePrice: 290, salePrice: 350, quantity: 47, minQuantity: 15, exp: 90 },
  { id: 'p-024', name: 'Beurre pasteurisé 250g', description: 'Beurre de table doux, plaquette 250 g', barcode: '6130004000057', brand: 'Candia', category: 'Produits laitiers', purchasePrice: 320, salePrice: 385, quantity: 5, minQuantity: 12, exp: 25 },

  // --- Boulangerie ----------------------------------------------------------
  { id: 'p-025', name: 'Pain de mie complet 500g', description: 'Pain de mie tranché complet, sachet 500 g', barcode: '6130005000018', brand: 'Moulin d’Or', category: 'Boulangerie', purchasePrice: 140, salePrice: 175, quantity: 32, minQuantity: 15, exp: 8 },
  { id: 'p-026', name: 'Croissants ×6', description: 'Croissants au beurre, sachet de 6', barcode: '6130005000025', brand: 'Moulin d’Or', category: 'Boulangerie', purchasePrice: 180, salePrice: 230, quantity: 24, minQuantity: 10, exp: 5 },

  // --- Snacks & Confiserie --------------------------------------------------
  { id: 'p-027', name: 'Biscuits fourrés chocolat 200g', description: 'Biscuits fourrés au cacao, paquet 200 g', barcode: '6130006000017', brand: 'Bimo', category: 'Snacks & Confiserie', purchasePrice: 95, salePrice: 125, quantity: 118, minQuantity: 36, exp: 180 },
  { id: 'p-028', name: 'Gaufrettes vanille 150g', description: 'Gaufrettes fourrées vanille, paquet 150 g', barcode: '6130006000024', brand: 'Bimo', category: 'Snacks & Confiserie', purchasePrice: 75, salePrice: 100, quantity: 92, minQuantity: 30, exp: 160 },
  { id: 'p-029', name: 'Chips nature 120g', description: 'Chips de pomme de terre salées, sachet 120 g', barcode: '6130006000031', brand: 'Bimo', category: 'Snacks & Confiserie', purchasePrice: 85, salePrice: 115, quantity: 73, minQuantity: 25, exp: 95 },
  { id: 'p-030', name: 'Tablette chocolat noir 100g', description: 'Chocolat noir 55% cacao, tablette 100 g', barcode: '6130006000048', brand: 'Bimo', category: 'Snacks & Confiserie', purchasePrice: 140, salePrice: 180, quantity: 56, minQuantity: 20, exp: 220 },

  // --- Hygiène & Beauté -----------------------------------------------------
  { id: 'p-031', name: 'Shampoing 2 en 1 400ml', description: 'Shampoing et après-shampoing, flacon 400 ml', barcode: '6130007000016', brand: 'Palmolive', category: 'Hygiène & Beauté', purchasePrice: 290, salePrice: 360, quantity: 43, minQuantity: 15 },
  { id: 'p-032', name: 'Savon de toilette 125g', description: 'Savon surgras parfumé, pain 125 g', barcode: '6130007000023', brand: 'Palmolive', category: 'Hygiène & Beauté', purchasePrice: 70, salePrice: 95, quantity: 128, minQuantity: 40 },
  { id: 'p-033', name: 'Dentifrice protection 75ml', description: 'Dentifrice fluoré protection caries, tube 75 ml', barcode: '6130007000030', brand: 'Palmolive', category: 'Hygiène & Beauté', purchasePrice: 160, salePrice: 205, quantity: 67, minQuantity: 20 },
  { id: 'p-034', name: 'Papier hygiénique ×8', description: 'Papier hygiénique double épaisseur, lot de 8', barcode: '6130007000047', brand: 'Palmolive', category: 'Hygiène & Beauté', purchasePrice: 310, salePrice: 390, quantity: 51, minQuantity: 18 },

  // --- Entretien ------------------------------------------------------------
  { id: 'p-035', name: 'Eau de javel 1L', description: 'Javel concentrée désinfectante, bidon 1 litre', barcode: '6130008000015', brand: 'Isis', category: 'Entretien', purchasePrice: 75, salePrice: 100, quantity: 89, minQuantity: 30 },
  { id: 'p-036', name: 'Liquide vaisselle 750ml', description: 'Détergent vaisselle citron, flacon 750 ml', barcode: '6130008000022', brand: 'Isis', category: 'Entretien', purchasePrice: 145, salePrice: 185, quantity: 61, minQuantity: 20 },
  { id: 'p-037', name: 'Lessive en poudre 3kg', description: 'Lessive machine toutes températures, baril 3 kg', barcode: '6130008000039', brand: 'Isis', category: 'Entretien', purchasePrice: 620, salePrice: 750, quantity: 28, minQuantity: 12 },
  { id: 'p-038', name: 'Éponges grattantes ×5', description: 'Éponges double face, lot de 5', barcode: '6130008000046', brand: 'Isis', category: 'Entretien', purchasePrice: 90, salePrice: 125, quantity: 74, minQuantity: 25 },

  // --- Bébé -----------------------------------------------------------------
  { id: 'p-039', name: 'Couches bébé taille 4 ×44', description: 'Couches culottes 9–14 kg, paquet de 44', barcode: '6130009000014', brand: 'Molfix', category: 'Bébé', purchasePrice: 980, salePrice: 1180, quantity: 22, minQuantity: 8 },
  { id: 'p-040', name: 'Lingettes bébé ×72', description: 'Lingettes nettoyantes sans alcool, paquet de 72', barcode: '6130009000021', brand: 'Molfix', category: 'Bébé', purchasePrice: 175, salePrice: 225, quantity: 39, minQuantity: 15 },

  // --- Surgelés -------------------------------------------------------------
  { id: 'p-041', name: 'Frites surgelées 1kg', description: 'Pommes de terre précuites surgelées, sachet 1 kg', barcode: '6130010000013', brand: 'Cevital', category: 'Surgelés', purchasePrice: 260, salePrice: 320, quantity: 36, minQuantity: 12, exp: 150 },
  { id: 'p-042', name: 'Petits pois surgelés 500g', description: 'Petits pois extra-fins surgelés, sachet 500 g', barcode: '6130010000020', brand: 'Cevital', category: 'Surgelés', purchasePrice: 180, salePrice: 230, quantity: 11, minQuantity: 12, exp: 200 },
]

export const INITIAL_PRODUCTS: Product[] = PRODUCT_SEED.map((s, i) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  barcode: s.barcode,
  brand: s.brand,
  category: s.category,
  purchasePrice: s.purchasePrice,
  salePrice: s.salePrice,
  quantity: s.quantity,
  minQuantity: s.minQuantity,
  hasExpiration: s.exp !== undefined,
  expirationDate: s.exp !== undefined ? ahead(s.exp) : undefined,
  createdAt: ago(120 - i),
}))

/** Quick lookup used to build purchase and sale lines below. */
const P = (id: string) => INITIAL_PRODUCTS.find((p) => p.id === id)!

// ----------------------------------------------------------------------------
// Suppliers
// ----------------------------------------------------------------------------

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's-001', name: 'Groupe Cevital Distribution', phone: '0770 12 34 56', address: 'Zone industrielle, Béjaïa', createdAt: ago(240) },
  { id: 's-002', name: 'SIM Agroalimentaire', phone: '0661 45 78 90', address: 'Route nationale 5, Alger', createdAt: ago(228) },
  { id: 's-003', name: 'Laiterie Soummam', phone: '0555 33 21 09', address: 'Akbou, Béjaïa', createdAt: ago(215) },
  { id: 's-004', name: 'Hamoud Boualem SPA', phone: '0770 88 44 12', address: 'Bir Mourad Raïs, Alger', createdAt: ago(200) },
  { id: 's-005', name: 'Conserverie Amor Benamor', phone: '0664 19 76 43', address: 'Guelma', createdAt: ago(186) },
  { id: 's-006', name: 'Ifri Boissons', phone: '0551 62 30 77', address: 'Ighzer Amokrane, Béjaïa', createdAt: ago(170) },
  { id: 's-007', name: 'Distribution Hygiène Plus', phone: '0698 27 55 41', address: 'Rouiba, Alger', createdAt: ago(152) },
  { id: 's-008', name: 'Comptoir Général du Centre', phone: '0776 04 88 23', address: 'Blida', createdAt: ago(140) },
]

// ----------------------------------------------------------------------------
// Clients
// ----------------------------------------------------------------------------

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c-001', name: 'Karim Belhadj', phone: '0770 55 12 33', createdAt: ago(180) },
  { id: 'c-002', name: 'Amina Cherifi', phone: '0661 20 45 87', createdAt: ago(165) },
  { id: 'c-003', name: 'Restaurant El Djazair', phone: '0555 77 90 12', createdAt: ago(150) },
  { id: 'c-004', name: 'Yacine Mansouri', phone: '0698 33 21 44', createdAt: ago(138) },
  { id: 'c-005', name: 'Boulangerie Es-Salam', phone: '0770 91 04 66', createdAt: ago(120) },
  { id: 'c-006', name: 'Nadia Boukhalfa', phone: '0664 18 52 79', createdAt: ago(104) },
  { id: 'c-007', name: 'Café Central', phone: '0551 46 37 28', createdAt: ago(88) },
  { id: 'c-008', name: 'Sofiane Haddad', phone: '0776 62 15 90', createdAt: ago(70) },
  { id: 'c-009', name: 'Lila Benali', phone: '0791 08 44 31', createdAt: ago(52) },
  { id: 'c-010', name: 'Épicerie du Quartier', phone: '0660 73 29 15', createdAt: ago(34) },
]

// ----------------------------------------------------------------------------
// Purchases — supplier restocking, with a mix of payment statuses
// ----------------------------------------------------------------------------

const purchaseLine = (id: string, quantity: number) => {
  const p = P(id)
  return {
    productId: p.id,
    productName: p.name,
    barcode: p.barcode,
    quantity,
    purchasePrice: p.purchasePrice,
    salePrice: p.salePrice,
    minQuantity: p.minQuantity,
    hasExpiration: p.hasExpiration,
    expirationDate: p.expirationDate,
  }
}

const buildPurchase = (
  id: string,
  reference: string,
  supplierIdx: number,
  lines: Array<[string, number]>,
  daysAgo: number,
  paidRatio: number,
): Purchase => {
  const supplier = INITIAL_SUPPLIERS[supplierIdx]
  const purchaseLines = lines.map(([pid, qty]) => purchaseLine(pid, qty))
  const total = Math.round(purchaseLines.reduce((s, l) => s + l.purchasePrice * l.quantity, 0) * 100) / 100
  const paid = Math.round(total * paidRatio * 100) / 100
  return {
    id,
    reference,
    supplierId: supplier.id,
    supplierName: supplier.name,
    lines: purchaseLines,
    total,
    paid,
    payments: paid > 0 ? [{ id: `pay-${id}`, amount: paid, date: ago(daysAgo), note: paidRatio >= 1 ? 'Règlement intégral' : 'Acompte versé' }] : [],
    date: ago(daysAgo),
    createdAt: ago(daysAgo),
  }
}

export const INITIAL_PURCHASES: Purchase[] = [
  buildPurchase('pu-001', 'ACH-2401', 0, [['p-001', 60], ['p-003', 150], ['p-007', 80], ['p-041', 40]], 58, 1),
  buildPurchase('pu-002', 'ACH-2402', 1, [['p-002', 40], ['p-005', 180], ['p-006', 100]], 45, 1),
  buildPurchase('pu-003', 'ACH-2403', 2, [['p-020', 200], ['p-021', 90], ['p-022', 60], ['p-023', 60]], 31, 0.6),
  buildPurchase('pu-004', 'ACH-2404', 4, [['p-011', 100], ['p-012', 80], ['p-013', 120], ['p-014', 50]], 24, 1),
  buildPurchase('pu-005', 'ACH-2405', 3, [['p-016', 140], ['p-019', 130]], 17, 0.45),
  buildPurchase('pu-006', 'ACH-2406', 6, [['p-031', 60], ['p-032', 160], ['p-033', 90], ['p-034', 70]], 11, 1),
  buildPurchase('pu-007', 'ACH-2407', 5, [['p-017', 110], ['p-018', 70]], 21, 0),
  buildPurchase('pu-008', 'ACH-2408', 7, [['p-035', 120], ['p-036', 80], ['p-037', 40], ['p-038', 100]], 27, 0.5),
  buildPurchase('pu-009', 'ACH-2409', 1, [['p-005', 60], ['p-013', 40], ['p-027', 50]], 6, 1),
]

// ----------------------------------------------------------------------------
// Sales — counter sales spread across the last two months
// ----------------------------------------------------------------------------

const buildSale = (
  id: string,
  reference: string,
  clientIdx: number | null,
  lines: Array<[string, number]>,
  daysAgo: number,
  discount: number,
  paidRatio: number,
): Sale => {
  const client = clientIdx === null ? null : INITIAL_CLIENTS[clientIdx]
  const saleLines = lines.map(([pid, qty]) => {
    const p = P(pid)
    return { productId: p.id, productName: p.name, barcode: p.barcode, quantity: qty, unitPrice: p.salePrice }
  })
  const subtotal = Math.round(saleLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0) * 100) / 100
  const total = Math.round((subtotal - discount) * 100) / 100
  const paid = Math.round(total * paidRatio * 100) / 100
  return {
    id,
    reference,
    clientId: client?.id ?? null,
    clientName: client?.name ?? 'Client de passage',
    lines: saleLines,
    subtotal,
    discount,
    total,
    paid,
    payments: paid > 0 ? [{ id: `sp-${id}`, amount: paid, date: ago(daysAgo), note: paidRatio >= 1 ? 'Payé en espèces' : 'Acompte' }] : [],
    date: ago(daysAgo),
    createdAt: ago(daysAgo),
  }
}

/**
 * Counter sales for the last two months.
 *
 * A supermarket rings up dozens of baskets a day, so the bulk of this list is
 * generated rather than written out — but from a *seeded* generator, so the
 * dataset is identical on every load and across every machine. The hand-written
 * entries at the end pin the specific credit/debt cases the UI needs to show.
 */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Products that move in volume, weighted the way a grocery basket really fills. */
const FAST_MOVERS = [
  'p-020', 'p-003', 'p-005', 'p-015', 'p-027', 'p-013', 'p-016', 'p-032',
  'p-011', 'p-001', 'p-006', 'p-021', 'p-025', 'p-019', 'p-035', 'p-029',
  'p-007', 'p-010', 'p-017', 'p-028', 'p-012', 'p-036', 'p-002', 'p-030',
]

const generatedSales = (): Sale[] => {
  const rnd = mulberry32(20240917)
  const out: Sale[] = []
  let seq = 20000 // kept clear of the pinned VTE-10xx references above

  // A full trading year, so the 12-month trend charts have something to plot.
  // The last two months are ledgered in detail; older months are thinner — enough
  // to carry the monthly totals — and trade slightly lower, giving a gentle
  // upward trend rather than a flat line.
  for (let d = 364; d >= 0; d--) {
    const weekday = new Date(Date.now() - d * DAY).getDay()
    const busy = weekday === 5 || weekday === 6 ? 1.45 : 1
    const recent = d <= 60
    const growth = 0.72 + 0.28 * (1 - d / 364) // older months trade a little lighter
    const base = recent ? 7 + rnd() * 5 : 3 + rnd() * 2
    const count = Math.max(1, Math.round(base * busy * growth))

    for (let n = 0; n < count; n++) {
      const lineCount = 2 + Math.floor(rnd() * 4)
      const picked = new Set<string>()
      while (picked.size < lineCount) {
        picked.add(FAST_MOVERS[Math.floor(rnd() * FAST_MOVERS.length)])
      }

      const lines = [...picked].map((pid) => {
        const p = P(pid)
        return {
          productId: p.id,
          productName: p.name,
          barcode: p.barcode,
          quantity: 1 + Math.floor(rnd() * 5),
          unitPrice: p.salePrice,
        }
      })

      const subtotal = Math.round(lines.reduce((t, l) => t + l.unitPrice * l.quantity, 0) * 100) / 100
      // Most baskets are walk-in and paid in full; a few are account customers.
      const onAccount = rnd() < 0.18
      const clientIdx = onAccount ? Math.floor(rnd() * INITIAL_CLIENTS.length) : null
      const client = clientIdx === null ? null : INITIAL_CLIENTS[clientIdx]
      const discount = rnd() < 0.12 ? Math.round((subtotal * 0.03) / 10) * 10 : 0
      const total = Math.round((subtotal - discount) * 100) / 100
      const paidRatio = onAccount && rnd() < 0.45 ? (rnd() < 0.5 ? 0 : 0.5) : 1
      const paid = Math.round(total * paidRatio * 100) / 100

      seq += 1
      const id = `sa-g${seq}`
      out.push({
        id,
        reference: `VTE-${seq}`,
        clientId: client?.id ?? null,
        clientName: client?.name ?? 'Client de passage',
        lines,
        subtotal,
        discount,
        total,
        paid,
        payments: paid > 0 ? [{ id: `sp-${id}`, amount: paid, date: ago(d), note: paidRatio >= 1 ? 'Payé en espèces' : 'Acompte' }] : [],
        date: ago(d),
        createdAt: ago(d),
      })
    }
  }
  return out
}

export const INITIAL_SALES: Sale[] = [
  // Pinned cases: wholesale baskets and open customer credit.
  buildSale('sa-001', 'VTE-1001', 2, [['p-001', 6], ['p-002', 4], ['p-011', 12]], 47, 200, 1),
  buildSale('sa-004', 'VTE-1004', 4, [['p-002', 8], ['p-004', 10], ['p-003', 20]], 38, 350, 0.55),
  buildSale('sa-009', 'VTE-1009', 2, [['p-005', 24], ['p-006', 15], ['p-011', 18]], 23, 400, 0.4),
  buildSale('sa-013', 'VTE-1013', 9, [['p-001', 10], ['p-007', 12], ['p-008', 6]], 11, 250, 0.6),
  buildSale('sa-016', 'VTE-1016', 4, [['p-002', 6], ['p-006', 10], ['p-005', 20]], 5, 180, 0.5),
  buildSale('sa-020', 'VTE-1020', 0, [['p-010', 4], ['p-030', 5], ['p-003', 10]], 0, 0, 0.65),
  ...generatedSales(),
].sort((a, b) => +new Date(b.date) - +new Date(a.date))

// ----------------------------------------------------------------------------
// Roles & workers
// ----------------------------------------------------------------------------

export const INITIAL_ROLES: string[] = [
  'Administrateur',
  'Gérant',
  'Caissier',
  'Magasinier',
  'Responsable rayon',
  'Agent d’entretien',
]

/** Permission preset for a cashier: POS + sales + clients, read-mostly elsewhere. */
const cashierPermissions = (): Permissions => ({
  dashboard: { enabled: true, actions: ['view'] },
  pos: { enabled: true, actions: ['view', 'create', 'print'] },
  sales: { enabled: true, actions: ['view', 'print'] },
  clients: { enabled: true, actions: ['view', 'create'] },
  caisse: { enabled: true, actions: ['view'] },
})

/** Permission preset for stock staff. */
const stockPermissions = (): Permissions => ({
  dashboard: { enabled: true, actions: ['view'] },
  stock: { enabled: true, actions: ['view', 'create', 'edit', 'print'] },
  purchase: { enabled: true, actions: ['view', 'create', 'edit'] },
  suppliers: { enabled: true, actions: ['view', 'create'] },
})

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-001',
    fullName: 'Mourad Benali',
    birthDate: '1985-04-12',
    idCard: '109845672',
    phone: '0770 44 11 22',
    role: 'Gérant',
    hasSalary: true,
    salaryType: 'monthly',
    salaryAmount: 78000,
    hasAccount: true,
    email: 'mourad.benali@suppirette.dz',
    username: 'mourad',
    password: 'gerant2024',
    permissions: fullPermissions(),
    startDate: ago(720),
    active: true,
    advances: [
      { id: 'adv-001', date: ago(22), description: 'Avance sur salaire', amount: 15000, deducted: false },
    ],
    absences: [],
    payments: [
      { id: 'wp-001', period: '—', baseSalary: 78000, absencesDeducted: 0, advancesDeducted: 0, amount: 78000, date: ago(38), note: 'Salaire mensuel' },
    ],
    createdAt: ago(720),
  },
  {
    id: 'w-002',
    fullName: 'Samira OuldAli',
    birthDate: '1993-09-28',
    idCard: '117320945',
    phone: '0661 77 30 58',
    role: 'Caissier',
    hasSalary: true,
    salaryType: 'monthly',
    salaryAmount: 45000,
    hasAccount: true,
    email: 'samira.ouldali@suppirette.dz',
    username: 'samira',
    password: 'caisse2024',
    permissions: cashierPermissions(),
    startDate: ago(430),
    active: true,
    advances: [],
    absences: [
      { id: 'abs-001', date: ago(16), description: 'Absence maladie (justifiée)', cost: 0 },
    ],
    payments: [
      { id: 'wp-002', period: '—', baseSalary: 45000, absencesDeducted: 0, advancesDeducted: 0, amount: 45000, date: ago(38), note: 'Salaire mensuel' },
    ],
    createdAt: ago(430),
  },
  {
    id: 'w-003',
    fullName: 'Rachid Khelifi',
    birthDate: '1990-02-05',
    idCard: '112660387',
    phone: '0555 19 62 47',
    role: 'Magasinier',
    hasSalary: true,
    salaryType: 'monthly',
    salaryAmount: 42000,
    hasAccount: true,
    email: 'rachid.khelifi@suppirette.dz',
    username: 'rachid',
    password: 'stock2024',
    permissions: stockPermissions(),
    startDate: ago(365),
    active: true,
    advances: [
      { id: 'adv-002', date: ago(9), description: 'Avance exceptionnelle', amount: 8000, deducted: false },
    ],
    absences: [],
    payments: [
      { id: 'wp-003', period: '—', baseSalary: 42000, absencesDeducted: 0, advancesDeducted: 0, amount: 42000, date: ago(38), note: 'Salaire mensuel' },
    ],
    createdAt: ago(365),
  },
  {
    id: 'w-004',
    fullName: 'Hakim Ferhat',
    birthDate: '1997-11-19',
    idCard: '124509831',
    phone: '0698 52 08 76',
    role: 'Responsable rayon',
    hasSalary: true,
    salaryType: 'daily',
    salaryAmount: 1800,
    hasAccount: false,
    email: '',
    username: '',
    password: '',
    permissions: {},
    startDate: ago(190),
    active: true,
    advances: [],
    absences: [
      { id: 'abs-002', date: ago(27), description: 'Absence non justifiée', cost: 1800 },
    ],
    payments: [],
    createdAt: ago(190),
  },
  {
    id: 'w-005',
    fullName: 'Fatima Zerrouki',
    birthDate: '1988-06-30',
    idCard: '108773419',
    phone: '0776 31 49 05',
    role: 'Agent d’entretien',
    hasSalary: true,
    salaryType: 'daily',
    salaryAmount: 1500,
    hasAccount: false,
    email: '',
    username: '',
    password: '',
    permissions: {},
    startDate: ago(96),
    active: true,
    advances: [],
    absences: [],
    payments: [],
    createdAt: ago(96),
  },
]

// ----------------------------------------------------------------------------
// Expenses
// ----------------------------------------------------------------------------

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e-001', name: 'Loyer du local', description: 'Loyer mensuel du magasin', amount: 65000, date: ago(42), createdAt: ago(42) },
  { id: 'e-002', name: 'Facture Sonelgaz', description: 'Électricité et gaz — période bimestrielle', amount: 18400, date: ago(36), createdAt: ago(36) },
  { id: 'e-003', name: 'Transport marchandises', description: 'Livraison depuis Béjaïa', amount: 12000, date: ago(29), createdAt: ago(29) },
  { id: 'e-004', name: 'Maintenance chambre froide', description: 'Entretien du groupe froid', amount: 9500, date: ago(23), createdAt: ago(23) },
  { id: 'e-005', name: 'Sacs et emballages', description: 'Sachets caisse et rouleaux', amount: 6800, date: ago(18), createdAt: ago(18) },
  { id: 'e-006', name: 'Facture eau (ADE)', description: 'Consommation trimestrielle', amount: 4200, date: ago(14), createdAt: ago(14) },
  { id: 'e-007', name: 'Loyer du local', description: 'Loyer mensuel du magasin', amount: 65000, date: ago(11), createdAt: ago(11) },
  { id: 'e-008', name: 'Internet & téléphone', description: 'Abonnement mensuel Algérie Télécom', amount: 3500, date: ago(7), createdAt: ago(7) },
  { id: 'e-009', name: 'Produits d’entretien magasin', description: 'Nettoyage des surfaces de vente', amount: 5100, date: ago(3), createdAt: ago(3) },
]

// ----------------------------------------------------------------------------
// Caisse — manual cash movements
// ----------------------------------------------------------------------------

export const INITIAL_CAISSE: CaisseTransaction[] = [
  { id: 'cx-001', type: 'deposit', amount: 150000, description: 'Fonds de caisse initial', date: ago(60), createdAt: ago(60) },
  { id: 'cx-002', type: 'withdrawal', amount: 40000, description: 'Versement bancaire', date: ago(44), createdAt: ago(44) },
  { id: 'cx-003', type: 'deposit', amount: 25000, description: 'Apport de l’exploitant', date: ago(30), createdAt: ago(30) },
  { id: 'cx-004', type: 'withdrawal', amount: 18000, description: 'Retrait pour achats divers', date: ago(19), createdAt: ago(19) },
  { id: 'cx-005', type: 'deposit', amount: 32000, description: 'Encaissement créance client', date: ago(10), createdAt: ago(10) },
  { id: 'cx-006', type: 'withdrawal', amount: 55000, description: 'Versement bancaire', date: ago(4), createdAt: ago(4) },
]

// ----------------------------------------------------------------------------
// Store settings
// ----------------------------------------------------------------------------

export const INITIAL_SETTINGS: StoreSettings = {
  logo: '',
  name: 'Suppirette Market',
  description: 'Supermarché de proximité — alimentation générale, produits frais et entretien',
  email: 'contact@suppirette.dz',
  phone: '023 45 67 89',
  address: '14, Rue des Frères Bouadou, Birkhadem, Alger',
  nif: '000416001234567',
  nis: '000416009876543',
  article: '16050318745',
  rc: '16/00-1234567B24',
  currency: 'DA',
}

// ----------------------------------------------------------------------------
// Demo administrator — used by the "demo account" button on the login screen.
// ----------------------------------------------------------------------------

export const DEMO_ADMIN: AppUser = {
  id: 'user-demo',
  fullName: 'Admin Démo',
  username: 'demo',
  email: 'demo@suppirette.dz',
  password: 'demo',
  role: 'Administrateur',
  permissions: 'ALL',
  isDemo: true,
}

export const __statusOf = () => ({})
