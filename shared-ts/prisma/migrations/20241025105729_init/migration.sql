-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'EDITING', 'PENDING_APPROVAL', 'REJECTED', 'EDIT_PENDING_APPROVAL', 'PENDING_EDITING');

-- CreateEnum
CREATE TYPE "VehicleMode" AS ENUM ('bus', 'tram', 'ferryService', 'rail', 'underground', 'coach');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('unknown', 'normal', 'verySlight', 'slight', 'severe', 'verySevere');

-- CreateTable
CREATE TABLE "disruptions" (
    "id" TEXT NOT NULL,
    "display_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "disruption_reason" TEXT NOT NULL,
    "disruption_type" TEXT NOT NULL,
    "publish_status" "PublishStatus" NOT NULL,
    "publish_start_date" TEXT NOT NULL,
    "publish_start_time" TEXT NOT NULL,
    "publish_end_date" TEXT,
    "publish_end_time" TEXT,
    "disruption_start_date" TEXT NOT NULL,
    "disruption_start_time" TEXT NOT NULL,
    "disruption_end_date" TEXT,
    "disruption_end_time" TEXT,
    "disruption_no_end_date_time" TEXT,
    "disruption_repeats" TEXT,
    "disruption_repeats_end_date" TEXT,
    "validity" JSONB[],
    "created_by_operator_org_id" TEXT,
    "social_media_posts" JSONB[],
    "history" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "permit_reference_number" TEXT,
    "associated_link" TEXT,
    "template" BOOLEAN NOT NULL DEFAULT false,
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disruptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequences" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT NOT NULL,
    "consequence_index" INTEGER NOT NULL,
    "consequence_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "disruption_delay" TEXT,
    "disruption_direction" TEXT,
    "disruption_severity" "Severity" NOT NULL,
    "remove_from_journey_planners" TEXT NOT NULL,
    "vehicle_mode" "VehicleMode" NOT NULL,
    "services" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "stops" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "consequence_operators" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "disruption_area" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "consequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disruptions_edited" (
    "id" TEXT NOT NULL,
    "display_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "disruption_reason" TEXT NOT NULL,
    "disruption_type" TEXT NOT NULL,
    "publish_status" "PublishStatus" NOT NULL,
    "publish_start_date" TEXT NOT NULL,
    "publish_start_time" TEXT NOT NULL,
    "publish_end_date" TEXT,
    "publish_end_time" TEXT,
    "disruption_start_date" TEXT NOT NULL,
    "disruption_start_time" TEXT NOT NULL,
    "disruption_end_date" TEXT,
    "disruption_end_time" TEXT,
    "disruption_no_end_date_time" TEXT,
    "disruption_repeats" TEXT,
    "disruption_repeats_end_date" TEXT,
    "validity" JSONB[],
    "created_by_operator_org_id" TEXT,
    "social_media_posts" JSONB[],
    "history" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "permit_reference_number" TEXT,
    "associated_link" TEXT,
    "template" BOOLEAN NOT NULL DEFAULT false,
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disruptions_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequences_edited" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT,
    "consequence_index" INTEGER NOT NULL,
    "consequence_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "disruption_delay" TEXT,
    "disruption_direction" TEXT,
    "disruption_severity" "Severity" NOT NULL,
    "remove_from_journey_planners" TEXT NOT NULL,
    "vehicle_mode" "VehicleMode" NOT NULL,
    "services" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "stops" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "consequence_operators" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "disruption_area" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "consequences_edited_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consequences_disruption_id_consequence_index_key" ON "consequences"("disruption_id", "consequence_index");

-- CreateIndex
CREATE UNIQUE INDEX "consequences_edited_disruption_id_consequence_index_key" ON "consequences_edited"("disruption_id", "consequence_index");

-- AddForeignKey
ALTER TABLE "consequences" ADD CONSTRAINT "consequences_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "disruptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequences_edited" ADD CONSTRAINT "consequences_edited_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "disruptions_edited"("id") ON DELETE CASCADE ON UPDATE CASCADE;
