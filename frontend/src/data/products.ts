import { Product } from '@/types';

export const products: Product[] = [
  // ==================== VIANDE DE PORC ====================
  {
    id: 'porc-entier',
    name: 'Porc Entier',
    slug: 'porc-entier',
    category: 'porc',
    description: 'Porc entier élevé dans nos enclos spacieux à la Ferme du Vardier. Nos porcs bénéficient d\'une alimentation de qualité et d\'un environnement sain pour une viande tendre et savoureuse. Idéal pour les grandes occasions, mariages et événements familiaux.',
    shortDescription: 'Porc entier de notre élevage, viande de qualité supérieure.',
    price: 800000,
    images: [
      '/images/porc/test4.jpeg',
      '/images/porc/WhatsApp Image 2026-02-17 at 00.43.17.jpeg',
    ],
    inStock: true,
    stockQuantity: 10,
    badges: ['populaire'],
    metadata: {
      weight: '80-100 kg',
    },
    characteristics: [
      'Poids approximatif : 80-100 kg',
      'Élevage responsable',
      'Alimentation de qualité',
      'Sans antibiotiques de croissance',
      'Livraison possible à Antananarivo',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'demi-porc',
    name: 'Demi Porc',
    slug: 'demi-porc',
    category: 'porc',
    description: 'Demi-porc de notre élevage, parfait pour les familles ou les petits restaurants. Viande fraîche et de qualité, élevée dans le respect du bien-être animal.',
    shortDescription: 'Demi-porc frais, idéal pour les familles.',
    price: 420000,
    images: [
      '/images/porc/WhatsApp Image 2026-02-17 at 00.43.17.jpeg',
    ],
    inStock: true,
    stockQuantity: 15,
    badges: ['populaire'],
    metadata: {
      weight: '40-50 kg',
    },
    characteristics: [
      'Poids approximatif : 40-50 kg',
      'Coupe au choix',
      'Viande fraîche',
      'Élevage local',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  // ==================== POISSONS ====================
  {
    id: 'tilapia-lot-3kg',
    name: 'Tilapia - Lot de 3kg',
    slug: 'tilapia-lot-3kg',
    category: 'poisson',
    description: 'Lot de 3kg de tilapia frais. Parfait pour les familles ou les petits événements.',
    shortDescription: 'Lot familial de tilapia frais.',
    price: 55000,
    originalPrice: 60000,
    images: [
      'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600',
    ],
    inStock: true,
    stockQuantity: 30,
    badges: ['promo'],
    metadata: {
      weight: '3 kg',
    },
    characteristics: [
      'Poids : 3 kg',
      'Économie de 5 000 Ar',
      'Idéal pour famille',
      'Fraîcheur garantie',
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'tilapia-lot-5kg',
    name: 'Tilapia - Lot de 5kg',
    slug: 'tilapia-lot-5kg',
    category: 'poisson',
    description: 'Lot économique de 5kg de tilapia frais. Parfait pour les familles nombreuses ou les petits commerces.',
    shortDescription: 'Lot économique de tilapia frais.',
    price: 90000,
    originalPrice: 100000,
    images: [
      'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600',
    ],
    inStock: true,
    stockQuantity: 25,
    badges: ['promo', 'populaire'],
    metadata: {
      weight: '5 kg',
    },
    characteristics: [
      'Poids : 5 kg',
      'Économie de 10 000 Ar',
      'Idéal pour revente',
      'Fraîcheur garantie',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  // ==================== PRODUITS TRANSFORMÉS ====================
  {
    id: 'lard-fume-500g',
    name: 'Lard Fumé (500g)',
    slug: 'lard-fume-500g',
    category: 'transformes',
    description: 'Lard fumé artisanalement sur bois de fruit. Parfait pour cuisiner et donner du goût à vos plats.',
    shortDescription: 'Lard fumé artisanal pour cuisine.',
    price: 18000,
    images: [
      '/images/porc/WhatsApp Image 2026-02-17 at 00.43.17.jpeg',
    ],
    inStock: true,
    stockQuantity: 35,
    badges: [],
    metadata: {
      weight: '500 g',
    },
    characteristics: [
      'Poids : 500 g',
      'Fumage au bois de fruit',
      'Conservation longue',
      'Goût authentique',
    ],
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: 'assortiment-charcuterie',
    name: 'Assortiment Charcuterie',
    slug: 'assortiment-charcuterie',
    category: 'transformes',
    description: 'Assortiment de charcuterie artisanale préparée avec notre viande de porc : saucisson, lard fumé et pâté. Idéal pour l\'apéritif ou les repas festifs.',
    shortDescription: 'Assortiment de charcuterie artisanale.',
    price: 45000,
    images: [
      '/images/porc/test4.jpeg',
    ],
    inStock: true,
    stockQuantity: 20,
    badges: ['populaire'],
    metadata: {
      weight: '800 g environ',
    },
    characteristics: [
      'Saucisson artisanal',
      'Lard fumé',
      'Pâté maison',
      'Préparation traditionnelle',
    ],
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return products;
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
  );
}
