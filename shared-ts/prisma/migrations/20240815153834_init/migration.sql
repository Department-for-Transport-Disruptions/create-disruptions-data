/*
  Warnings:

  - You are about to drop the column `delay` on the `consequencesEdited` table. All the data in the column will be lost.
  - You are about to drop the column `direction` on the `consequencesEdited` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `consequencesEdited` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `consequencesEdited` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `consequencesEdited` table. All the data in the column will be lost.
  - Added the required column `consequenceIndex` to the `consequencesEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consequenceType` to the `consequencesEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionDelay` to the `consequencesEdited` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disruptionSeverity` to the `consequencesEdited` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "consequencesEdited" DROP COLUMN "delay",
DROP COLUMN "direction",
DROP COLUMN "index",
DROP COLUMN "severity",
DROP COLUMN "type",
ADD COLUMN     "consequenceIndex" INTEGER NOT NULL,
ADD COLUMN     "consequenceType" TEXT NOT NULL,
ADD COLUMN     "disruptionDelay" INTEGER NOT NULL,
ADD COLUMN     "disruptionDirection" TEXT,
ADD COLUMN     "disruptionSeverity" "Severity" NOT NULL;
