/*
  Warnings:

  - You are about to drop the column `LC_UpdatedAt` on the `LegalChecklist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LegalChecklist" DROP COLUMN "LC_UpdatedAt",
ALTER COLUMN "LC_Description" DROP NOT NULL,
ALTER COLUMN "LC_Criteria" DROP NOT NULL;
