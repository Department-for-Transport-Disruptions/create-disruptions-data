/*
  Warnings:

  - Added the required column `disruptionNoEndDateTime` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionNoEndDateTime` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disruptions" ADD COLUMN     "disruptionNoEndDateTime" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "disruptionsEdited" ADD COLUMN     "disruptionNoEndDateTime" BOOLEAN NOT NULL;
