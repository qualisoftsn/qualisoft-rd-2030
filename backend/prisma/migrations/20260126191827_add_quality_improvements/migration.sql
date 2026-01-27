/*
  Warnings:

  - The values [FREE,BASIC,PRO] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - The `NC_Gravite` column on the `NonConformite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `NC_Statut` column on the `NonConformite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `RS_Status` column on the `Risk` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[IND_Code,tenantId]` on the table `Indicator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[MA_MeetingId,MA_UserId]` on the table `MeetingAttendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,ST_Mois,ST_Annee]` on the table `SSEStats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CS_UpdatedAt` to the `Causerie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CP_UpdatedAt` to the `Competence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EQ_UpdatedAt` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FOR_UpdatedAt` to the `Formation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `IND_UpdatedAt` to the `Indicator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NC_UpdatedAt` to the `NonConformite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `OU_UpdatedAt` to the `OrgUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RD_UpdatedAt` to the `RevueDirection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SSE_UpdatedAt` to the `SSEEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `S_UpdatedAt` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TR_UpdatedAt` to the `Tier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TX_UpdatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UC_UpdatedAt` to the `UserCompetence` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContextType" AS ENUM ('ENJEU_INTERNE', 'ENJEU_EXTERNE', 'PARTIE_INTERESSEE', 'REGLEMENTAIRE');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('CLIENT', 'AUTORITE', 'ACTIONNAIRE', 'EMPLOYE', 'FOURNISSEUR', 'CONCURRENT', 'COLLECTIVITE', 'ONG');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('BROUILLON', 'EN_COURS', 'ATTEINT', 'NON_ATTEINT', 'REPORTE', 'ANNULE');

-- CreateEnum
CREATE TYPE "PAQStatus" AS ENUM ('BROUILLON', 'EN_COURS', 'CLOTURE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'DANGER', 'SSE_ALERT', 'DEADLINE_ALERT');

-- CreateEnum
CREATE TYPE "HabStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('INTERNE', 'EXTERNE', 'CERTIFICATION', 'SURVEILLANCE', 'TIERCE_PARTIE');

-- CreateEnum
CREATE TYPE "NCGravity" AS ENUM ('MINEURE', 'MAJEURE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "NCStatus" AS ENUM ('DETECTION', 'ANALYSE', 'ACTION_EN_COURS', 'VERIFICATION', 'CLOTURE');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('IDENTIFIE', 'EVALUE', 'TRAITE', 'ACCEPTE', 'SURVEILLE');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE', 'ANNULE');

-- CreateEnum
CREATE TYPE "ChangeAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE');

-- AlterEnum
ALTER TYPE "ActionOrigin" ADD VALUE 'OBJECTIF';

-- AlterEnum
ALTER TYPE "DocCategory" ADD VALUE 'FORMULAIRE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NCSource" ADD VALUE 'PROCESS_REVIEW';
ALTER TYPE "NCSource" ADD VALUE 'MANAGEMENT_REVIEW';

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('ESSAI', 'EMERGENCE', 'CROISSANCE', 'ENTREPRISE', 'GROUPE');
ALTER TABLE "Tenant" ALTER COLUMN "T_Plan" DROP DEFAULT;
ALTER TABLE "Tenant" ALTER COLUMN "T_Plan" TYPE "Plan_new" USING ("T_Plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "Plan_old";
ALTER TABLE "Tenant" ALTER COLUMN "T_Plan" SET DEFAULT 'ESSAI';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'RQ';
ALTER TYPE "Role" ADD VALUE 'OBSERVATEUR';

-- AlterEnum
ALTER TYPE "TierType" ADD VALUE 'SOUS_TRAITANT';

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "ACT_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "AU_Conclusion" TEXT,
ADD COLUMN     "AU_DateRapport" TIMESTAMP(3),
ADD COLUMN     "AU_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "AU_NormesRef" TEXT[],
ADD COLUMN     "AU_Type" "AuditType" NOT NULL DEFAULT 'INTERNE';

-- AlterTable
ALTER TABLE "Causerie" ADD COLUMN     "CS_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "CS_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "CS_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Competence" ADD COLUMN     "CP_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "CP_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "CP_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "DOC_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "DV_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "EQ_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "EQ_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "EQ_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "FI_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "FI_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "FOR_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "FOR_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "FOR_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "GovernanceActivity" ADD COLUMN     "GA_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Indicator" ADD COLUMN     "IND_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "IND_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "IND_ObjectiveId" TEXT,
ADD COLUMN     "IND_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IndicatorValue" ADD COLUMN     "IV_Comment" TEXT,
ADD COLUMN     "IV_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "MG_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MeetingAttendee" ADD COLUMN     "MA_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "NonConformite" ADD COLUMN     "NC_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "NC_UpdatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "NC_Gravite",
ADD COLUMN     "NC_Gravite" "NCGravity" NOT NULL DEFAULT 'MINEURE',
DROP COLUMN "NC_Statut",
ADD COLUMN     "NC_Statut" "NCStatus" NOT NULL DEFAULT 'DETECTION';

-- AlterTable
ALTER TABLE "OrgUnit" ADD COLUMN     "OU_Code" TEXT,
ADD COLUMN     "OU_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "OU_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrgUnitType" ADD COLUMN     "OUT_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "OUT_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PAQ" ADD COLUMN     "PAQ_Budget" DOUBLE PRECISION,
ADD COLUMN     "PAQ_DateCloture" TIMESTAMP(3),
ADD COLUMN     "PAQ_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "PAQ_Status" "PAQStatus" NOT NULL DEFAULT 'EN_COURS';

-- AlterTable
ALTER TABLE "Preuve" ADD COLUMN     "PV_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProcessReview" ADD COLUMN     "PRV_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProcessType" ADD COLUMN     "PT_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "PT_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Processus" ADD COLUMN     "PR_DateRevision" TIMESTAMP(3),
ADD COLUMN     "PR_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "PR_Objectifs" TEXT,
ADD COLUMN     "PR_Ressources" TEXT,
ADD COLUMN     "PR_Surveillance" TEXT,
ADD COLUMN     "PR_Version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Reclamation" ADD COLUMN     "REC_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RevueDirection" ADD COLUMN     "RD_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "RD_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN     "RS_IsActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "RS_Status",
ADD COLUMN     "RS_Status" "RiskStatus" NOT NULL DEFAULT 'IDENTIFIE';

-- AlterTable
ALTER TABLE "RiskType" ADD COLUMN     "RT_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "RT_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SSEEvent" ADD COLUMN     "SSE_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "SSE_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SSEStats" ADD COLUMN     "ST_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ST_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SecurityAuditLog" ADD COLUMN     "SAL_IpAddress" TEXT,
ADD COLUMN     "SAL_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "SAL_UserAgent" TEXT;

-- AlterTable
ALTER TABLE "Signature" ADD COLUMN     "SIG_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "S_City" TEXT,
ADD COLUMN     "S_Country" TEXT DEFAULT 'Sénégal',
ADD COLUMN     "S_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "S_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "S_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "TK_IsActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Tier" ADD COLUMN     "TR_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "TR_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "TR_Phone" TEXT,
ADD COLUMN     "TR_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "TX_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "TX_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "U_FirstLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "U_LastLoginAt" TIMESTAMP(3),
ADD COLUMN     "U_Phone" TEXT;

-- AlterTable
ALTER TABLE "UserCompetence" ADD COLUMN     "UC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "UC_IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "UC_UpdatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "OrganizationContext" (
    "OC_Id" TEXT NOT NULL,
    "OC_Type" "ContextType" NOT NULL,
    "OC_Title" TEXT NOT NULL,
    "OC_Description" TEXT NOT NULL,
    "OC_Impact" TEXT,
    "OC_ActionsPlanif" TEXT,
    "OC_ReviewDate" TIMESTAMP(3),
    "OC_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "OC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "OC_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "OrganizationContext_pkey" PRIMARY KEY ("OC_Id")
);

-- CreateTable
CREATE TABLE "InterestedParty" (
    "IP_Id" TEXT NOT NULL,
    "IP_Name" TEXT NOT NULL,
    "IP_Type" "PartyType" NOT NULL,
    "IP_Needs" TEXT NOT NULL,
    "IP_Expectations" TEXT NOT NULL,
    "IP_Requirements" TEXT,
    "IP_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "IP_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IP_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "InterestedParty_pkey" PRIMARY KEY ("IP_Id")
);

-- CreateTable
CREATE TABLE "QualityObjective" (
    "QO_Id" TEXT NOT NULL,
    "QO_Title" TEXT NOT NULL,
    "QO_Description" TEXT,
    "QO_Target" TEXT NOT NULL,
    "QO_Deadline" TIMESTAMP(3) NOT NULL,
    "QO_Status" "ObjectiveStatus" NOT NULL DEFAULT 'EN_COURS',
    "QO_Progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "QO_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "QO_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "QO_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "QO_ProcessusId" TEXT,
    "QO_OwnerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "QualityObjective_pkey" PRIMARY KEY ("QO_Id")
);

-- CreateTable
CREATE TABLE "Consumption" (
    "CON_Id" TEXT NOT NULL,
    "CON_Type" TEXT NOT NULL,
    "CON_Value" DOUBLE PRECISION NOT NULL,
    "CON_Unit" TEXT NOT NULL,
    "CON_Month" INTEGER NOT NULL,
    "CON_Year" INTEGER NOT NULL,
    "CON_Cost" DOUBLE PRECISION,
    "CON_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CON_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CON_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CON_SiteId" TEXT NOT NULL,
    "CON_CreatorId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Consumption_pkey" PRIMARY KEY ("CON_Id")
);

-- CreateTable
CREATE TABLE "Waste" (
    "WAS_Id" TEXT NOT NULL,
    "WAS_Label" TEXT NOT NULL,
    "WAS_Weight" DOUBLE PRECISION NOT NULL,
    "WAS_Type" TEXT NOT NULL,
    "WAS_Treatment" TEXT NOT NULL,
    "WAS_Month" INTEGER NOT NULL,
    "WAS_Year" INTEGER NOT NULL,
    "WAS_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "WAS_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "WAS_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "WAS_SiteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Waste_pkey" PRIMARY KEY ("WAS_Id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "N_Id" TEXT NOT NULL,
    "N_Title" TEXT NOT NULL,
    "N_Message" TEXT NOT NULL,
    "N_Type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "N_IsRead" BOOLEAN NOT NULL DEFAULT false,
    "N_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "N_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("N_Id")
);

-- CreateTable
CREATE TABLE "userHabilitation" (
    "UH_Id" TEXT NOT NULL,
    "UH_Label" TEXT NOT NULL,
    "UH_DateObtained" TIMESTAMP(3) NOT NULL,
    "UH_ExpiryDate" TIMESTAMP(3),
    "UH_Status" "HabStatus" NOT NULL DEFAULT 'ACTIVE',
    "UH_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "UH_FileUrl" TEXT,
    "UH_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UH_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "userHabilitation_pkey" PRIMARY KEY ("UH_Id")
);

-- CreateTable
CREATE TABLE "ApprovalWorkflow" (
    "AW_Id" TEXT NOT NULL,
    "AW_EntityType" TEXT NOT NULL,
    "AW_EntityId" TEXT NOT NULL,
    "AW_Step" INTEGER NOT NULL,
    "AW_Status" "WorkflowStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "AW_ApproverId" TEXT NOT NULL,
    "AW_Comment" TEXT,
    "AW_ApprovedAt" TIMESTAMP(3),
    "AW_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AW_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("AW_Id")
);

-- CreateTable
CREATE TABLE "ChangeLog" (
    "CL_Id" TEXT NOT NULL,
    "CL_EntityType" TEXT NOT NULL,
    "CL_EntityId" TEXT NOT NULL,
    "CL_Action" "ChangeAction" NOT NULL,
    "CL_OldValue" JSONB,
    "CL_NewValue" JSONB,
    "CL_UserId" TEXT NOT NULL,
    "CL_Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ChangeLog_pkey" PRIMARY KEY ("CL_Id")
);

-- CreateIndex
CREATE INDEX "OrganizationContext_tenantId_idx" ON "OrganizationContext"("tenantId");

-- CreateIndex
CREATE INDEX "OrganizationContext_tenantId_OC_Type_idx" ON "OrganizationContext"("tenantId", "OC_Type");

-- CreateIndex
CREATE INDEX "InterestedParty_tenantId_idx" ON "InterestedParty"("tenantId");

-- CreateIndex
CREATE INDEX "InterestedParty_tenantId_IP_Type_idx" ON "InterestedParty"("tenantId", "IP_Type");

-- CreateIndex
CREATE INDEX "QualityObjective_tenantId_idx" ON "QualityObjective"("tenantId");

-- CreateIndex
CREATE INDEX "QualityObjective_tenantId_QO_Status_idx" ON "QualityObjective"("tenantId", "QO_Status");

-- CreateIndex
CREATE INDEX "QualityObjective_tenantId_QO_OwnerId_idx" ON "QualityObjective"("tenantId", "QO_OwnerId");

-- CreateIndex
CREATE INDEX "Consumption_tenantId_idx" ON "Consumption"("tenantId");

-- CreateIndex
CREATE INDEX "Consumption_CON_Month_CON_Year_idx" ON "Consumption"("CON_Month", "CON_Year");

-- CreateIndex
CREATE INDEX "Consumption_tenantId_CON_SiteId_idx" ON "Consumption"("tenantId", "CON_SiteId");

-- CreateIndex
CREATE INDEX "Waste_tenantId_idx" ON "Waste"("tenantId");

-- CreateIndex
CREATE INDEX "Waste_WAS_Month_WAS_Year_idx" ON "Waste"("WAS_Month", "WAS_Year");

-- CreateIndex
CREATE INDEX "Waste_tenantId_WAS_SiteId_idx" ON "Waste"("tenantId", "WAS_SiteId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_userId_N_IsRead_idx" ON "Notification"("userId", "N_IsRead");

-- CreateIndex
CREATE INDEX "userHabilitation_userId_idx" ON "userHabilitation"("userId");

-- CreateIndex
CREATE INDEX "userHabilitation_tenantId_idx" ON "userHabilitation"("tenantId");

-- CreateIndex
CREATE INDEX "userHabilitation_tenantId_UH_Status_idx" ON "userHabilitation"("tenantId", "UH_Status");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_tenantId_AW_EntityType_AW_EntityId_idx" ON "ApprovalWorkflow"("tenantId", "AW_EntityType", "AW_EntityId");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_tenantId_AW_Status_idx" ON "ApprovalWorkflow"("tenantId", "AW_Status");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_AW_ApproverId_AW_Status_idx" ON "ApprovalWorkflow"("AW_ApproverId", "AW_Status");

-- CreateIndex
CREATE INDEX "ChangeLog_tenantId_CL_EntityType_CL_EntityId_idx" ON "ChangeLog"("tenantId", "CL_EntityType", "CL_EntityId");

-- CreateIndex
CREATE INDEX "ChangeLog_tenantId_CL_Timestamp_idx" ON "ChangeLog"("tenantId", "CL_Timestamp");

-- CreateIndex
CREATE INDEX "ChangeLog_CL_UserId_idx" ON "ChangeLog"("CL_UserId");

-- CreateIndex
CREATE INDEX "Action_tenantId_ACT_Status_idx" ON "Action"("tenantId", "ACT_Status");

-- CreateIndex
CREATE INDEX "Action_tenantId_ACT_ResponsableId_ACT_Status_idx" ON "Action"("tenantId", "ACT_ResponsableId", "ACT_Status");

-- CreateIndex
CREATE INDEX "Action_ACT_Deadline_ACT_Status_idx" ON "Action"("ACT_Deadline", "ACT_Status");

-- CreateIndex
CREATE INDEX "Action_tenantId_ACT_Priority_idx" ON "Action"("tenantId", "ACT_Priority");

-- CreateIndex
CREATE INDEX "Audit_tenantId_AU_Status_idx" ON "Audit"("tenantId", "AU_Status");

-- CreateIndex
CREATE INDEX "Audit_tenantId_AU_Type_idx" ON "Audit"("tenantId", "AU_Type");

-- CreateIndex
CREATE INDEX "Audit_AU_DateAudit_idx" ON "Audit"("AU_DateAudit");

-- CreateIndex
CREATE INDEX "Causerie_CS_Date_idx" ON "Causerie"("CS_Date");

-- CreateIndex
CREATE INDEX "Document_tenantId_DOC_Status_idx" ON "Document"("tenantId", "DOC_Status");

-- CreateIndex
CREATE INDEX "Document_tenantId_DOC_Category_idx" ON "Document"("tenantId", "DOC_Category");

-- CreateIndex
CREATE INDEX "DocumentVersion_DV_DocumentId_idx" ON "DocumentVersion"("DV_DocumentId");

-- CreateIndex
CREATE INDEX "Equipment_tenantId_EQ_Status_idx" ON "Equipment"("tenantId", "EQ_Status");

-- CreateIndex
CREATE INDEX "Finding_FI_AuditId_idx" ON "Finding"("FI_AuditId");

-- CreateIndex
CREATE INDEX "Formation_tenantId_FOR_UserId_idx" ON "Formation"("tenantId", "FOR_UserId");

-- CreateIndex
CREATE INDEX "GovernanceActivity_tenantId_GA_Status_idx" ON "GovernanceActivity"("tenantId", "GA_Status");

-- CreateIndex
CREATE INDEX "GovernanceActivity_GA_DatePlanned_idx" ON "GovernanceActivity"("GA_DatePlanned");

-- CreateIndex
CREATE INDEX "Indicator_tenantId_IND_ProcessusId_idx" ON "Indicator"("tenantId", "IND_ProcessusId");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_IND_Code_tenantId_key" ON "Indicator"("IND_Code", "tenantId");

-- CreateIndex
CREATE INDEX "IndicatorValue_IV_Month_IV_Year_idx" ON "IndicatorValue"("IV_Month", "IV_Year");

-- CreateIndex
CREATE INDEX "IndicatorValue_IV_IndicatorId_IV_Status_idx" ON "IndicatorValue"("IV_IndicatorId", "IV_Status");

-- CreateIndex
CREATE INDEX "Meeting_tenantId_MG_Status_idx" ON "Meeting"("tenantId", "MG_Status");

-- CreateIndex
CREATE INDEX "Meeting_MG_Date_idx" ON "Meeting"("MG_Date");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAttendee_MA_MeetingId_MA_UserId_key" ON "MeetingAttendee"("MA_MeetingId", "MA_UserId");

-- CreateIndex
CREATE INDEX "NonConformite_tenantId_NC_Statut_idx" ON "NonConformite"("tenantId", "NC_Statut");

-- CreateIndex
CREATE INDEX "NonConformite_NC_ProcessusId_NC_Statut_idx" ON "NonConformite"("NC_ProcessusId", "NC_Statut");

-- CreateIndex
CREATE INDEX "OrgUnit_tenantId_OU_SiteId_idx" ON "OrgUnit"("tenantId", "OU_SiteId");

-- CreateIndex
CREATE INDEX "PAQ_tenantId_PAQ_Status_idx" ON "PAQ"("tenantId", "PAQ_Status");

-- CreateIndex
CREATE INDEX "ProcessReview_tenantId_PRV_Status_idx" ON "ProcessReview"("tenantId", "PRV_Status");

-- CreateIndex
CREATE INDEX "Processus_tenantId_PR_IsActive_idx" ON "Processus"("tenantId", "PR_IsActive");

-- CreateIndex
CREATE INDEX "Processus_tenantId_PR_PiloteId_idx" ON "Processus"("tenantId", "PR_PiloteId");

-- CreateIndex
CREATE INDEX "Reclamation_tenantId_REC_Status_idx" ON "Reclamation"("tenantId", "REC_Status");

-- CreateIndex
CREATE INDEX "Reclamation_tenantId_REC_OwnerId_idx" ON "Reclamation"("tenantId", "REC_OwnerId");

-- CreateIndex
CREATE INDEX "RevueDirection_RD_Date_idx" ON "RevueDirection"("RD_Date");

-- CreateIndex
CREATE INDEX "Risk_tenantId_RS_Status_idx" ON "Risk"("tenantId", "RS_Status");

-- CreateIndex
CREATE INDEX "Risk_tenantId_RS_ProcessusId_idx" ON "Risk"("tenantId", "RS_ProcessusId");

-- CreateIndex
CREATE INDEX "SSEEvent_tenantId_SSE_Type_idx" ON "SSEEvent"("tenantId", "SSE_Type");

-- CreateIndex
CREATE INDEX "SSEEvent_SSE_DateEvent_idx" ON "SSEEvent"("SSE_DateEvent");

-- CreateIndex
CREATE INDEX "SSEStats_ST_Mois_ST_Annee_idx" ON "SSEStats"("ST_Mois", "ST_Annee");

-- CreateIndex
CREATE UNIQUE INDEX "SSEStats_tenantId_ST_Mois_ST_Annee_key" ON "SSEStats"("tenantId", "ST_Mois", "ST_Annee");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_SAL_UserId_idx" ON "SecurityAuditLog"("SAL_UserId");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_SAL_Timestamp_idx" ON "SecurityAuditLog"("SAL_Timestamp");

-- CreateIndex
CREATE INDEX "Signature_SIG_EntityType_SIG_EntityId_idx" ON "Signature"("SIG_EntityType", "SIG_EntityId");

-- CreateIndex
CREATE INDEX "Site_tenantId_S_IsActive_idx" ON "Site"("tenantId", "S_IsActive");

-- CreateIndex
CREATE INDEX "Ticket_tenantId_TK_Status_idx" ON "Ticket"("tenantId", "TK_Status");

-- CreateIndex
CREATE INDEX "Tier_tenantId_TR_Type_idx" ON "Tier"("tenantId", "TR_Type");

-- CreateIndex
CREATE INDEX "Transaction_TX_Status_idx" ON "Transaction"("TX_Status");

-- CreateIndex
CREATE INDEX "User_tenantId_U_IsActive_idx" ON "User"("tenantId", "U_IsActive");

-- CreateIndex
CREATE INDEX "User_tenantId_U_Role_idx" ON "User"("tenantId", "U_Role");

-- RenameForeignKey
ALTER TABLE "Audit" RENAME CONSTRAINT "AuditenantId_fkey" TO "Audit_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Causerie" RENAME CONSTRAINT "CauseritenantId_fkey" TO "Causerie_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Competence" RENAME CONSTRAINT "CompetenctenantId_fkey" TO "Competence_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Document" RENAME CONSTRAINT "DocumentenantId_fkey" TO "Document_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Equipment" RENAME CONSTRAINT "EquipmentenantId_fkey" TO "Equipment_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Indicator" RENAME CONSTRAINT "IndicattenantId_fkey" TO "Indicator_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "NonConformite" RENAME CONSTRAINT "NonConformitenantId_fkey" TO "NonConformite_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "OrgUnit" RENAME CONSTRAINT "OrgUnitenantId_fkey" TO "OrgUnit_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "OrgUnitType" RENAME CONSTRAINT "OrgUnitTytenantId_fkey" TO "OrgUnitType_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "PAQ" RENAME CONSTRAINT "tenantId_fkey" TO "PAQ_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Preuve" RENAME CONSTRAINT "PreuvtenantId_fkey" TO "Preuve_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "ProcessType" RENAME CONSTRAINT "ProcessTytenantId_fkey" TO "ProcessType_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Processus" RENAME CONSTRAINT "ProcessutenantId_fkey" TO "Processus_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "RiskType" RENAME CONSTRAINT "RiskTytenantId_fkey" TO "RiskType_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "SSEEvent" RENAME CONSTRAINT "SSEEventenantId_fkey" TO "SSEEvent_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "SSEStats" RENAME CONSTRAINT "SSESttenantId_fkey" TO "SSEStats_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Signature" RENAME CONSTRAINT "SignatutenantId_fkey" TO "Signature_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Site" RENAME CONSTRAINT "SitenantId_fkey" TO "Site_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Ticket" RENAME CONSTRAINT "TicketenantId_fkey" TO "Ticket_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "Tier" RENAME CONSTRAINT "TietenantId_fkey" TO "Tier_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "User" RENAME CONSTRAINT "UsetenantId_fkey" TO "User_tenantId_fkey";

-- AddForeignKey
ALTER TABLE "OrganizationContext" ADD CONSTRAINT "OrganizationContext_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestedParty" ADD CONSTRAINT "InterestedParty_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityObjective" ADD CONSTRAINT "QualityObjective_QO_ProcessusId_fkey" FOREIGN KEY ("QO_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityObjective" ADD CONSTRAINT "QualityObjective_QO_OwnerId_fkey" FOREIGN KEY ("QO_OwnerId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityObjective" ADD CONSTRAINT "QualityObjective_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_IND_ObjectiveId_fkey" FOREIGN KEY ("IND_ObjectiveId") REFERENCES "QualityObjective"("QO_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_CON_SiteId_fkey" FOREIGN KEY ("CON_SiteId") REFERENCES "Site"("S_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_CON_CreatorId_fkey" FOREIGN KEY ("CON_CreatorId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consumption" ADD CONSTRAINT "Consumption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_WAS_SiteId_fkey" FOREIGN KEY ("WAS_SiteId") REFERENCES "Site"("S_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userHabilitation" ADD CONSTRAINT "userHabilitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userHabilitation" ADD CONSTRAINT "userHabilitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_AW_ApproverId_fkey" FOREIGN KEY ("AW_ApproverId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_CL_UserId_fkey" FOREIGN KEY ("CL_UserId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "AuditenantId_idx" RENAME TO "Audit_tenantId_idx";

-- RenameIndex
ALTER INDEX "CauseritenantId_idx" RENAME TO "Causerie_tenantId_idx";

-- RenameIndex
ALTER INDEX "CompetenctenantId_idx" RENAME TO "Competence_tenantId_idx";

-- RenameIndex
ALTER INDEX "DocumentenantId_idx" RENAME TO "Document_tenantId_idx";

-- RenameIndex
ALTER INDEX "EquipmentenantId_idx" RENAME TO "Equipment_tenantId_idx";

-- RenameIndex
ALTER INDEX "IndicattenantId_idx" RENAME TO "Indicator_tenantId_idx";

-- RenameIndex
ALTER INDEX "NonConformitenantId_idx" RENAME TO "NonConformite_tenantId_idx";

-- RenameIndex
ALTER INDEX "OrgUnitenantId_idx" RENAME TO "OrgUnit_tenantId_idx";

-- RenameIndex
ALTER INDEX "OrgUnitTytenantId_idx" RENAME TO "OrgUnitType_tenantId_idx";

-- RenameIndex
ALTER INDEX "PAQ_PAQ_ProcessusId_PAQ_YetenantId_key" RENAME TO "PAQ_PAQ_ProcessusId_PAQ_Year_tenantId_key";

-- RenameIndex
ALTER INDEX "tenantId_idx" RENAME TO "PAQ_tenantId_idx";

-- RenameIndex
ALTER INDEX "PreuvtenantId_idx" RENAME TO "Preuve_tenantId_idx";

-- RenameIndex
ALTER INDEX "ProcessReview_PRV_ProcessusId_PRV_Month_PRV_YetenantId_key" RENAME TO "ProcessReview_PRV_ProcessusId_PRV_Month_PRV_Year_tenantId_key";

-- RenameIndex
ALTER INDEX "ProcessTytenantId_idx" RENAME TO "ProcessType_tenantId_idx";

-- RenameIndex
ALTER INDEX "Processus_PR_CodtenantId_key" RENAME TO "Processus_PR_Code_tenantId_key";

-- RenameIndex
ALTER INDEX "ProcessutenantId_idx" RENAME TO "Processus_tenantId_idx";

-- RenameIndex
ALTER INDEX "RiskTytenantId_idx" RENAME TO "RiskType_tenantId_idx";

-- RenameIndex
ALTER INDEX "SSEEventenantId_idx" RENAME TO "SSEEvent_tenantId_idx";

-- RenameIndex
ALTER INDEX "SSESttenantId_idx" RENAME TO "SSEStats_tenantId_idx";

-- RenameIndex
ALTER INDEX "SignatutenantId_idx" RENAME TO "Signature_tenantId_idx";

-- RenameIndex
ALTER INDEX "SitenantId_idx" RENAME TO "Site_tenantId_idx";

-- RenameIndex
ALTER INDEX "TicketenantId_idx" RENAME TO "Ticket_tenantId_idx";

-- RenameIndex
ALTER INDEX "Tier_TR_ItenantId_key" RENAME TO "Tier_TR_Id_tenantId_key";

-- RenameIndex
ALTER INDEX "TietenantId_idx" RENAME TO "Tier_tenantId_idx";

-- RenameIndex
ALTER INDEX "UsetenantId_idx" RENAME TO "User_tenantId_idx";
