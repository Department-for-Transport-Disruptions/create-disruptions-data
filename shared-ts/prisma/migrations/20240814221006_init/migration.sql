/*
  Warnings:

  - Changed the type of `validity` on the `disruptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "validity",
ADD COLUMN     "validity" JSONB NOT NULL;
