-- AlterTable
ALTER TABLE "consequences" ADD COLUMN     "consequenceOperators" TEXT[] DEFAULT ARRAY[]::TEXT[];
