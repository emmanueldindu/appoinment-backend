-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "consultationFee" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "education" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "phone" TEXT;
