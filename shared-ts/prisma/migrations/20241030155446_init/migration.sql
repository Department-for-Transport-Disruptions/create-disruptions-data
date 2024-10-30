/*
  Warnings:

  - You are about to drop the column `journey_refs` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `service_refs` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `journey_refs` on the `consequences_edited` table. All the data in the column will be lost.
  - You are about to drop the column `service_refs` on the `consequences_edited` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "consequences" DROP COLUMN "journey_refs",
DROP COLUMN "service_refs";

-- AlterTable
ALTER TABLE "consequences_edited" DROP COLUMN "journey_refs",
DROP COLUMN "service_refs";
