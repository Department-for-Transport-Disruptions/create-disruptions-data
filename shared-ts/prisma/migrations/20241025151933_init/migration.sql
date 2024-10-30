/*
  Warnings:

  - You are about to drop the column `template` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `disruptions_edited` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "template",
ADD COLUMN     "is_template" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "disruptions_edited" DROP COLUMN "template",
ADD COLUMN     "is_template" BOOLEAN NOT NULL DEFAULT false;
