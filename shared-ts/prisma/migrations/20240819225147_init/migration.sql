-- AlterTable
ALTER TABLE "consequencesEdited" ADD COLUMN     "consequenceOperators" TEXT[] DEFAULT ARRAY[]::TEXT[];
