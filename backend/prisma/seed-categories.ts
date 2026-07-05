import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialCategories = [
  { name: 'Porc', slug: 'porc', order: 1 },
  { name: 'Poulet', slug: 'poulet', order: 2 },
  { name: 'Poisson', slug: 'poisson', order: 3 },
  { name: 'Akanga (Pintade)', slug: 'akanga', order: 4 },
  { name: 'Caille', slug: 'caille', order: 5 },
  { name: 'Produits transformés', slug: 'transformes', order: 6 },
  { name: 'Oeufs frais', slug: 'oeufs-frais', order: 7 },
  { name: 'Oeufs fécondés', slug: 'oeufs-fecondes', order: 8 },
  { name: 'Poules', slug: 'poules', order: 9 },
  { name: 'Accessoires', slug: 'accessoires', order: 10 },
];

async function main() {
  console.log('Seeding categories...');

  for (const cat of initialCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          isActive: true,
        },
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
