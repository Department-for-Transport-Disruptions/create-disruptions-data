/*
  Warnings:

  - You are about to drop the `socialMediaPosts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `socialMediaPostsEdited` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "socialMediaPosts" DROP CONSTRAINT "socialMediaPosts_disruptionsId_fkey";

-- DropForeignKey
ALTER TABLE "socialMediaPostsEdited" DROP CONSTRAINT "socialMediaPostsEdited_disruptionsId_fkey";

-- AlterTable
ALTER TABLE "disruptions" ADD COLUMN     "socialMediaPosts" JSONB[];

-- AlterTable
ALTER TABLE "disruptionsEdited" ADD COLUMN     "socialMediaPosts" JSONB[];

-- DropTable
DROP TABLE "socialMediaPosts";

-- DropTable
DROP TABLE "socialMediaPostsEdited";
