-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "budgetRange" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "travelStyle" TEXT[] DEFAULT ARRAY[]::TEXT[];
