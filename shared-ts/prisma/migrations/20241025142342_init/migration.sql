/*
  Warnings:

  - Made the column `disruption_id` on table `consequences_edited` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "consequences_edited" ALTER COLUMN "disruption_id" SET NOT NULL;
