import { PrismaClient, ProductCategory, ProductBadge } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migration des produits (sans supprimer les données existantes)...');

  // 1. Désactiver les produits qui ne sont plus vendus
  const productsToDisable = [
    'porc-entier',
    'demi-porc',
    'cotes-de-porc-1kg',
    'filet-de-porc-1kg',
    'poitrine-de-porc-1kg',
    'poulet-entier-fermier',
    'cuisses-de-poulet-1kg',
    'filets-de-poulet-1kg',
    'ailes-de-poulet-1kg',
    'lot-5-poulets-fermiers',
    'tilapia-lot-5kg',
    'saucisses-de-porc-500g',
    'lard-fume-500g',
    'boudin-noir-4pcs',
    'oeufs-bio-boite-12',
    'plateau-30-oeufs-plein-air',
    'oeufs-extra-frais-jour-6',
    'oeufs-gros-calibre-12',
    'oeufs-marans-6',
    'oeufs-bleus-araucana-6',
    'oeufs-fecondes-marans',
    'oeufs-fecondes-sussex',
    'oeufs-fecondes-araucana',
    'poule-rousse-pondeuse',
    'poule-sussex-herminee',
    'poule-marans-noire-cuivree',
    'poule-araucana',
    'poule-soie-blanche',
    'poulailler-bois-4-6-poules',
    'aliment-poules-pondeuses-bio-20kg',
    'abreuvoir-automatique-5l',
    'mangeoire-anti-gaspillage-10kg',
  ];

  console.log('Désactivation des produits non vendus...');
  for (const slug of productsToDisable) {
    await prisma.product.updateMany({
      where: { slug },
      data: { inStock: false, stockQuantity: 0 },
    });
  }
  console.log(`${productsToDisable.length} produits désactivés`);

  // 2. Mettre à jour ou créer le Porc Entier Mort
  console.log('Mise à jour/création des nouveaux produits...');

  await prisma.product.upsert({
    where: { slug: 'porc-entier-mort' },
    update: {
      name: 'Porc Entier Mort',
      price: 12000,
      inStock: true,
      stockQuantity: 50,
    },
    create: {
      name: 'Porc Entier Mort',
      slug: 'porc-entier-mort',
      category: 'porc' as ProductCategory,
      description: 'Porc entier déjà abattu, élevé dans nos enclos spacieux à la Ferme du Vardier. Vendu au kg, idéal pour les grandes occasions, mariages et événements familiaux.',
      shortDescription: 'Porc entier mort de notre élevage, vendu au kg.',
      price: 12000,
      images: ['/images/porc/test4.jpeg'],
      inStock: true,
      stockQuantity: 50,
      badges: ['populaire'] as ProductBadge[],
      characteristics: ['Vendu au kg', 'Élevage responsable', 'Sans antibiotiques de croissance', 'Livraison possible'],
      weight: '1 kg',
    },
  });

  // 3. Créer les nouveaux produits volailles
  const newProducts = [
    {
      name: 'Akoho Gasy (Poulet Entier)',
      slug: 'akoho-gasy-poulet-entier',
      category: 'poulet' as ProductCategory,
      description: 'Poulet fermier malgache (Akoho Gasy) élevé en plein air à la Ferme du Vardier. Chair ferme et savoureuse, idéal pour les plats traditionnels.',
      shortDescription: 'Poulet fermier malgache entier, élevé en plein air.',
      price: 25000,
      images: ['/images/chickens/Akoho2.jpeg'],
      inStock: true,
      stockQuantity: 30,
      badges: ['plein_air', 'populaire'] as ProductBadge[],
      characteristics: ['Poids: 1,5-2 kg', 'Élevé en plein air', 'Alimentation naturelle', 'Chair ferme et savoureuse'],
      weight: '1,5-2 kg',
    },
    {
      name: 'Akoho Mena (Poulet Roux)',
      slug: 'akoho-mena-poulet-roux',
      category: 'poulet' as ProductCategory,
      description: 'Poulet roux fermier malgache élevé en plein air à la Ferme du Vardier. Viande tendre et goûteuse.',
      shortDescription: 'Poulet roux fermier malgache entier.',
      price: 28000,
      images: ['/images/chickens/Akoho3.jpeg'],
      inStock: true,
      stockQuantity: 25,
      badges: ['plein_air', 'populaire'] as ProductBadge[],
      characteristics: ['Poids: 1,5-2 kg', 'Élevé en plein air', 'Alimentation naturelle', 'Viande tendre'],
      weight: '1,5-2 kg',
    },
    {
      name: 'Akoho Mainty (Poulet Noir)',
      slug: 'akoho-mainty-poulet-noir',
      category: 'poulet' as ProductCategory,
      description: 'Poulet noir fermier malgache élevé en plein air à la Ferme du Vardier. Chair ferme et savoureuse, très prisé.',
      shortDescription: 'Poulet noir fermier malgache entier.',
      price: 30000,
      images: ['/images/chickens/Akoho4.jpeg'],
      inStock: true,
      stockQuantity: 20,
      badges: ['plein_air', 'nouveau'] as ProductBadge[],
      characteristics: ['Poids: 1,5-2 kg', 'Élevé en plein air', 'Alimentation naturelle', 'Chair ferme très prisée'],
      weight: '1,5-2 kg',
    },
    {
      name: 'Caille Entière',
      slug: 'caille-entiere',
      category: 'caille' as ProductCategory,
      description: 'Caille fermière élevée à la Ferme du Vardier. Viande délicate et raffinée, parfaite pour les repas gastronomiques.',
      shortDescription: 'Caille fermière entière, viande délicate.',
      price: 15000,
      images: ['/images/caille/caille1.jpeg'],
      inStock: true,
      stockQuantity: 40,
      badges: ['nouveau', 'plein_air'] as ProductBadge[],
      characteristics: ['Poids: 150-200g', 'Viande délicate', 'Élevage fermier', 'Idéal pour repas gastronomique'],
      weight: '150-200g',
    },
    {
      name: 'Akanga (Pintade)',
      slug: 'akanga-pintade',
      category: 'akanga' as ProductCategory,
      description: 'Pintade (Akanga) élevée en plein air à la Ferme du Vardier. Viande goûteuse et savoureuse, entre le poulet et le gibier.',
      shortDescription: 'Pintade fermière entière, viande savoureuse.',
      price: 35000,
      images: ['/images/akanga/Akanga1.jpeg'],
      inStock: true,
      stockQuantity: 20,
      badges: ['plein_air', 'populaire'] as ProductBadge[],
      characteristics: ['Poids: 1-1,5 kg', 'Viande goûteuse', 'Élevé en plein air', 'Entre poulet et gibier'],
      weight: '1-1,5 kg',
    },
    {
      name: 'Œufs Fécondés - Boîte de 6',
      slug: 'oeufs-fecondes-boite-6',
      category: 'oeufs_fecondes' as ProductCategory,
      description: 'Œufs fécondés de notre élevage, prêts pour l\'incubation. Idéal pour démarrer votre propre élevage de poules.',
      shortDescription: 'Œufs fécondés pour incubation, boîte de 6.',
      price: 18000,
      images: ['https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600'],
      inStock: true,
      stockQuantity: 30,
      badges: ['plein_air', 'populaire'] as ProductBadge[],
      characteristics: ['Boîte de 6 œufs', 'Taux de fécondité > 90%', 'Guide d\'incubation inclus', 'Races variées'],
      quantity: 6,
    },
  ];

  for (const product of newProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        images: product.images,
        inStock: true,
        stockQuantity: product.stockQuantity,
      },
      create: product,
    });
    console.log(`Produit créé/mis à jour: ${product.name}`);
  }

  // 4. S'assurer que les produits existants actifs sont bien en stock
  const productsToEnable = [
    'tilapia-frais-1kg',
    'tilapia-entier-piece',
    'oeufs-bio-boite-6',
  ];

  for (const slug of productsToEnable) {
    await prisma.product.updateMany({
      where: { slug },
      data: { inStock: true },
    });
  }
  console.log('Produits actifs vérifiés');

  console.log('Migration terminée avec succès!');
}

main()
  .catch((e) => {
    console.error('Erreur lors de la migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
