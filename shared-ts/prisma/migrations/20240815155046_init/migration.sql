/*
  Warnings:

  - The `services` column on the `consequences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `stops` column on the `consequences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `services` column on the `consequencesEdited` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `stops` column on the `consequencesEdited` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "consequences" DROP COLUMN "services",
ADD COLUMN     "services" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "stops",
ADD COLUMN     "stops" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "consequencesEdited" DROP COLUMN "services",
ADD COLUMN     "services" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "stops",
ADD COLUMN     "stops" JSONB[] DEFAULT ARRAY[]::JSONB[];
