/*
  Warnings:

  - You are about to drop the `validity_periods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `validity_periods_edited` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `validity_periods` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validity_periods` to the `disruptions_edited` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "validity_periods" DROP CONSTRAINT "validity_periods_disruption_id_fkey";

-- DropForeignKey
ALTER TABLE "validity_periods_edited" DROP CONSTRAINT "validity_periods_edited_disruption_id_fkey";

-- AlterTable
ALTER TABLE "disruptions" ADD COLUMN     "validity_periods" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "disruptions_edited" ADD COLUMN     "validity_periods" JSONB NOT NULL;

-- DropTable
DROP TABLE "validity_periods";

-- DropTable
DROP TABLE "validity_periods_edited";
