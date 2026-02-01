-- AlterTable
ALTER TABLE "ApprovalWorkflow" ADD COLUMN     "AW_ApprovedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "DV_ChangeDescription" TEXT;

-- AlterTable
ALTER TABLE "Reclamation" ADD COLUMN     "REC_Deadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN     "RS_ExigencesLegales" TEXT,
ADD COLUMN     "RS_Opportunite" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "TX_AdminComment" TEXT,
ADD COLUMN     "TX_ProofUrl" TEXT;
