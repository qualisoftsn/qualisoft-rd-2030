/*
  Warnings:

  - A unique constraint covering the columns `[IV_IndicatorId,IV_Month,IV_Year]` on the table `IndicatorValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `AU_UpdatedAt` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EQ_UpdatedAt` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FOR_UpdatedAt` to the `Formation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GA_UpdatedAt` to the `GovernanceActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MG_UpdatedAt` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NC_UpdatedAt` to the `NonConformite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PRV_UpdatedAt` to the `ProcessReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `REC_UpdatedAt` to the `Reclamation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TK_UpdatedAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TR_UpdatedAt` to the `Tier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UH_UpdatedAt` to the `UserHabilitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApprovalWorkflow" ADD COLUMN     "AW_Comment" TEXT,
ADD COLUMN     "AW_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "AU_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "DOC_ArchivedById" TEXT;

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "DV_ApprovedAt" TIMESTAMP(3),
ADD COLUMN     "DV_FileSize" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "DV_FileType" TEXT,
ADD COLUMN     "DV_RejectionComment" TEXT;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "EQ_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "FOR_Expiry" TIMESTAMP(3),
ADD COLUMN     "FOR_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "GovernanceActivity" ADD COLUMN     "GA_Deadline" TIMESTAMP(3),
ADD COLUMN     "GA_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "MG_Report" TEXT,
ADD COLUMN     "MG_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NonConformite" ADD COLUMN     "NC_Diagnostic" TEXT,
ADD COLUMN     "NC_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "NC_Source" "NCSource" NOT NULL DEFAULT 'INTERNAL_AUDIT',
ADD COLUMN     "NC_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProcessReview" ADD COLUMN     "PRV_AuditAnalysis" TEXT,
ADD COLUMN     "PRV_Decisions" TEXT,
ADD COLUMN     "PRV_DocRef" TEXT DEFAULT 'F-QLT-011',
ADD COLUMN     "PRV_PerformanceAnalysis" TEXT,
ADD COLUMN     "PRV_PiloteSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "PRV_RQSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "PRV_ResourcesAnalysis" TEXT,
ADD COLUMN     "PRV_RiskAnalysis" TEXT,
ADD COLUMN     "PRV_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Reclamation" ADD COLUMN     "REC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "REC_DateTransmitted" TIMESTAMP(3),
ADD COLUMN     "REC_Gravity" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "REC_Source" TEXT DEFAULT 'DIRECT',
ADD COLUMN     "REC_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN     "RS_PartiesInteressees" TEXT;

-- AlterTable
ALTER TABLE "Signature" ADD COLUMN     "SIG_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "SIG_Metadata" JSONB;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "TK_Response" TEXT,
ADD COLUMN     "TK_ResponseAt" TIMESTAMP(3),
ADD COLUMN     "TK_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tier" ADD COLUMN     "TR_Email" TEXT,
ADD COLUMN     "TR_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "TX_Currency" TEXT NOT NULL DEFAULT 'XOF';

-- AlterTable
ALTER TABLE "UserCompetence" ADD COLUMN     "UC_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserHabilitation" ADD COLUMN     "UH_ExpiryDate" TIMESTAMP(3),
ADD COLUMN     "UH_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorValue_IV_IndicatorId_IV_Month_IV_Year_key" ON "IndicatorValue"("IV_IndicatorId", "IV_Month", "IV_Year");
