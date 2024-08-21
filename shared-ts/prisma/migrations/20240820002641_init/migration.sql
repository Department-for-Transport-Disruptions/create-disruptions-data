-- DropForeignKey
ALTER TABLE "consequences" DROP CONSTRAINT "consequences_disruptionId_fkey";

-- DropForeignKey
ALTER TABLE "consequencesEdited" DROP CONSTRAINT "consequencesEdited_disruptionId_fkey";

-- AddForeignKey
ALTER TABLE "consequences" ADD CONSTRAINT "consequences_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "disruptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequencesEdited" ADD CONSTRAINT "consequencesEdited_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "disruptionsEdited"("id") ON DELETE CASCADE ON UPDATE CASCADE;
