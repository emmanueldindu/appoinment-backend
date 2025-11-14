/*
  Warnings:

  - You are about to drop the column `endTime` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `availability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,dayOfWeek,timeSlot]` on the table `availability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeSlot` to the `availability` table without a default value. This is not possible if the table is not empty.

*/
-- Delete existing availability data (will be recreated by doctors)
DELETE FROM "availability";

-- AlterTable
ALTER TABLE "availability" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "timeSlot" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "availability_userId_dayOfWeek_timeSlot_key" ON "availability"("userId", "dayOfWeek", "timeSlot");
