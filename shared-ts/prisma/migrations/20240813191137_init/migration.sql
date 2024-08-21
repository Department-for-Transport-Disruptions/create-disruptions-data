-- CreateTable
CREATE TABLE "Disruption" (
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

    CONSTRAINT "Disruption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidityPeriod" (
    "id" SERIAL NOT NULL,
    "disruption_id" TEXT,
    "start_date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_date" TEXT,
    "end_time" TEXT,
    "repeats" BOOLEAN NOT NULL DEFAULT false,
    "repeats_end_date" TEXT,

    CONSTRAINT "ValidityPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consequence" (
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

    CONSTRAINT "Consequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsequenceService" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "consequence_id" INTEGER,

    CONSTRAINT "ConsequenceService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsequenceStop" (
    "id" SERIAL NOT NULL,
    "stop_id" TEXT NOT NULL,
    "consequence_id" INTEGER,

    CONSTRAINT "ConsequenceStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryItem" (
    "id" SERIAL NOT NULL,
    "history_id" INTEGER,

    CONSTRAINT "HistoryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ValidityPeriod" ADD CONSTRAINT "ValidityPeriod_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "Disruption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consequence" ADD CONSTRAINT "Consequence_disruption_id_fkey" FOREIGN KEY ("disruption_id") REFERENCES "Disruption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsequenceService" ADD CONSTRAINT "ConsequenceService_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "Consequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsequenceStop" ADD CONSTRAINT "ConsequenceStop_consequence_id_fkey" FOREIGN KEY ("consequence_id") REFERENCES "Consequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryItem" ADD CONSTRAINT "HistoryItem_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "History"("id") ON DELETE SET NULL ON UPDATE CASCADE;
