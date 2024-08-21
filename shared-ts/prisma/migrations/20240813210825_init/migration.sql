-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" SERIAL NOT NULL,
    "disruptions_id" TEXT,
    "account_type" TEXT NOT NULL,
    "created_by_operator_org_id" TEXT,
    "display" TEXT NOT NULL,
    "image" JSONB,
    "message_content" TEXT NOT NULL,
    "social_account" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "social_media_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextdoor_agency_boundaries" (
    "id" SERIAL NOT NULL,
    "group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "social_media_posts_id" INTEGER,

    CONSTRAINT "nextdoor_agency_boundaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disruptions_edited" (
    "id" TEXT NOT NULL,
    "display_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "publish_status" "PublishStatus" NOT NULL,
    "publish_start_date" TEXT NOT NULL,
    "publish_start_time" TEXT NOT NULL,
    "publish_end_date" TEXT,
    "publish_end_time" TEXT,
    "associated_link" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disruptions_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validity_periods_edited" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT,
    "start_date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_date" TEXT,
    "end_time" TEXT,
    "repeats" BOOLEAN NOT NULL DEFAULT false,
    "repeats_end_date" TEXT,

    CONSTRAINT "validity_periods_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequences_edited" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "delay" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "remove_from_journey_planners" BOOLEAN NOT NULL,
    "vehicle_mode" "VehicleMode" NOT NULL,

    CONSTRAINT "consequences_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequence_services_edited" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "consequence_id" INTEGER,

    CONSTRAINT "consequence_services_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequence_stops_edited" (
    "id" SERIAL NOT NULL,
    "stop_id" TEXT NOT NULL,
    "consequence_id" INTEGER,

    CONSTRAINT "consequence_stops_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_posts_edited" (
    "id" SERIAL NOT NULL,
    "disruptions_id" TEXT,
    "account_type" TEXT NOT NULL,
    "created_by_operator_org_id" TEXT,
    "display" TEXT NOT NULL,
    "image" JSONB,
    "message_content" TEXT NOT NULL,
    "social_account" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "social_media_posts_edited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextdoor_agency_boundaries_edited" (
    "id" SERIAL NOT NULL,
    "group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "social_media_posts_id" INTEGER,

    CONSTRAINT "nextdoor_agency_boundaries_edited_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_disruptions_id_fkey" FOREIGN KEY ("disruptions_id") REFERENCES "disruptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nextdoor_agency_boundaries" ADD CONSTRAINT "nextdoor_agency_boundaries_social_media_posts_id_fkey" FOREIGN KEY ("social_media_posts_id") REFERENCES "social_media_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validity_periods_edited" ADD CONSTRAINT "validity_periods_edited_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "disruptions_edited"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequences_edited" ADD CONSTRAINT "consequences_edited_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "disruptions_edited"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequence_services_edited" ADD CONSTRAINT "consequence_services_edited_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "consequences_edited"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequence_stops_edited" ADD CONSTRAINT "consequence_stops_edited_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "consequences_edited"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_posts_edited" ADD CONSTRAINT "social_media_posts_edited_disruptions_id_fkey" FOREIGN KEY ("disruptions_id") REFERENCES "disruptions_edited"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nextdoor_agency_boundaries_edited" ADD CONSTRAINT "nextdoor_agency_boundaries_edited_social_media_posts_id_fkey" FOREIGN KEY ("social_media_posts_id") REFERENCES "social_media_posts_edited"("id") ON DELETE SET NULL ON UPDATE CASCADE;
