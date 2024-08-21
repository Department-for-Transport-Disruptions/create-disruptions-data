-- AlterTable
ALTER TABLE "validity_periods" ALTER COLUMN "repeats" DROP NOT NULL,
ALTER COLUMN "repeats" DROP DEFAULT,
ALTER COLUMN "repeats" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "validity_periods_edited" ALTER COLUMN "repeats" DROP NOT NULL,
ALTER COLUMN "repeats" DROP DEFAULT,
ALTER COLUMN "repeats" SET DATA TYPE TEXT;
