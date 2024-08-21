/*
  Warnings:

  - Made the column `disruptionId` on table `consequences` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "consequences" DROP CONSTRAINT "consequences_disruptionId_fkey";

-- AlterTable
ALTER TABLE "consequences" ALTER COLUMN "disruptionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "consequences" ADD CONSTRAINT "consequences_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "disruptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
