/*
  Warnings:

  - The `validity` column on the `disruptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validity` column on the `disruptionsEdited` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `disruptionStartDate` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionStartTime` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "validity",
ADD COLUMN     "validity" JSONB[];

-- AlterTable
ALTER TABLE "disruptionsEdited" ADD COLUMN     "disruptionEndDate" TEXT,
ADD COLUMN     "disruptionEndTime" TEXT,
ADD COLUMN     "disruptionRepeats" TEXT,
ADD COLUMN     "disruptionRepeatsEndDate" TEXT,
ADD COLUMN     "disruptionStartDate" TEXT NOT NULL,
ADD COLUMN     "disruptionStartTime" TEXT NOT NULL,
DROP COLUMN "validity",
ADD COLUMN     "validity" JSONB[];
