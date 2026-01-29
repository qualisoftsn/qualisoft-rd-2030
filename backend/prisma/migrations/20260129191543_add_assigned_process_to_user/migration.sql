/*
  Warnings:

  - A unique constraint covering the columns `[DOC_Reference]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProcessFamily" AS ENUM ('PILOTAGE', 'OPERATIONNEL', 'SUPPORT');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "DOC_ArchivedAt" TIMESTAMP(3),
ADD COLUMN     "DOC_ArchivedById" TEXT,
ADD COLUMN     "DOC_Department" TEXT,
ADD COLUMN     "DOC_NextReviewDate" TIMESTAMP(3),
ADD COLUMN     "DOC_OwnerId" TEXT,
ADD COLUMN     "DOC_Reference" TEXT,
ADD COLUMN     "DOC_ReviewFrequencyMonths" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "DOC_Tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "DV_ApprovedAt" TIMESTAMP(3),
ADD COLUMN     "DV_ApprovedById" TEXT,
ADD COLUMN     "DV_ChangeDescription" TEXT DEFAULT 'Création initiale',
ADD COLUMN     "DV_FileType" TEXT,
ADD COLUMN     "DV_RejectionComment" TEXT;

-- AlterTable
ALTER TABLE "ProcessType" ADD COLUMN     "PT_Family" "ProcessFamily" NOT NULL DEFAULT 'OPERATIONNEL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "U_AssignedProcessId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_DOC_Reference_key" ON "Document"("DOC_Reference");

-- CreateIndex
CREATE INDEX "ProcessType_PT_Family_idx" ON "ProcessType"("PT_Family");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_U_AssignedProcessId_fkey" FOREIGN KEY ("U_AssignedProcessId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_DOC_OwnerId_fkey" FOREIGN KEY ("DOC_OwnerId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_DV_ApprovedById_fkey" FOREIGN KEY ("DV_ApprovedById") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;
