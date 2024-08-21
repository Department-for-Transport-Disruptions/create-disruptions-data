/*
  Warnings:

  - You are about to drop the `history` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "disruptions" ADD COLUMN     "history" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "disruptionsEdited" ADD COLUMN     "history" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- DropTable
DROP TABLE "history";
