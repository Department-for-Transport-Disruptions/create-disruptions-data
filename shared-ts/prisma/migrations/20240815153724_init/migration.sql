/*
  Warnings:

  - You are about to drop the column `delay` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `direction` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `consequences` table. All the data in the column will be lost.
  - Added the required column `consequenceIndex` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consequenceType` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionDelay` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionSeverity` to the `consequences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "consequences" DROP COLUMN "delay",
DROP COLUMN "direction",
DROP COLUMN "index",
DROP COLUMN "severity",
DROP COLUMN "type",
ADD COLUMN     "consequenceIndex" INTEGER NOT NULL,
ADD COLUMN     "consequenceType" TEXT NOT NULL,
ADD COLUMN     "disruptionDelay" INTEGER NOT NULL,
ADD COLUMN     "disruptionDirection" TEXT,
ADD COLUMN     "disruptionSeverity" "Severity" NOT NULL;
