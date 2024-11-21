/*
  Warnings:

  - Made the column `creatorIp` on table `Pixel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pixel" ALTER COLUMN "creatorIp" SET NOT NULL;
