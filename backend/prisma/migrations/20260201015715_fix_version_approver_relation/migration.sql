/*
  Warnings:

  - You are about to drop the column `AW_ApprovedAt` on the `ApprovalWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `AW_Comment` on the `ApprovalWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `AW_CreatedAt` on the `ApprovalWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `AW_UpdatedAt` on the `ApprovalWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `AU_Conclusion` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `AU_UpdatedAt` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `CL_NewValue` on the `ChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `CL_OldValue` on the `ChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `CP_CreatedAt` on the `Competence` table. All the data in the column will be lost.
  - You are about to drop the column `CP_UpdatedAt` on the `Competence` table. All the data in the column will be lost.
  - You are about to drop the column `CON_UpdatedAt` on the `Consumption` table. All the data in the column will be lost.
  - You are about to drop the column `DOC_ArchivedById` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `DOC_Department` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `DV_ApprovedAt` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `DV_ChangeDescription` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `DV_FileSize` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `DV_FileType` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `DV_IsActive` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `DV_RejectionComment` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `EQ_CreatedAt` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `EQ_UpdatedAt` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `FI_CreatedAt` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `FOR_CreatedAt` on the `Formation` table. All the data in the column will be lost.
  - You are about to drop the column `FOR_Expiry` on the `Formation` table. All the data in the column will be lost.
  - You are about to drop the column `FOR_UpdatedAt` on the `Formation` table. All the data in the column will be lost.
  - You are about to drop the column `GA_AnalysisPeriod` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_Comments` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_Deadline` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_EffectiveDate` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_IpDate` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_Location` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_Observations` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_Theme` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `GA_UpdatedAt` on the `GovernanceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `MG_Report` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `MG_UpdatedAt` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `MA_IsActive` on the `MeetingAttendee` table. All the data in the column will be lost.
  - You are about to drop the column `NC_Diagnostic` on the `NonConformite` table. All the data in the column will be lost.
  - You are about to drop the column `NC_IsActive` on the `NonConformite` table. All the data in the column will be lost.
  - You are about to drop the column `NC_Source` on the `NonConformite` table. All the data in the column will be lost.
  - You are about to drop the column `NC_UpdatedAt` on the `NonConformite` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_AuditAnalysis` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_CreatedAt` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_Decisions` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_DocRef` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_IsActive` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_PerformanceAnalysis` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_PiloteSigned` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_RQSigned` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_ResourcesAnalysis` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_RiskAnalysis` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `PRV_UpdatedAt` on the `ProcessReview` table. All the data in the column will be lost.
  - You are about to drop the column `REC_CreatedAt` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `REC_DateTransmitted` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `REC_Deadline` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `REC_Gravity` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `REC_IsActive` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `REC_Source` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `REC_UpdatedAt` on the `Reclamation` table. All the data in the column will be lost.
  - You are about to drop the column `RD_CreatedAt` on the `RevueDirection` table. All the data in the column will be lost.
  - You are about to drop the column `RD_UpdatedAt` on the `RevueDirection` table. All the data in the column will be lost.
  - You are about to drop the column `SAL_IpAddress` on the `SecurityAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `SAL_IsActive` on the `SecurityAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `SAL_UserAgent` on the `SecurityAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `SIG_CreatedAt` on the `Signature` table. All the data in the column will be lost.
  - You are about to drop the column `SIG_Metadata` on the `Signature` table. All the data in the column will be lost.
  - You are about to drop the column `TK_Description` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `TK_Response` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `TK_ResponseAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `TK_UpdatedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `TR_CreatedAt` on the `Tier` table. All the data in the column will be lost.
  - You are about to drop the column `TR_Email` on the `Tier` table. All the data in the column will be lost.
  - You are about to drop the column `TR_Phone` on the `Tier` table. All the data in the column will be lost.
  - You are about to drop the column `TR_UpdatedAt` on the `Tier` table. All the data in the column will be lost.
  - You are about to drop the column `TX_AdminComment` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `TX_Currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `TX_ProofUrl` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `TX_UpdatedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `UC_CreatedAt` on the `UserCompetence` table. All the data in the column will be lost.
  - You are about to drop the column `UC_IsActive` on the `UserCompetence` table. All the data in the column will be lost.
  - You are about to drop the column `UC_UpdatedAt` on the `UserCompetence` table. All the data in the column will be lost.
  - You are about to drop the column `WAS_UpdatedAt` on the `Waste` table. All the data in the column will be lost.
  - You are about to drop the `userHabilitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RiskStatus" ADD VALUE 'CRITIQUE';
ALTER TYPE "RiskStatus" ADD VALUE 'ANNULE';

-- AlterEnum
ALTER TYPE "SSEType" ADD VALUE 'INCIDENT_ENVIRONNEMENTAL';

-- DropForeignKey
ALTER TABLE "userHabilitation" DROP CONSTRAINT "userHabilitation_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "userHabilitation" DROP CONSTRAINT "userHabilitation_userId_fkey";

-- DropIndex
DROP INDEX "Action_tenantId_ACT_Priority_idx";

-- DropIndex
DROP INDEX "Action_tenantId_ACT_ResponsableId_ACT_Status_idx";

-- DropIndex
DROP INDEX "ApprovalWorkflow_AW_ApproverId_AW_Status_idx";

-- DropIndex
DROP INDEX "ApprovalWorkflow_tenantId_AW_EntityType_AW_EntityId_idx";

-- DropIndex
DROP INDEX "ApprovalWorkflow_tenantId_AW_Status_idx";

-- DropIndex
DROP INDEX "Audit_AU_DateAudit_idx";

-- DropIndex
DROP INDEX "Audit_tenantId_AU_Status_idx";

-- DropIndex
DROP INDEX "Audit_tenantId_AU_Type_idx";

-- DropIndex
DROP INDEX "Audit_tenantId_idx";

-- DropIndex
DROP INDEX "ChangeLog_CL_UserId_idx";

-- DropIndex
DROP INDEX "ChangeLog_tenantId_CL_EntityType_CL_EntityId_idx";

-- DropIndex
DROP INDEX "ChangeLog_tenantId_CL_Timestamp_idx";

-- DropIndex
DROP INDEX "Competence_tenantId_idx";

-- DropIndex
DROP INDEX "Consumption_CON_Month_CON_Year_idx";

-- DropIndex
DROP INDEX "Consumption_tenantId_CON_SiteId_idx";

-- DropIndex
DROP INDEX "Consumption_tenantId_idx";

-- DropIndex
DROP INDEX "Document_tenantId_DOC_Category_idx";

-- DropIndex
DROP INDEX "Document_tenantId_DOC_Status_idx";

-- DropIndex
DROP INDEX "Equipment_tenantId_EQ_Status_idx";

-- DropIndex
DROP INDEX "Equipment_tenantId_idx";

-- DropIndex
DROP INDEX "Finding_FI_AuditId_idx";

-- DropIndex
DROP INDEX "Formation_tenantId_FOR_UserId_idx";

-- DropIndex
DROP INDEX "Formation_tenantId_idx";

-- DropIndex
DROP INDEX "GovernanceActivity_GA_DatePlanned_idx";

-- DropIndex
DROP INDEX "GovernanceActivity_tenantId_GA_Status_idx";

-- DropIndex
DROP INDEX "GovernanceActivity_tenantId_idx";

-- DropIndex
DROP INDEX "Indicator_IND_Code_tenantId_key";

-- DropIndex
DROP INDEX "Indicator_tenantId_IND_ProcessusId_idx";

-- DropIndex
DROP INDEX "Indicator_tenantId_idx";

-- DropIndex
DROP INDEX "IndicatorValue_IV_IndicatorId_IV_Month_IV_Year_key";

-- DropIndex
DROP INDEX "IndicatorValue_IV_IndicatorId_IV_Status_idx";

-- DropIndex
DROP INDEX "IndicatorValue_IV_Month_IV_Year_idx";

-- DropIndex
DROP INDEX "InterestedParty_tenantId_IP_Type_idx";

-- DropIndex
DROP INDEX "InterestedParty_tenantId_idx";

-- DropIndex
DROP INDEX "Meeting_MG_Date_idx";

-- DropIndex
DROP INDEX "Meeting_tenantId_MG_Status_idx";

-- DropIndex
DROP INDEX "Meeting_tenantId_idx";

-- DropIndex
DROP INDEX "NonConformite_NC_ProcessusId_NC_Statut_idx";

-- DropIndex
DROP INDEX "NonConformite_tenantId_NC_Statut_idx";

-- DropIndex
DROP INDEX "NonConformite_tenantId_idx";

-- DropIndex
DROP INDEX "Notification_tenantId_idx";

-- DropIndex
DROP INDEX "Notification_userId_N_IsRead_idx";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- DropIndex
DROP INDEX "OrganizationContext_tenantId_OC_Type_idx";

-- DropIndex
DROP INDEX "OrganizationContext_tenantId_idx";

-- DropIndex
DROP INDEX "PAQ_PAQ_ProcessusId_PAQ_Year_tenantId_key";

-- DropIndex
DROP INDEX "PAQ_tenantId_PAQ_Status_idx";

-- DropIndex
DROP INDEX "PAQ_tenantId_idx";

-- DropIndex
DROP INDEX "ProcessReview_tenantId_PRV_Status_idx";

-- DropIndex
DROP INDEX "ProcessReview_tenantId_idx";

-- DropIndex
DROP INDEX "ProcessType_PT_Family_idx";

-- DropIndex
DROP INDEX "Processus_tenantId_PR_PiloteId_idx";

-- DropIndex
DROP INDEX "QualityObjective_tenantId_QO_OwnerId_idx";

-- DropIndex
DROP INDEX "QualityObjective_tenantId_QO_Status_idx";

-- DropIndex
DROP INDEX "QualityObjective_tenantId_idx";

-- DropIndex
DROP INDEX "Reclamation_tenantId_REC_OwnerId_idx";

-- DropIndex
DROP INDEX "Reclamation_tenantId_REC_Status_idx";

-- DropIndex
DROP INDEX "Reclamation_tenantId_idx";

-- DropIndex
DROP INDEX "RevueDirection_RD_Date_idx";

-- DropIndex
DROP INDEX "RevueDirection_tenantId_idx";

-- DropIndex
DROP INDEX "Risk_tenantId_RS_ProcessusId_idx";

-- DropIndex
DROP INDEX "SSEEvent_tenantId_SSE_Type_idx";

-- DropIndex
DROP INDEX "SSEStats_ST_Mois_ST_Annee_idx";

-- DropIndex
DROP INDEX "SSEStats_tenantId_idx";

-- DropIndex
DROP INDEX "SecurityAuditLog_SAL_Timestamp_idx";

-- DropIndex
DROP INDEX "SecurityAuditLog_SAL_UserId_idx";

-- DropIndex
DROP INDEX "SecurityAuditLog_tenantId_idx";

-- DropIndex
DROP INDEX "Signature_SIG_EntityType_SIG_EntityId_idx";

-- DropIndex
DROP INDEX "Signature_tenantId_idx";

-- DropIndex
DROP INDEX "Ticket_tenantId_TK_Status_idx";

-- DropIndex
DROP INDEX "Ticket_tenantId_idx";

-- DropIndex
DROP INDEX "Tier_TR_Id_tenantId_key";

-- DropIndex
DROP INDEX "Tier_tenantId_TR_Type_idx";

-- DropIndex
DROP INDEX "Tier_tenantId_idx";

-- DropIndex
DROP INDEX "Transaction_TX_Status_idx";

-- DropIndex
DROP INDEX "Transaction_tenantId_idx";

-- DropIndex
DROP INDEX "Waste_WAS_Month_WAS_Year_idx";

-- DropIndex
DROP INDEX "Waste_tenantId_WAS_SiteId_idx";

-- DropIndex
DROP INDEX "Waste_tenantId_idx";

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "ACT_RiskId" TEXT;

-- AlterTable
ALTER TABLE "ApprovalWorkflow" DROP COLUMN "AW_ApprovedAt",
DROP COLUMN "AW_Comment",
DROP COLUMN "AW_CreatedAt",
DROP COLUMN "AW_UpdatedAt";

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "AU_Conclusion",
DROP COLUMN "AU_UpdatedAt";

-- AlterTable
ALTER TABLE "ChangeLog" DROP COLUMN "CL_NewValue",
DROP COLUMN "CL_OldValue";

-- AlterTable
ALTER TABLE "Competence" DROP COLUMN "CP_CreatedAt",
DROP COLUMN "CP_UpdatedAt";

-- AlterTable
ALTER TABLE "Consumption" DROP COLUMN "CON_UpdatedAt";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "DOC_ArchivedById",
DROP COLUMN "DOC_Department";

-- AlterTable
ALTER TABLE "DocumentVersion" DROP COLUMN "DV_ApprovedAt",
DROP COLUMN "DV_ChangeDescription",
DROP COLUMN "DV_FileSize",
DROP COLUMN "DV_FileType",
DROP COLUMN "DV_IsActive",
DROP COLUMN "DV_RejectionComment";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "EQ_CreatedAt",
DROP COLUMN "EQ_UpdatedAt";

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "FI_CreatedAt";

-- AlterTable
ALTER TABLE "Formation" DROP COLUMN "FOR_CreatedAt",
DROP COLUMN "FOR_Expiry",
DROP COLUMN "FOR_UpdatedAt";

-- AlterTable
ALTER TABLE "GovernanceActivity" DROP COLUMN "GA_AnalysisPeriod",
DROP COLUMN "GA_Comments",
DROP COLUMN "GA_Deadline",
DROP COLUMN "GA_EffectiveDate",
DROP COLUMN "GA_IpDate",
DROP COLUMN "GA_Location",
DROP COLUMN "GA_Observations",
DROP COLUMN "GA_Theme",
DROP COLUMN "GA_UpdatedAt";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "MG_Report",
DROP COLUMN "MG_UpdatedAt";

-- AlterTable
ALTER TABLE "MeetingAttendee" DROP COLUMN "MA_IsActive";

-- AlterTable
ALTER TABLE "NonConformite" DROP COLUMN "NC_Diagnostic",
DROP COLUMN "NC_IsActive",
DROP COLUMN "NC_Source",
DROP COLUMN "NC_UpdatedAt";

-- AlterTable
ALTER TABLE "ProcessReview" DROP COLUMN "PRV_AuditAnalysis",
DROP COLUMN "PRV_CreatedAt",
DROP COLUMN "PRV_Decisions",
DROP COLUMN "PRV_DocRef",
DROP COLUMN "PRV_IsActive",
DROP COLUMN "PRV_PerformanceAnalysis",
DROP COLUMN "PRV_PiloteSigned",
DROP COLUMN "PRV_RQSigned",
DROP COLUMN "PRV_ResourcesAnalysis",
DROP COLUMN "PRV_RiskAnalysis",
DROP COLUMN "PRV_UpdatedAt";

-- AlterTable
ALTER TABLE "Reclamation" DROP COLUMN "REC_CreatedAt",
DROP COLUMN "REC_DateTransmitted",
DROP COLUMN "REC_Deadline",
DROP COLUMN "REC_Gravity",
DROP COLUMN "REC_IsActive",
DROP COLUMN "REC_Source",
DROP COLUMN "REC_UpdatedAt";

-- AlterTable
ALTER TABLE "RevueDirection" DROP COLUMN "RD_CreatedAt",
DROP COLUMN "RD_UpdatedAt";

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN     "RS_Contexte" TEXT;

-- AlterTable
ALTER TABLE "SSEEvent" ADD COLUMN     "SSE_CreatorId" TEXT,
ADD COLUMN     "SSE_Metadata" JSONB;

-- AlterTable
ALTER TABLE "SecurityAuditLog" DROP COLUMN "SAL_IpAddress",
DROP COLUMN "SAL_IsActive",
DROP COLUMN "SAL_UserAgent";

-- AlterTable
ALTER TABLE "Signature" DROP COLUMN "SIG_CreatedAt",
DROP COLUMN "SIG_Metadata";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "TK_Description",
DROP COLUMN "TK_Response",
DROP COLUMN "TK_ResponseAt",
DROP COLUMN "TK_UpdatedAt";

-- AlterTable
ALTER TABLE "Tier" DROP COLUMN "TR_CreatedAt",
DROP COLUMN "TR_Email",
DROP COLUMN "TR_Phone",
DROP COLUMN "TR_UpdatedAt";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "TX_AdminComment",
DROP COLUMN "TX_Currency",
DROP COLUMN "TX_ProofUrl",
DROP COLUMN "TX_UpdatedAt";

-- AlterTable
ALTER TABLE "UserCompetence" DROP COLUMN "UC_CreatedAt",
DROP COLUMN "UC_IsActive",
DROP COLUMN "UC_UpdatedAt";

-- AlterTable
ALTER TABLE "Waste" DROP COLUMN "WAS_UpdatedAt";

-- AlterTable
ALTER TABLE "_ParticipantsCauserie" ADD CONSTRAINT "_ParticipantsCauserie_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ParticipantsCauserie_AB_unique";

-- AlterTable
ALTER TABLE "_ProcessGovernance" ADD CONSTRAINT "_ProcessGovernance_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProcessGovernance_AB_unique";

-- DropTable
DROP TABLE "userHabilitation";

-- CreateTable
CREATE TABLE "UserHabilitation" (
    "UH_Id" TEXT NOT NULL,
    "UH_Label" TEXT NOT NULL,
    "UH_DateObtained" TIMESTAMP(3) NOT NULL,
    "UH_Status" "HabStatus" NOT NULL DEFAULT 'ACTIVE',
    "UH_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "UserHabilitation_pkey" PRIMARY KEY ("UH_Id")
);

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_RiskId_fkey" FOREIGN KEY ("ACT_RiskId") REFERENCES "Risk"("RS_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEEvent" ADD CONSTRAINT "SSEEvent_SSE_CreatorId_fkey" FOREIGN KEY ("SSE_CreatorId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHabilitation" ADD CONSTRAINT "UserHabilitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHabilitation" ADD CONSTRAINT "UserHabilitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;
