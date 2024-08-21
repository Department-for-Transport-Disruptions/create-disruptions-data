/*
  Warnings:

  - A unique constraint covering the columns `[disruptionId,consequenceIndex]` on the table `consequences` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[disruptionId,consequenceIndex]` on the table `consequencesEdited` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "consequences_disruptionId_consequenceIndex_key" ON "consequences"("disruptionId", "consequenceIndex");

-- CreateIndex
CREATE UNIQUE INDEX "consequencesEdited_disruptionId_consequenceIndex_key" ON "consequencesEdited"("disruptionId", "consequenceIndex");
