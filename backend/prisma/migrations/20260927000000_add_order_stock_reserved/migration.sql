-- AlterTable
ALTER TABLE "orders" ADD COLUMN "stockReserved" BOOLEAN NOT NULL DEFAULT false;

-- Jusqu'ici, toute commande hors "pending" avait décrémenté le stock à sa création
UPDATE "orders" SET "stockReserved" = true WHERE "status" <> 'pending';
