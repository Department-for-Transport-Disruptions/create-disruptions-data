/*
  Warnings:

  - You are about to drop the column `organisationId` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `validityPeriods` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `organisationId` on the `disruptionsEdited` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `disruptionsEdited` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `disruptionsEdited` table. All the data in the column will be lost.
  - You are about to drop the column `validityPeriods` on the `disruptionsEdited` table. All the data in the column will be lost.
  - Added the required column `disruptionReason` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionType` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validity` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionReason` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionType` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validity` to the `disruptionsEdited` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "organisationId",
DROP COLUMN "reason",
DROP COLUMN "type",
DROP COLUMN "validityPeriods",
ADD COLUMN     "disruptionReason" TEXT NOT NULL,
ADD COLUMN     "disruptionType" TEXT NOT NULL,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "validity" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "disruptionsEdited" DROP COLUMN "organisationId",
DROP COLUMN "reason",
DROP COLUMN "type",
DROP COLUMN "validityPeriods",
ADD COLUMN     "disruptionReason" TEXT NOT NULL,
ADD COLUMN     "disruptionType" TEXT NOT NULL,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "validity" JSONB NOT NULL;
