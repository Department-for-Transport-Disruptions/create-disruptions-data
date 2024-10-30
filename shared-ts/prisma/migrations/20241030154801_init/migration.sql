-- AlterTable
ALTER TABLE "consequences_edited" ADD COLUMN     "journey_refs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "journeys" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "service_refs" TEXT[] DEFAULT ARRAY[]::TEXT[];
