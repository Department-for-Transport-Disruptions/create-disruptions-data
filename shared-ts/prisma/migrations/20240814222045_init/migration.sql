-- AlterTable
ALTER TABLE "disruptions" ALTER COLUMN "disruptionNoEndDateTime" DROP NOT NULL,
ALTER COLUMN "disruptionNoEndDateTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "disruptionsEdited" ALTER COLUMN "disruptionNoEndDateTime" DROP NOT NULL,
ALTER COLUMN "disruptionNoEndDateTime" SET DATA TYPE TEXT;
