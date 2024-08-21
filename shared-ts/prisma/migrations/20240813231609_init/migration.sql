/*
  Warnings:

  - You are about to drop the column `disruption_id` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `remove_from_journey_planners` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_mode` on the `consequences` table. All the data in the column will be lost.
  - You are about to drop the column `associated_link` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_operator_org_id` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `creation_time` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `display_id` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `is_template` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `last_updated` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `organisation_id` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `publish_end_date` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `publish_end_time` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `publish_start_date` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `publish_start_time` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `publish_status` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the column `validity_periods` on the `disruptions` table. All the data in the column will be lost.
  - You are about to drop the `consequence_services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consequence_services_edited` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consequence_stops` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consequence_stops_edited` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consequences_edited` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disruptions_edited` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `history_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nextdoor_agency_boundaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nextdoor_agency_boundaries_edited` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `social_media_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `social_media_posts_edited` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `removeFromJourneyPlanners` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `services` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stops` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleMode` to the `consequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayId` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisationId` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishStartDate` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishStartTime` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishStatus` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validityPeriods` to the `disruptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "consequence_services" DROP CONSTRAINT "consequence_services_consequence_id_fkey";

-- DropForeignKey
ALTER TABLE "consequence_services_edited" DROP CONSTRAINT "consequence_services_edited_consequence_id_fkey";

-- DropForeignKey
ALTER TABLE "consequence_stops" DROP CONSTRAINT "consequence_stops_consequence_id_fkey";

-- DropForeignKey
ALTER TABLE "consequence_stops_edited" DROP CONSTRAINT "consequence_stops_edited_consequence_id_fkey";

-- DropForeignKey
ALTER TABLE "consequences" DROP CONSTRAINT "consequences_disruption_id_fkey";

-- DropForeignKey
ALTER TABLE "consequences_edited" DROP CONSTRAINT "consequences_edited_disruption_id_fkey";

-- DropForeignKey
ALTER TABLE "history_items" DROP CONSTRAINT "history_items_history_id_fkey";

-- DropForeignKey
ALTER TABLE "nextdoor_agency_boundaries" DROP CONSTRAINT "nextdoor_agency_boundaries_social_media_posts_id_fkey";

-- DropForeignKey
ALTER TABLE "nextdoor_agency_boundaries_edited" DROP CONSTRAINT "nextdoor_agency_boundaries_edited_social_media_posts_id_fkey";

-- DropForeignKey
ALTER TABLE "social_media_posts" DROP CONSTRAINT "social_media_posts_disruptions_id_fkey";

-- DropForeignKey
ALTER TABLE "social_media_posts_edited" DROP CONSTRAINT "social_media_posts_edited_disruptions_id_fkey";

-- AlterTable
ALTER TABLE "consequences" DROP COLUMN "disruption_id",
DROP COLUMN "remove_from_journey_planners",
DROP COLUMN "vehicle_mode",
ADD COLUMN     "disruptionId" TEXT,
ADD COLUMN     "removeFromJourneyPlanners" BOOLEAN NOT NULL,
ADD COLUMN     "services" JSONB NOT NULL,
ADD COLUMN     "stops" JSONB NOT NULL,
ADD COLUMN     "vehicleMode" "VehicleMode" NOT NULL;

-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "associated_link",
DROP COLUMN "created_by_operator_org_id",
DROP COLUMN "creation_time",
DROP COLUMN "display_id",
DROP COLUMN "is_template",
DROP COLUMN "last_updated",
DROP COLUMN "organisation_id",
DROP COLUMN "publish_end_date",
DROP COLUMN "publish_end_time",
DROP COLUMN "publish_start_date",
DROP COLUMN "publish_start_time",
DROP COLUMN "publish_status",
DROP COLUMN "validity_periods",
ADD COLUMN     "associatedLink" TEXT,
ADD COLUMN     "createdByOperatorOrgId" TEXT,
ADD COLUMN     "creationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayId" TEXT NOT NULL,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "organisationId" TEXT NOT NULL,
ADD COLUMN     "publishEndDate" TEXT,
ADD COLUMN     "publishEndTime" TEXT,
ADD COLUMN     "publishStartDate" TEXT NOT NULL,
ADD COLUMN     "publishStartTime" TEXT NOT NULL,
ADD COLUMN     "publishStatus" "PublishStatus" NOT NULL,
ADD COLUMN     "validityPeriods" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "history" ADD COLUMN     "items" JSONB NOT NULL;

-- DropTable
DROP TABLE "consequence_services";

-- DropTable
DROP TABLE "consequence_services_edited";

-- DropTable
DROP TABLE "consequence_stops";

-- DropTable
DROP TABLE "consequence_stops_edited";

-- DropTable
DROP TABLE "consequences_edited";

-- DropTable
DROP TABLE "disruptions_edited";

-- DropTable
DROP TABLE "history_items";

-- DropTable
DROP TABLE "nextdoor_agency_boundaries";

-- DropTable
DROP TABLE "nextdoor_agency_boundaries_edited";

-- DropTable
DROP TABLE "social_media_posts";

-- DropTable
DROP TABLE "social_media_posts_edited";

-- CreateTable
CREATE TABLE "socialMediaPosts" (
    "id" SERIAL NOT NULL,
    "disruptionsId" TEXT,
    "accountType" TEXT NOT NULL,
    "createdByOperatorOrgId" TEXT,
    "display" TEXT NOT NULL,
    "image" JSONB,
    "messageContent" TEXT NOT NULL,
    "nextdoorAgencyBoundaries" JSONB NOT NULL,
    "socialAccount" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "socialMediaPosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disruptionsEdited" (
    "id" TEXT NOT NULL,
    "displayId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL,
    "publishStartDate" TEXT NOT NULL,
    "publishStartTime" TEXT NOT NULL,
    "publishEndDate" TEXT,
    "publishEndTime" TEXT,
    "createdByOperatorOrgId" TEXT,
    "validityPeriods" JSONB NOT NULL,
    "associatedLink" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "creationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disruptionsEdited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequencesEdited" (
    "id" SERIAL NOT NULL,
    "disruptionId" TEXT,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "delay" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "removeFromJourneyPlanners" BOOLEAN NOT NULL,
    "vehicleMode" "VehicleMode" NOT NULL,
    "services" JSONB,
    "stops" JSONB,

    CONSTRAINT "consequencesEdited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socialMediaPostsEdited" (
    "id" SERIAL NOT NULL,
    "disruptionsId" TEXT,
    "accountType" TEXT NOT NULL,
    "createdByOperatorOrgId" TEXT,
    "display" TEXT NOT NULL,
    "image" JSONB,
    "messageContent" TEXT NOT NULL,
    "nextdoorAgencyBoundaries" JSONB,
    "socialAccount" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "socialMediaPostsEdited_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consequences" ADD CONSTRAINT "consequences_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "disruptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socialMediaPosts" ADD CONSTRAINT "socialMediaPosts_disruptionsId_fkey" FOREIGN KEY ("disruptionsId") REFERENCES "disruptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequencesEdited" ADD CONSTRAINT "consequencesEdited_disruptionId_fkey" FOREIGN KEY ("disruptionId") REFERENCES "disruptionsEdited"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socialMediaPostsEdited" ADD CONSTRAINT "socialMediaPostsEdited_disruptionsId_fkey" FOREIGN KEY ("disruptionsId") REFERENCES "disruptionsEdited"("id") ON DELETE SET NULL ON UPDATE CASCADE;
