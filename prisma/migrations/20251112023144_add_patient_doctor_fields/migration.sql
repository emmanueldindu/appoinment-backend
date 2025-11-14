/*
  Warnings:

  - The values [CLIENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('CARDIOLOGIST', 'DERMATOLOGIST', 'PEDIATRICIAN', 'NEUROLOGIST', 'ORTHOPEDIC', 'PSYCHIATRIST', 'GENERAL_PHYSICIAN', 'GYNECOLOGIST', 'OPHTHALMOLOGIST', 'ENT_SPECIALIST', 'DENTIST', 'OTHER');

-- Update existing CLIENT records to PATIENT before altering enum
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'CLIENT';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE 
    WHEN "role"::text = 'CLIENT' THEN 'PATIENT'::text
    ELSE "role"::text
  END::"Role_new"
);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PATIENT';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "specialty" "Specialty",
ALTER COLUMN "role" SET DEFAULT 'PATIENT';
