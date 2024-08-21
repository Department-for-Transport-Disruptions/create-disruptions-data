/*
  Warnings:

  - Changed the type of `publish_status` on the `disruptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'EDITING', 'PENDING_APPROVAL', 'REJECTED', 'EDIT_PENDING_APPROVAL', 'PENDING_EDITING');

-- AlterTable
ALTER TABLE "disruptions" DROP COLUMN "publish_status",
ADD COLUMN     "publish_status" "PublishStatus" NOT NULL;
