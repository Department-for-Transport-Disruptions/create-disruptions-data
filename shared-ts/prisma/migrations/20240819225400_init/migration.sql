/*
  Warnings:

  - The `consequenceOperators` column on the `consequences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `consequenceOperators` column on the `consequencesEdited` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "consequences" DROP COLUMN "consequenceOperators",
ADD COLUMN     "consequenceOperators" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "consequencesEdited" DROP COLUMN "consequenceOperators",
ADD COLUMN     "consequenceOperators" JSONB[] DEFAULT ARRAY[]::JSONB[];
