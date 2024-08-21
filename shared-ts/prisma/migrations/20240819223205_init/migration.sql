-- AlterTable
ALTER TABLE "consequences" ADD COLUMN     "disruptionArea" TEXT[] DEFAULT ARRAY[]::TEXT[];
