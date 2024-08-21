/*
  Warnings:

  - Changed the type of `severity` on the `consequences` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vehicle_mode` on the `consequences` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VehicleMode" AS ENUM ('bus', 'tram', 'ferryService', 'rail', 'underground');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('unknown', 'normal', 'verySlight', 'slight', 'severe', 'verySevere');

-- AlterTable
ALTER TABLE "consequences" DROP COLUMN "severity",
ADD COLUMN     "severity" "Severity" NOT NULL,
DROP COLUMN "vehicle_mode",
ADD COLUMN     "vehicle_mode" "VehicleMode" NOT NULL;
