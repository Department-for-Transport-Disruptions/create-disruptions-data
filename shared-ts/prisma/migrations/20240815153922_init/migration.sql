-- AlterTable
ALTER TABLE "consequences" ALTER COLUMN "disruptionDelay" DROP NOT NULL,
ALTER COLUMN "disruptionDelay" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "consequencesEdited" ALTER COLUMN "disruptionDelay" DROP NOT NULL,
ALTER COLUMN "disruptionDelay" SET DATA TYPE TEXT;
