/*
  Warnings:

  - You are about to drop the column `endTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `appointmentDate` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointmentTime` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_userId_fkey";

-- DropIndex
DROP INDEX "appointments_serviceId_idx";

-- DropIndex
DROP INDEX "appointments_startTime_idx";

-- DropIndex
DROP INDEX "appointments_userId_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "endTime",
DROP COLUMN "serviceId",
DROP COLUMN "startTime",
DROP COLUMN "userId",
ADD COLUMN     "appointmentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "appointmentTime" TEXT NOT NULL,
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_idx" ON "appointments"("appointmentDate");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
