import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';

/**
 * Coche « livraison gratuite » (freeShipping = true) pour les seuls produits de
 * la catégorie « porc », et la décoche partout ailleurs.
 *
 * Idempotent — peut être relancé sans effet de bord.
 * Usage : cd backend && npm run db:porc-freeshipping
 */
const prisma = new PrismaClient();
const PORC = 'porc'; // slug de catégorie stocké sur Product

async function clearProductCache() {
  const url = process.env.REDIS_URL;
  if (!url) return; // pas de Redis (dev local) → rien à faire
  const redis = new IORedis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  try {
    await redis.connect();
    const keys = await redis.keys('product*');
    if (keys.length) await redis.del(...keys);
    console.log(`Cache Redis vidé : ${keys.length} clé(s)`);
  } catch (e) {
    console.warn('Cache Redis non vidé (le TTL de 5 min s’en chargera) :', (e as Error).message);
  } finally {
    redis.disconnect();
  }
}

async function main() {
  const enabled = await prisma.product.updateMany({
    where: { category: PORC, freeShipping: false },
    data: { freeShipping: true },
  });

  const disabled = await prisma.product.updateMany({
    where: { NOT: { category: PORC }, freeShipping: true },
    data: { freeShipping: false },
  });

  const porc = await prisma.product.findMany({
    where: { category: PORC },
    select: { name: true, freeShipping: true },
  });

  console.log(`Porc → livraison gratuite : ${enabled.count} activé(s)`);
  console.log(`Autres catégories → décoché : ${disabled.count}`);
  console.log('Produits porc :', porc.length ? porc : '(aucun)');

  await clearProductCache();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(process.exitCode ?? 0);
  });
