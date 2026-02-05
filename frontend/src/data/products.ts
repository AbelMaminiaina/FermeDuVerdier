import { Product } from '@/types';

export const products: Product[] = [
  // Œufs frais
  {
    id: 'oeufs-bio-6',
    name: 'Œufs Bio - Boîte de 6',
    slug: 'oeufs-bio-boite-6',
    category: 'oeufs-frais',
    description: 'Nos œufs bio proviennent de poules élevées en plein air, nourries exclusivement avec des aliments certifiés agriculture biologique. Chaque œuf est ramassé à la main quotidiennement pour garantir une fraîcheur optimale. Le jaune est d\'un beau orange vif, signe d\'une alimentation riche et variée.',
    shortDescription: 'Œufs frais de poules élevées en plein air, certifiés bio.',
    price: 20000,
    images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600',
      'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=600',
    ],
    inStock: true,
    stockQuantity: 50,
    badges: ['bio', 'plein-air'],
    metadata: {
      quantity: 6,
    },
    characteristics: [
      'Certification Agriculture Biologique AB',
      'Poules élevées en plein air',
      'Ramassage quotidien',
      'Calibre moyen à gros',
      'Conservation : 28 jours après ponte',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oeufs-bio-12',
    name: 'Œufs Bio - Boîte de 12',
    slug: 'oeufs-bio-boite-12',
    category: 'oeufs-frais',
    description: 'Notre boîte familiale de 12 œufs bio, idéale pour les familles ou les amateurs de pâtisserie. Nos poules pondeuses vivent en liberté dans nos prairies verdoyantes et bénéficient d\'une alimentation 100% biologique.',
    shortDescription: 'Format familial de nos délicieux œufs bio.',
    price: 38000,
    originalPrice: 40000,
    images: [
      'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=600',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600',
    ],
    inStock: true,
    stockQuantity: 35,
    badges: ['bio', 'plein-air', 'populaire'],
    metadata: {
      quantity: 12,
    },
    characteristics: [
      'Certification Agriculture Biologique AB',
      'Poules élevées en plein air',
      'Ramassage quotidien',
      'Calibre moyen à gros',
      'Économie par rapport à la boîte de 6',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oeufs-plein-air-30',
    name: 'Plateau 30 œufs Plein Air',
    slug: 'plateau-30-oeufs-plein-air',
    category: 'oeufs-frais',
    description: 'Le plateau idéal pour les grandes familles ou les professionnels. 30 œufs frais de poules élevées en plein air, parfaits pour la cuisine quotidienne ou vos préparations culinaires.',
    shortDescription: 'Grand plateau de 30 œufs pour les familles nombreuses.',
    price: 80000,
    images: [
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600',
    ],
    inStock: true,
    stockQuantity: 20,
    badges: ['plein-air'],
    metadata: {
      quantity: 30,
    },
    characteristics: [
      'Poules élevées en plein air',
      'Format économique',
      'Idéal pour les familles nombreuses',
      'Calibre moyen',
    ],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },

  // Œufs fécondés
  {
    id: 'oeufs-fecondes-marans',
    name: 'Œufs fécondés Marans',
    slug: 'oeufs-fecondes-marans',
    category: 'oeufs-fecondes',
    description: 'Œufs fécondés de notre lignée de Marans noire cuivrée, célèbre pour ses œufs extra-roux. Taux de fécondité garanti supérieur à 90%. Idéal pour démarrer votre propre élevage avec une race rustique et productive.',
    shortDescription: 'Œufs fécondés pour faire naître vos propres Marans.',
    price: 16000,
    images: [
      'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=600',
    ],
    inStock: true,
    stockQuantity: 24,
    badges: ['plein-air'],
    metadata: {
      race: 'Marans',
      eggColor: 'Roux foncé',
    },
    characteristics: [
      'Race Marans noire cuivrée',
      'Œufs extra-roux',
      'Taux de fécondité > 90%',
      'Envoi en colis sécurisé',
      'Guide d\'incubation inclus',
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'oeufs-fecondes-sussex',
    name: 'Œufs fécondés Sussex',
    slug: 'oeufs-fecondes-sussex',
    category: 'oeufs-fecondes',
    description: 'Œufs fécondés de Sussex herminée, une race anglaise réputée pour sa docilité et sa bonne ponte. Parfaite pour les débutants, elle s\'adapte facilement à tous les environnements.',
    shortDescription: 'Œufs fécondés Sussex, idéal pour débutants.',
    price: 14000,
    images: [
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600',
    ],
    inStock: true,
    stockQuantity: 18,
    badges: ['plein-air', 'populaire'],
    metadata: {
      race: 'Sussex',
      eggColor: 'Crème',
    },
    characteristics: [
      'Race Sussex herminée',
      'Caractère docile',
      'Excellente pondeuse',
      'Résistante au froid',
      'Parfaite pour débuter',
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'oeufs-fecondes-araucana',
    name: 'Œufs fécondés Araucana',
    slug: 'oeufs-fecondes-araucana',
    category: 'oeufs-fecondes',
    description: 'Découvrez les fameux œufs bleus ! L\'Araucana est une race chilienne unique qui pond des œufs naturellement bleu-vert. Une curiosité qui ravira petits et grands.',
    shortDescription: 'Les fameux œufs bleus pour votre basse-cour.',
    price: 18000,
    images: [
      'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600',
    ],
    inStock: true,
    stockQuantity: 12,
    badges: ['nouveau'],
    metadata: {
      race: 'Araucana',
      eggColor: 'Bleu-vert',
    },
    characteristics: [
      'Œufs naturellement bleus',
      'Race originaire du Chili',
      'Très rustique',
      'Ponte régulière',
    ],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
  },
  {
    id: 'oeufs-fecondes-rousse',
    name: 'Œufs fécondés Poule Rousse',
    slug: 'oeufs-fecondes-rousse',
    category: 'oeufs-fecondes',
    description: 'La poule rousse fermière classique, championne de la ponte ! Robuste et facile à élever, elle est parfaite pour une production d\'œufs régulière tout au long de l\'année.',
    shortDescription: 'La classique poule rousse, championne de ponte.',
    price: 11000,
    images: [
      'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=600',
    ],
    inStock: true,
    stockQuantity: 30,
    badges: ['plein-air', 'populaire'],
    metadata: {
      race: 'Rousse fermière',
      eggColor: 'Brun clair',
    },
    characteristics: [
      'Excellente pondeuse (250-300 œufs/an)',
      'Très rustique',
      'Facile à élever',
      'Parfaite pour débuter',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oeufs-fecondes-gauloise',
    name: 'Œufs fécondés Gauloise Dorée',
    slug: 'oeufs-fecondes-gauloise-doree',
    category: 'oeufs-fecondes',
    description: 'La Gauloise dorée, emblème de la France ! Cette race ancestrale au plumage doré magnifique est un véritable patrimoine à préserver. Bonne pondeuse et excellente couveuse.',
    shortDescription: 'Race patrimoniale française au plumage doré.',
    price: 20000,
    images: [
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600',
    ],
    inStock: true,
    stockQuantity: 8,
    badges: ['plein-air'],
    metadata: {
      race: 'Gauloise dorée',
      eggColor: 'Blanc crème',
    },
    characteristics: [
      'Race française patrimoniale',
      'Plumage doré magnifique',
      'Bonne couveuse',
      'Ponte correcte',
    ],
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: 'oeufs-fecondes-soie',
    name: 'Œufs fécondés Poule Soie',
    slug: 'oeufs-fecondes-poule-soie',
    category: 'oeufs-fecondes',
    description: 'La poule Soie, avec son plumage duveteux unique et son caractère adorable. Excellente couveuse et mère adoptive, elle est parfaite comme poule d\'ornement ou pour couver les œufs d\'autres races.',
    shortDescription: 'Poule d\'ornement au plumage soyeux unique.',
    price: 22000,
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
    ],
    inStock: true,
    stockQuantity: 10,
    badges: ['nouveau'],
    metadata: {
      race: 'Soie',
      eggColor: 'Crème',
    },
    characteristics: [
      'Plumage soyeux unique',
      'Excellente couveuse',
      'Très docile',
      'Parfaite avec les enfants',
    ],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10',
  },

  // Poules vivantes
  {
    id: 'poule-rousse-pondeuse',
    name: 'Poule Rousse Pondeuse',
    slug: 'poule-rousse-pondeuse',
    category: 'poules',
    description: 'Notre poule rousse fermière est une valeur sûre ! Pondeuse exceptionnelle (250-300 œufs par an), elle est robuste, facile à vivre et parfaitement adaptée aux jardins familiaux. Elle commence à pondre dès 20-22 semaines.',
    shortDescription: 'La poule pondeuse par excellence, productive et docile.',
    price: 80000,
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600',
    ],
    inStock: true,
    stockQuantity: 25,
    badges: ['plein-air', 'populaire'],
    metadata: {
      race: 'Rousse fermière',
      eggColor: 'Brun',
    },
    characteristics: [
      '250-300 œufs par an',
      'Ponte dès 20-22 semaines',
      'Poids adulte : 2,5-3 kg',
      'Caractère docile',
      'Excellente rusticité',
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'poule-sussex',
    name: 'Poule Sussex Herminée',
    slug: 'poule-sussex-herminee',
    category: 'poules',
    description: 'La Sussex herminée est une magnifique poule au plumage blanc avec le camail et la queue noirs. D\'origine anglaise, elle est réputée pour sa docilité et sa bonne ponte. Une vraie beauté dans votre jardin !',
    shortDescription: 'Élégante poule anglaise au plumage blanc et noir.',
    price: 110000,
    images: [
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
    ],
    inStock: true,
    stockQuantity: 15,
    badges: ['plein-air'],
    metadata: {
      race: 'Sussex',
      eggColor: 'Crème',
    },
    characteristics: [
      '200-250 œufs par an',
      'Plumage blanc herminé',
      'Poids adulte : 3-3,5 kg',
      'Très docile',
      'Bonne chair',
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: 'poule-marans',
    name: 'Poule Marans Noire Cuivrée',
    slug: 'poule-marans-noire-cuivree',
    category: 'poules',
    description: 'La Marans est LA poule française par excellence, célèbre pour ses œufs "extra-roux". Son plumage noir aux reflets cuivrés est magnifique. Une poule élégante qui apportera de la diversité à votre poulailler.',
    shortDescription: 'La reine des œufs extra-roux, plumage noir cuivré.',
    price: 135000,
    images: [
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
    ],
    inStock: true,
    stockQuantity: 12,
    badges: ['plein-air', 'populaire'],
    metadata: {
      race: 'Marans',
      eggColor: 'Roux foncé',
    },
    characteristics: [
      '150-200 œufs extra-roux par an',
      'Race française du terroir',
      'Poids adulte : 2,5-3 kg',
      'Plumage noir cuivré',
      'Rustique',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'poule-araucana',
    name: 'Poule Araucana',
    slug: 'poule-araucana',
    category: 'poules',
    description: 'L\'Araucana vous surprendra avec ses œufs naturellement bleu-vert ! Originaire du Chili, cette poule rustique au physique atypique (sans croupion) est une vraie curiosité. Parfaite pour diversifier la couleur de vos œufs.',
    shortDescription: 'La poule aux œufs bleus, originaire du Chili.',
    price: 155000,
    images: [
      'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600',
    ],
    inStock: true,
    stockQuantity: 8,
    badges: ['nouveau', 'plein-air'],
    metadata: {
      race: 'Araucana',
      eggColor: 'Bleu-vert',
    },
    characteristics: [
      '150-180 œufs bleus par an',
      'Sans croupion (caractéristique)',
      'Touffes d\'oreilles',
      'Très rustique',
      'Originaire du Chili',
    ],
    createdAt: '2024-02-20',
    updatedAt: '2024-02-20',
  },
  {
    id: 'poule-soie-blanche',
    name: 'Poule Soie Blanche',
    slug: 'poule-soie-blanche',
    category: 'poules',
    description: 'La poule Soie est irrésistible avec son plumage duveteux qui ressemble à de la soie ! D\'une douceur incroyable, elle est parfaite comme poule d\'ornement ou compagne pour les enfants. Excellente couveuse, elle peut même couver les œufs d\'autres poules.',
    shortDescription: 'Adorable poule d\'ornement au plumage soyeux.',
    price: 180000,
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600',
    ],
    inStock: true,
    stockQuantity: 6,
    badges: ['nouveau'],
    metadata: {
      race: 'Soie',
      eggColor: 'Crème',
    },
    characteristics: [
      '80-100 œufs par an',
      'Plumage soyeux unique',
      'Peau et os noirs',
      'Excellente couveuse',
      'Très docile avec les enfants',
    ],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
  },

  // Accessoires
  {
    id: 'poulailler-standard',
    name: 'Poulailler Bois 4-6 Poules',
    slug: 'poulailler-bois-4-6-poules',
    category: 'accessoires',
    description: 'Poulailler en bois traité autoclave, parfait pour 4 à 6 poules. Comprend un pondoir, un perchoir et un tiroir à déjections amovible pour un nettoyage facile. Toit bitumé imperméable.',
    shortDescription: 'Poulailler robuste en bois pour 4 à 6 poules.',
    price: 850000,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600',
    ],
    inStock: true,
    stockQuantity: 5,
    badges: [],
    metadata: {
      dimensions: '150x80x100 cm',
    },
    characteristics: [
      'Capacité : 4-6 poules',
      'Bois traité autoclave',
      'Toit bitumé imperméable',
      'Pondoir avec trappe de collecte',
      'Tiroir à déjections amovible',
      'Livré en kit à monter',
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'aliment-poules-pondeuses-20kg',
    name: 'Aliment Poules Pondeuses Bio 20kg',
    slug: 'aliment-poules-pondeuses-bio-20kg',
    category: 'accessoires',
    description: 'Aliment complet bio pour poules pondeuses, formulé pour une ponte optimale. Mélange de céréales bio (blé, maïs, orge), protéines végétales et minéraux. Sans OGM ni antibiotiques.',
    shortDescription: 'Aliment complet bio pour une ponte optimale.',
    price: 112000,
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
    ],
    inStock: true,
    stockQuantity: 40,
    badges: ['bio', 'populaire'],
    metadata: {
      weight: '20 kg',
    },
    characteristics: [
      'Certifié Agriculture Biologique',
      'Sans OGM',
      'Sans antibiotiques',
      'Riche en calcium',
      'Pour poules à partir de 18 semaines',
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
  {
    id: 'melange-cereales-10kg',
    name: 'Mélange Céréales Bio 10kg',
    slug: 'melange-cereales-bio-10kg',
    category: 'accessoires',
    description: 'Complément alimentaire à base de céréales bio entières : blé, maïs concassé, avoine, tournesol. À distribuer en complément de l\'aliment principal pour varier l\'alimentation de vos poules.',
    shortDescription: 'Mélange de céréales bio en complément.',
    price: 72000,
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
    ],
    inStock: true,
    stockQuantity: 30,
    badges: ['bio'],
    metadata: {
      weight: '10 kg',
    },
    characteristics: [
      'Céréales 100% bio',
      'Blé, maïs, avoine, tournesol',
      'En complément de l\'aliment',
      'À distribuer l\'après-midi',
    ],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
  },
  {
    id: 'abreuvoir-automatique',
    name: 'Abreuvoir Automatique 5L',
    slug: 'abreuvoir-automatique-5l',
    category: 'accessoires',
    description: 'Abreuvoir à réserve de 5 litres avec niveau constant. Pratique et hygiénique, il assure un approvisionnement en eau fraîche permanent. Facile à nettoyer et à remplir.',
    shortDescription: 'Abreuvoir pratique à remplissage facile.',
    price: 58000,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    ],
    inStock: true,
    stockQuantity: 35,
    badges: [],
    characteristics: [
      'Capacité 5 litres',
      'Niveau d\'eau constant',
      'Plastique alimentaire',
      'Facile à nettoyer',
      'Pour 4-8 poules',
    ],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: 'mangeoire-anti-gaspillage',
    name: 'Mangeoire Anti-Gaspillage 10kg',
    slug: 'mangeoire-anti-gaspillage-10kg',
    category: 'accessoires',
    description: 'Mangeoire avec grille anti-gaspillage qui empêche les poules de gratter et projeter la nourriture. Réserve de 10 kg pour plusieurs jours d\'autonomie. Idéale pour les week-ends ou vacances courtes.',
    shortDescription: 'Mangeoire grande capacité anti-gaspillage.',
    price: 135000,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    ],
    inStock: true,
    stockQuantity: 20,
    badges: ['populaire'],
    characteristics: [
      'Capacité 10 kg',
      'Grille anti-gaspillage',
      'Couvercle étanche',
      'Sur pieds réglables',
      'Pour 6-10 poules',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
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
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.metadata?.race?.toLowerCase().includes(lowercaseQuery)
  );
}
