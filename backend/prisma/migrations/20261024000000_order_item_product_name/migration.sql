-- Nom du produit figé sur la ligne de commande, pour pouvoir supprimer un produit déjà commandé
ALTER TABLE "order_items" ADD COLUMN "productName" TEXT;

UPDATE "order_items" oi SET "productName" = p."name"
FROM "products" p WHERE p."id" = oi."productId";

UPDATE "order_items" SET "productName" = 'Produit supprimé' WHERE "productName" IS NULL;

ALTER TABLE "order_items" ALTER COLUMN "productName" SET NOT NULL;

-- Supprimer un produit détache ses lignes de commande au lieu d'être refusé
ALTER TABLE "order_items" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
