/*
  Warnings:

  - You are about to drop the `Consequence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConsequenceService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConsequenceStop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Disruption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistoryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValidityPeriod` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Consequence" DROP CONSTRAINT "Consequence_disruption_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsequenceService" DROP CONSTRAINT "ConsequenceService_consequence_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsequenceStop" DROP CONSTRAINT "ConsequenceStop_consequence_id_fkey";

-- DropForeignKey
ALTER TABLE "HistoryItem" DROP CONSTRAINT "HistoryItem_history_id_fkey";

-- DropForeignKey
ALTER TABLE "ValidityPeriod" DROP CONSTRAINT "ValidityPeriod_disruption_id_fkey";

-- DropTable
DROP TABLE "Consequence";

-- DropTable
DROP TABLE "ConsequenceService";

-- DropTable
DROP TABLE "ConsequenceStop";

-- DropTable
DROP TABLE "Disruption";

-- DropTable
DROP TABLE "History";

-- DropTable
DROP TABLE "HistoryItem";

-- DropTable
DROP TABLE "ValidityPeriod";

-- CreateTable
CREATE TABLE "disruptions" (
    "id" TEXT NOT NULL,
    "display_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "publish_status" TEXT NOT NULL,
    "publish_start_date" TEXT NOT NULL,
    "publish_start_time" TEXT NOT NULL,
    "publish_end_date" TEXT,
    "publish_end_time" TEXT,
    "associated_link" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disruptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validity_periods" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT,
    "start_date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_date" TEXT,
    "end_time" TEXT,
    "repeats" BOOLEAN NOT NULL DEFAULT false,
    "repeats_end_date" TEXT,

    CONSTRAINT "validity_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequences" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "delay" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "remove_from_journey_planners" BOOLEAN NOT NULL,
    "vehicle_mode" TEXT NOT NULL,

    CONSTRAINT "consequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequence_services" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "consequence_id" INTEGER,

    CONSTRAINT "consequence_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consequence_stops" (
    "id" SERIAL NOT NULL,
    "stop_id" TEXT NOT NULL,
    "consequence_id" INTEGER,

    CONSTRAINT "consequence_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_items" (
    "id" SERIAL NOT NULL,
    "history_id" INTEGER,

    CONSTRAINT "history_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "validity_periods" ADD CONSTRAINT "validity_periods_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "disruptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequences" ADD CONSTRAINT "consequences_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "disruptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequence_services" ADD CONSTRAINT "consequence_services_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "consequences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consequence_stops" ADD CONSTRAINT "consequence_stops_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "consequences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_items" ADD CONSTRAINT "history_items_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
