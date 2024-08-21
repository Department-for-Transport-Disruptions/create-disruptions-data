/*
  Warnings:

  - You are about to drop the column `isTemplate` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `isTemplate` on the `disruptionsEdited` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "isTemplate",
ADD COLUMN     "template" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "disruptionsEdited" DROP COLUMN "isTemplate",
ADD COLUMN     "template" BOOLEAN NOT NULL DEFAULT false;
