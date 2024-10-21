/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `View` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `View` table. All the data in the column will be lost.
  - Added the required column `emailSubject` to the `Pixel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientEmail` to the `Pixel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pixel" ADD COLUMN     "emailSubject" TEXT NOT NULL,
ADD COLUMN     "recipientEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "View" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent";
