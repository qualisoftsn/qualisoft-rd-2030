-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('ESSAI', 'FREE', 'BASIC', 'PRO', 'EMERGENCE', 'CROISSANCE', 'ENTREPRISE', 'GROUPE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'PENDING');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER', 'PILOTE', 'COPILOTE', 'AUDITEUR', 'HSE', 'SAFETY_OFFICER');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('BROUILLON', 'EN_REVUE', 'APPROUVE', 'REJETE', 'ARCHIVE', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "DocCategory" AS ENUM ('PROCEDURE', 'MANUEL', 'ENREGISTREMENT', 'CONSIGNE', 'RAPPORT', 'AUTRE');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('POINT_FORT', 'CONFORMITE', 'OBSERVATION', 'NC_MINEURE', 'NC_MAJEURE');

-- CreateEnum
CREATE TYPE "NCSource" AS ENUM ('INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'CLIENT_COMPLAINT', 'SUPPLIER', 'INCIDENT_SAFETY');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('A_FAIRE', 'EN_COURS', 'A_VALIDER', 'TERMINEE', 'NON_EFFICACE', 'ANNULEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'AMELIORATION');

-- CreateEnum
CREATE TYPE "ActionOrigin" AS ENUM ('AUDIT', 'NON_CONFORMITE', 'RECLAMATION', 'REVUE_DIRECTION', 'COPIL', 'RISQUE', 'SSE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReclamationStatus" AS ENUM ('NOUVELLE', 'EN_ANALYSE', 'ACTION_EN_COURS', 'TRAITEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SSEType" AS ENUM ('ACCIDENT_TRAVAIL', 'ACCIDENT_TRAVAIL_TRAJET', 'DOMMAGE_MATERIEL', 'PRESQU_ACCIDENT', 'SITUATION_DANGEREUSE', 'MALADIE_PRO');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "IVStatus" AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'RENVOYE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('BROUILLON', 'EN_COURS', 'VALIDEE', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "TierType" AS ENUM ('CLIENT', 'FOURNISSEUR', 'PARTENAIRE', 'ETAT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('EN_COURS', 'COMPLETE', 'ECHOUEE', 'A_REFAIRE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WAVE', 'ORANGE_MONEY', 'CREDIT_CARD', 'BANK_TRANSFER', 'ESSAI');

-- CreateEnum
CREATE TYPE "GovernanceType" AS ENUM ('COPIL', 'REVUE_DIRECTION', 'REVUE_PROCESSUS', 'AUDIT_INTERNE', 'AUDIT_EXTERNE', 'VEILLE_REGLEMENTAIRE', 'SEANCE_PROCESSUS');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'POSTPONED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Tenant" (
    "T_Id" TEXT NOT NULL,
    "T_Name" TEXT NOT NULL,
    "T_Email" TEXT NOT NULL,
    "T_Domain" TEXT NOT NULL,
    "T_Plan" "Plan" NOT NULL DEFAULT 'ESSAI',
    "T_SubscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "T_SubscriptionEndDate" TIMESTAMP(3),
    "T_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "T_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "T_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "T_Address" TEXT,
    "T_Phone" TEXT,
    "T_CeoName" TEXT,
    "T_ContractDuration" INTEGER NOT NULL DEFAULT 24,
    "T_TacitRenewal" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("T_Id")
);

-- CreateTable
CREATE TABLE "Site" (
    "S_Id" TEXT NOT NULL,
    "S_Name" TEXT NOT NULL,
    "S_Address" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("S_Id")
);

-- CreateTable
CREATE TABLE "OrgUnitType" (
    "OUT_Id" TEXT NOT NULL,
    "OUT_Label" TEXT NOT NULL,
    "OUT_Description" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "OrgUnitType_pkey" PRIMARY KEY ("OUT_Id")
);

-- CreateTable
CREATE TABLE "OrgUnit" (
    "OU_Id" TEXT NOT NULL,
    "OU_Name" TEXT NOT NULL,
    "OU_TypeId" TEXT NOT NULL,
    "OU_ParentId" TEXT,
    "OU_SiteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "OU_IsActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrgUnit_pkey" PRIMARY KEY ("OU_Id")
);

-- CreateTable
CREATE TABLE "User" (
    "U_Id" TEXT NOT NULL,
    "U_Email" TEXT NOT NULL,
    "U_PasswordHash" TEXT NOT NULL,
    "U_FirstName" TEXT,
    "U_LastName" TEXT,
    "U_Role" "Role" NOT NULL DEFAULT 'USER',
    "U_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "U_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "U_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "U_SiteId" TEXT,
    "U_OrgUnitId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("U_Id")
);

-- CreateTable
CREATE TABLE "ProcessType" (
    "PT_Id" TEXT NOT NULL,
    "PT_Label" TEXT NOT NULL,
    "PT_Description" TEXT,
    "PT_Color" TEXT DEFAULT '#3b82f6',
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ProcessType_pkey" PRIMARY KEY ("PT_Id")
);

-- CreateTable
CREATE TABLE "Processus" (
    "PR_Id" TEXT NOT NULL,
    "PR_Code" TEXT NOT NULL,
    "PR_Libelle" TEXT NOT NULL,
    "PR_Description" TEXT,
    "PR_TypeId" TEXT NOT NULL,
    "PR_PiloteId" TEXT NOT NULL,
    "PR_CoPiloteId" TEXT,
    "tenantId" TEXT NOT NULL,
    "PR_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "PR_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Processus_pkey" PRIMARY KEY ("PR_Id")
);

-- CreateTable
CREATE TABLE "PAQ" (
    "PAQ_Id" TEXT NOT NULL,
    "PAQ_Title" TEXT NOT NULL,
    "PAQ_Description" TEXT,
    "PAQ_Year" INTEGER NOT NULL,
    "PAQ_ProcessusId" TEXT NOT NULL,
    "PAQ_QualityManagerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "PAQ_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "PAQ_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PAQ_pkey" PRIMARY KEY ("PAQ_Id")
);

-- CreateTable
CREATE TABLE "Action" (
    "ACT_Id" TEXT NOT NULL,
    "ACT_Title" TEXT NOT NULL,
    "ACT_Description" TEXT,
    "ACT_Origin" "ActionOrigin" NOT NULL DEFAULT 'AUTRE',
    "ACT_Type" "ActionType" NOT NULL DEFAULT 'CORRECTIVE',
    "ACT_Status" "ActionStatus" NOT NULL DEFAULT 'A_FAIRE',
    "ACT_Priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "ACT_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ACT_Deadline" TIMESTAMP(3),
    "ACT_CompletedAt" TIMESTAMP(3),
    "ACT_ResponsableId" TEXT NOT NULL,
    "ACT_CreatorId" TEXT NOT NULL,
    "ACT_PAQId" TEXT NOT NULL,
    "ACT_NCId" TEXT,
    "ACT_ReclamationId" TEXT,
    "ACT_AuditId" TEXT,
    "ACT_MeetingId" TEXT,
    "ACT_SSEEventId" TEXT,
    "tenantId" TEXT NOT NULL,
    "ACT_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("ACT_Id")
);

-- CreateTable
CREATE TABLE "GovernanceActivity" (
    "GA_Id" TEXT NOT NULL,
    "GA_Num" TEXT,
    "GA_Title" TEXT NOT NULL,
    "GA_Type" "GovernanceType" NOT NULL,
    "GA_Theme" TEXT,
    "GA_DatePlanned" TIMESTAMP(3) NOT NULL,
    "GA_Deadline" TIMESTAMP(3),
    "GA_AnalysisPeriod" TEXT,
    "GA_IpDate" TIMESTAMP(3),
    "GA_EffectiveDate" TIMESTAMP(3),
    "GA_Location" TEXT DEFAULT 'Teams',
    "GA_Status" "ActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "GA_Comments" TEXT,
    "GA_Observations" TEXT,
    "tenantId" TEXT NOT NULL,
    "GA_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GA_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceActivity_pkey" PRIMARY KEY ("GA_Id")
);

-- CreateTable
CREATE TABLE "Reclamation" (
    "REC_Id" TEXT NOT NULL,
    "REC_Reference" TEXT NOT NULL,
    "REC_Object" TEXT NOT NULL,
    "REC_Description" TEXT NOT NULL,
    "REC_Status" "ReclamationStatus" NOT NULL DEFAULT 'NOUVELLE',
    "REC_Source" TEXT,
    "REC_DateReceipt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "REC_DateTransmitted" TIMESTAMP(3),
    "REC_Deadline" TIMESTAMP(3),
    "REC_Gravity" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "REC_TierId" TEXT NOT NULL,
    "REC_ProcessusId" TEXT,
    "REC_OwnerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "REC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "REC_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reclamation_pkey" PRIMARY KEY ("REC_Id")
);

-- CreateTable
CREATE TABLE "NonConformite" (
    "NC_Id" TEXT NOT NULL,
    "NC_Libelle" TEXT NOT NULL,
    "NC_Description" TEXT NOT NULL,
    "NC_Diagnostic" TEXT,
    "NC_Gravite" TEXT NOT NULL DEFAULT 'MINEURE',
    "NC_Statut" TEXT NOT NULL DEFAULT 'DETECTION',
    "NC_Source" "NCSource" NOT NULL DEFAULT 'INTERNAL_AUDIT',
    "NC_ProcessusId" TEXT,
    "NC_ReclamationId" TEXT,
    "NC_AuditId" TEXT,
    "NC_DetectorId" TEXT,
    "tenantId" TEXT NOT NULL,
    "NC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NonConformite_pkey" PRIMARY KEY ("NC_Id")
);

-- CreateTable
CREATE TABLE "RiskType" (
    "RT_Id" TEXT NOT NULL,
    "RT_Label" TEXT NOT NULL,
    "RT_Description" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RiskType_pkey" PRIMARY KEY ("RT_Id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "RS_Id" TEXT NOT NULL,
    "RS_Libelle" TEXT NOT NULL,
    "RS_Activite" TEXT,
    "RS_Tache" TEXT,
    "RS_Causes" TEXT,
    "RS_Description" TEXT,
    "RS_Probabilite" INTEGER NOT NULL DEFAULT 1,
    "RS_Gravite" INTEGER NOT NULL DEFAULT 1,
    "RS_Maitrise" INTEGER NOT NULL DEFAULT 1,
    "RS_Score" INTEGER NOT NULL DEFAULT 1,
    "RS_Status" TEXT DEFAULT 'IDENTIFIE',
    "RS_Mesures" TEXT,
    "RS_Acteurs" TEXT,
    "RS_NextReview" TIMESTAMP(3),
    "RS_TypeId" TEXT NOT NULL,
    "RS_ProcessusId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "RS_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "RS_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("RS_Id")
);

-- CreateTable
CREATE TABLE "SSEEvent" (
    "SSE_Id" TEXT NOT NULL,
    "SSE_Type" "SSEType" NOT NULL,
    "SSE_DateEvent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SSE_Lieu" TEXT NOT NULL,
    "SSE_Description" TEXT NOT NULL,
    "SSE_AvecArret" BOOLEAN NOT NULL DEFAULT false,
    "SSE_NbJoursArret" INTEGER NOT NULL DEFAULT 0,
    "SSE_ReporterId" TEXT,
    "SSE_VictimId" TEXT,
    "SSE_SiteId" TEXT NOT NULL,
    "SSE_ProcessusId" TEXT,
    "tenantId" TEXT NOT NULL,
    "SSE_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSEEvent_pkey" PRIMARY KEY ("SSE_Id")
);

-- CreateTable
CREATE TABLE "Causerie" (
    "CS_Id" TEXT NOT NULL,
    "CS_Theme" TEXT NOT NULL,
    "CS_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CS_CompteRendu" TEXT,
    "CS_AnimateurId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Causerie_pkey" PRIMARY KEY ("CS_Id")
);

-- CreateTable
CREATE TABLE "SSEStats" (
    "ST_Id" TEXT NOT NULL,
    "ST_Mois" INTEGER NOT NULL,
    "ST_Annee" INTEGER NOT NULL,
    "ST_NbAccidents" INTEGER NOT NULL,
    "ST_TauxFrequence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ST_TauxGravite" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "SSEStats_pkey" PRIMARY KEY ("ST_Id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "AU_Id" TEXT NOT NULL,
    "AU_Reference" TEXT NOT NULL,
    "AU_Title" TEXT NOT NULL,
    "AU_Scope" TEXT NOT NULL,
    "AU_DateAudit" TIMESTAMP(3) NOT NULL,
    "AU_Status" "AuditStatus" NOT NULL DEFAULT 'PLANIFIE',
    "AU_LeadId" TEXT,
    "AU_SiteId" TEXT NOT NULL,
    "AU_ProcessusId" TEXT,
    "tenantId" TEXT NOT NULL,
    "AU_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AU_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("AU_Id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "FI_Id" TEXT NOT NULL,
    "FI_Description" TEXT NOT NULL,
    "FI_Type" "FindingType" NOT NULL,
    "FI_AuditId" TEXT NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("FI_Id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "MG_Id" TEXT NOT NULL,
    "MG_Title" TEXT NOT NULL,
    "MG_Date" TIMESTAMP(3) NOT NULL,
    "MG_Status" "MeetingStatus" NOT NULL DEFAULT 'PLANIFIE',
    "MG_Report" TEXT,
    "MG_ProcessId" TEXT,
    "tenantId" TEXT NOT NULL,
    "MG_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MG_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("MG_Id")
);

-- CreateTable
CREATE TABLE "MeetingAttendee" (
    "MA_Id" TEXT NOT NULL,
    "MA_MeetingId" TEXT NOT NULL,
    "MA_UserId" TEXT NOT NULL,
    "MA_Present" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MeetingAttendee_pkey" PRIMARY KEY ("MA_Id")
);

-- CreateTable
CREATE TABLE "Document" (
    "DOC_Id" TEXT NOT NULL,
    "DOC_Title" TEXT NOT NULL,
    "DOC_Description" TEXT,
    "DOC_Category" "DocCategory" NOT NULL DEFAULT 'AUTRE',
    "DOC_Status" "DocStatus" NOT NULL DEFAULT 'BROUILLON',
    "DOC_CurrentVersion" INTEGER NOT NULL DEFAULT 1,
    "DOC_IsArchived" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "DOC_SiteId" TEXT,
    "DOC_ProcessusId" TEXT,
    "DOC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DOC_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("DOC_Id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "DV_Id" TEXT NOT NULL,
    "DV_VersionNumber" INTEGER NOT NULL,
    "DV_FileUrl" TEXT NOT NULL,
    "DV_FileName" TEXT NOT NULL,
    "DV_FileSize" INTEGER NOT NULL DEFAULT 0,
    "DV_Status" "DocStatus" NOT NULL DEFAULT 'BROUILLON',
    "DV_DocumentId" TEXT NOT NULL,
    "DV_CreatedById" TEXT NOT NULL,
    "DV_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("DV_Id")
);

-- CreateTable
CREATE TABLE "Preuve" (
    "PV_Id" TEXT NOT NULL,
    "PV_Commentaire" TEXT,
    "PV_FileUrl" TEXT NOT NULL,
    "PV_FileName" TEXT NOT NULL,
    "PV_AuditId" TEXT,
    "PV_NCId" TEXT,
    "PV_ActionId" TEXT,
    "PV_DocumentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "PV_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Preuve_pkey" PRIMARY KEY ("PV_Id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "IND_Id" TEXT NOT NULL,
    "IND_Code" TEXT NOT NULL,
    "IND_Libelle" TEXT NOT NULL,
    "IND_Unite" TEXT NOT NULL,
    "IND_Cible" DOUBLE PRECISION NOT NULL,
    "IND_Frequence" TEXT NOT NULL DEFAULT 'MENSUEL',
    "IND_ProcessusId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("IND_Id")
);

-- CreateTable
CREATE TABLE "IndicatorValue" (
    "IV_Id" TEXT NOT NULL,
    "IV_Month" INTEGER NOT NULL,
    "IV_Year" INTEGER NOT NULL,
    "IV_Actual" DOUBLE PRECISION NOT NULL,
    "IV_Status" "IVStatus" NOT NULL DEFAULT 'BROUILLON',
    "IV_IndicatorId" TEXT NOT NULL,
    "IV_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IV_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorValue_pkey" PRIMARY KEY ("IV_Id")
);

-- CreateTable
CREATE TABLE "ProcessReview" (
    "PRV_Id" TEXT NOT NULL,
    "PRV_Month" INTEGER NOT NULL,
    "PRV_Year" INTEGER NOT NULL,
    "PRV_Status" "ReviewStatus" NOT NULL DEFAULT 'BROUILLON',
    "PRV_AuditAnalysis" TEXT,
    "PRV_PerformanceAnalysis" TEXT,
    "PRV_ResourcesAnalysis" TEXT,
    "PRV_Decisions" TEXT,
    "PRV_RiskAnalysis" TEXT,
    "PRV_DocRef" TEXT DEFAULT 'F-QLT-011',
    "PRV_PiloteSigned" BOOLEAN NOT NULL DEFAULT false,
    "PRV_RQSigned" BOOLEAN NOT NULL DEFAULT false,
    "PRV_ProcessusId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "PRV_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "PRV_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessReview_pkey" PRIMARY KEY ("PRV_Id")
);

-- CreateTable
CREATE TABLE "RevueDirection" (
    "RD_Id" TEXT NOT NULL,
    "RD_Periode" TEXT NOT NULL,
    "RD_Date" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "RD_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevueDirection_pkey" PRIMARY KEY ("RD_Id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "EQ_Id" TEXT NOT NULL,
    "EQ_Reference" TEXT NOT NULL,
    "EQ_Name" TEXT NOT NULL,
    "EQ_DateService" TIMESTAMP(3) NOT NULL,
    "EQ_ProchaineVGP" TIMESTAMP(3) NOT NULL,
    "EQ_Status" TEXT NOT NULL DEFAULT 'OPERATIONNEL',
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("EQ_Id")
);

-- CreateTable
CREATE TABLE "Competence" (
    "CP_Id" TEXT NOT NULL,
    "CP_Name" TEXT NOT NULL,
    "CP_NiveauRequis" INTEGER NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Competence_pkey" PRIMARY KEY ("CP_Id")
);

-- CreateTable
CREATE TABLE "UserCompetence" (
    "UC_UserId" TEXT NOT NULL,
    "UC_CompetenceId" TEXT NOT NULL,
    "UC_NiveauActuel" INTEGER NOT NULL,

    CONSTRAINT "UserCompetence_pkey" PRIMARY KEY ("UC_UserId","UC_CompetenceId")
);

-- CreateTable
CREATE TABLE "Formation" (
    "FOR_Id" TEXT NOT NULL,
    "FOR_Title" TEXT NOT NULL,
    "FOR_Date" TIMESTAMP(3) NOT NULL,
    "FOR_Expiry" TIMESTAMP(3),
    "FOR_Status" TEXT NOT NULL,
    "FOR_UserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("FOR_Id")
);

-- CreateTable
CREATE TABLE "Tier" (
    "TR_Id" TEXT NOT NULL,
    "TR_Name" TEXT NOT NULL,
    "TR_Email" TEXT,
    "TR_Type" "TierType" NOT NULL DEFAULT 'CLIENT',
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("TR_Id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "SIG_Id" TEXT NOT NULL,
    "SIG_EntityType" TEXT NOT NULL,
    "SIG_EntityId" TEXT NOT NULL,
    "SIG_Hash" TEXT NOT NULL,
    "SIG_Metadata" JSONB,
    "SIG_UserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "SIG_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("SIG_Id")
);

-- CreateTable
CREATE TABLE "SecurityAuditLog" (
    "SAL_Id" TEXT NOT NULL,
    "SAL_Action" TEXT NOT NULL,
    "SAL_Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SAL_UserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "SecurityAuditLog_pkey" PRIMARY KEY ("SAL_Id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "TX_Id" TEXT NOT NULL,
    "TX_Amount" DOUBLE PRECISION NOT NULL,
    "TX_Currency" TEXT NOT NULL DEFAULT 'XOF',
    "TX_Reference" TEXT NOT NULL,
    "TX_Status" "TransactionStatus" NOT NULL DEFAULT 'EN_COURS',
    "TX_PaymentMethod" "PaymentMethod" NOT NULL,
    "TX_ProofUrl" TEXT,
    "TX_AdminComment" TEXT,
    "tenantId" TEXT NOT NULL,
    "TX_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("TX_Id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "TK_Id" TEXT NOT NULL,
    "TK_Subject" TEXT NOT NULL,
    "TK_Description" TEXT NOT NULL,
    "TK_Status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "TK_Priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "TK_Response" TEXT,
    "TK_ResponseAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "TK_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TK_UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("TK_Id")
);

-- CreateTable
CREATE TABLE "_ProcessGovernance" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ParticipantsCauserie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_T_Email_key" ON "Tenant"("T_Email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_T_Domain_key" ON "Tenant"("T_Domain");

-- CreateIndex
CREATE INDEX "SitenantId_idx" ON "Site"("tenantId");

-- CreateIndex
CREATE INDEX "OrgUnitTytenantId_idx" ON "OrgUnitType"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUnitType_OUT_Label_tenantId_key" ON "OrgUnitType"("OUT_Label", "tenantId");

-- CreateIndex
CREATE INDEX "OrgUnitenantId_idx" ON "OrgUnit"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_U_Email_key" ON "User"("U_Email");

-- CreateIndex
CREATE INDEX "UsetenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "ProcessTytenantId_idx" ON "ProcessType"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessType_PT_Label_tenantId_key" ON "ProcessType"("PT_Label", "tenantId");

-- CreateIndex
CREATE INDEX "ProcessutenantId_idx" ON "Processus"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Processus_PR_CodtenantId_key" ON "Processus"("PR_Code", "tenantId");

-- CreateIndex
CREATE INDEX "tenantId_idx" ON "PAQ"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PAQ_PAQ_ProcessusId_PAQ_YetenantId_key" ON "PAQ"("PAQ_ProcessusId", "PAQ_Year", "tenantId");

-- CreateIndex
CREATE INDEX "Action_tenantId_idx" ON "Action"("tenantId");

-- CreateIndex
CREATE INDEX "GovernanceActivity_tenantId_idx" ON "GovernanceActivity"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Reclamation_REC_Reference_key" ON "Reclamation"("REC_Reference");

-- CreateIndex
CREATE INDEX "Reclamation_tenantId_idx" ON "Reclamation"("tenantId");

-- CreateIndex
CREATE INDEX "NonConformitenantId_idx" ON "NonConformite"("tenantId");

-- CreateIndex
CREATE INDEX "RiskTytenantId_idx" ON "RiskType"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskType_RT_Label_tenantId_key" ON "RiskType"("RT_Label", "tenantId");

-- CreateIndex
CREATE INDEX "Risk_tenantId_idx" ON "Risk"("tenantId");

-- CreateIndex
CREATE INDEX "SSEEventenantId_idx" ON "SSEEvent"("tenantId");

-- CreateIndex
CREATE INDEX "CauseritenantId_idx" ON "Causerie"("tenantId");

-- CreateIndex
CREATE INDEX "SSESttenantId_idx" ON "SSEStats"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_AU_Reference_key" ON "Audit"("AU_Reference");

-- CreateIndex
CREATE INDEX "AuditenantId_idx" ON "Audit"("tenantId");

-- CreateIndex
CREATE INDEX "Meeting_tenantId_idx" ON "Meeting"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "PreuvtenantId_idx" ON "Preuve"("tenantId");

-- CreateIndex
CREATE INDEX "IndicattenantId_idx" ON "Indicator"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorValue_IV_IndicatorId_IV_Month_IV_Year_key" ON "IndicatorValue"("IV_IndicatorId", "IV_Month", "IV_Year");

-- CreateIndex
CREATE INDEX "ProcessReview_tenantId_idx" ON "ProcessReview"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessReview_PRV_ProcessusId_PRV_Month_PRV_YetenantId_key" ON "ProcessReview"("PRV_ProcessusId", "PRV_Month", "PRV_Year", "tenantId");

-- CreateIndex
CREATE INDEX "RevueDirection_tenantId_idx" ON "RevueDirection"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_EQ_Reference_key" ON "Equipment"("EQ_Reference");

-- CreateIndex
CREATE INDEX "EquipmentenantId_idx" ON "Equipment"("tenantId");

-- CreateIndex
CREATE INDEX "CompetenctenantId_idx" ON "Competence"("tenantId");

-- CreateIndex
CREATE INDEX "Formation_tenantId_idx" ON "Formation"("tenantId");

-- CreateIndex
CREATE INDEX "TietenantId_idx" ON "Tier"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tier_TR_ItenantId_key" ON "Tier"("TR_Id", "tenantId");

-- CreateIndex
CREATE INDEX "SignatutenantId_idx" ON "Signature"("tenantId");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_tenantId_idx" ON "SecurityAuditLog"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_TX_Reference_key" ON "Transaction"("TX_Reference");

-- CreateIndex
CREATE INDEX "Transaction_tenantId_idx" ON "Transaction"("tenantId");

-- CreateIndex
CREATE INDEX "TicketenantId_idx" ON "Ticket"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProcessGovernance_AB_unique" ON "_ProcessGovernance"("A", "B");

-- CreateIndex
CREATE INDEX "_ProcessGovernance_B_index" ON "_ProcessGovernance"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipantsCauserie_AB_unique" ON "_ParticipantsCauserie"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipantsCauserie_B_index" ON "_ParticipantsCauserie"("B");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "SitenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnitType" ADD CONSTRAINT "OrgUnitTytenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_OU_TypeId_fkey" FOREIGN KEY ("OU_TypeId") REFERENCES "OrgUnitType"("OUT_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_OU_ParentId_fkey" FOREIGN KEY ("OU_ParentId") REFERENCES "OrgUnit"("OU_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_OU_SiteId_fkey" FOREIGN KEY ("OU_SiteId") REFERENCES "Site"("S_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnitenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "UsetenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_U_SiteId_fkey" FOREIGN KEY ("U_SiteId") REFERENCES "Site"("S_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_U_OrgUnitId_fkey" FOREIGN KEY ("U_OrgUnitId") REFERENCES "OrgUnit"("OU_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessType" ADD CONSTRAINT "ProcessTytenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "Processus_PR_TypeId_fkey" FOREIGN KEY ("PR_TypeId") REFERENCES "ProcessType"("PT_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "Processus_PR_PiloteId_fkey" FOREIGN KEY ("PR_PiloteId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "Processus_PR_CoPiloteId_fkey" FOREIGN KEY ("PR_CoPiloteId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processus" ADD CONSTRAINT "ProcessutenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAQ" ADD CONSTRAINT "PAQ_PAQ_ProcessusId_fkey" FOREIGN KEY ("PAQ_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAQ" ADD CONSTRAINT "PAQ_PAQ_QualityManagerId_fkey" FOREIGN KEY ("PAQ_QualityManagerId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAQ" ADD CONSTRAINT "tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_ResponsableId_fkey" FOREIGN KEY ("ACT_ResponsableId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_CreatorId_fkey" FOREIGN KEY ("ACT_CreatorId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_PAQId_fkey" FOREIGN KEY ("ACT_PAQId") REFERENCES "PAQ"("PAQ_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_NCId_fkey" FOREIGN KEY ("ACT_NCId") REFERENCES "NonConformite"("NC_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_ReclamationId_fkey" FOREIGN KEY ("ACT_ReclamationId") REFERENCES "Reclamation"("REC_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_AuditId_fkey" FOREIGN KEY ("ACT_AuditId") REFERENCES "Audit"("AU_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_MeetingId_fkey" FOREIGN KEY ("ACT_MeetingId") REFERENCES "Meeting"("MG_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_SSEEventId_fkey" FOREIGN KEY ("ACT_SSEEventId") REFERENCES "SSEEvent"("SSE_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceActivity" ADD CONSTRAINT "GovernanceActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_REC_TierId_fkey" FOREIGN KEY ("REC_TierId") REFERENCES "Tier"("TR_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_REC_ProcessusId_fkey" FOREIGN KEY ("REC_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_REC_OwnerId_fkey" FOREIGN KEY ("REC_OwnerId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformite" ADD CONSTRAINT "NonConformite_NC_ProcessusId_fkey" FOREIGN KEY ("NC_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformite" ADD CONSTRAINT "NonConformite_NC_ReclamationId_fkey" FOREIGN KEY ("NC_ReclamationId") REFERENCES "Reclamation"("REC_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformite" ADD CONSTRAINT "NonConformite_NC_AuditId_fkey" FOREIGN KEY ("NC_AuditId") REFERENCES "Audit"("AU_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformite" ADD CONSTRAINT "NonConformite_NC_DetectorId_fkey" FOREIGN KEY ("NC_DetectorId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformite" ADD CONSTRAINT "NonConformitenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskType" ADD CONSTRAINT "RiskTytenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_RS_TypeId_fkey" FOREIGN KEY ("RS_TypeId") REFERENCES "RiskType"("RT_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_RS_ProcessusId_fkey" FOREIGN KEY ("RS_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEEvent" ADD CONSTRAINT "SSEEvent_SSE_ReporterId_fkey" FOREIGN KEY ("SSE_ReporterId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEEvent" ADD CONSTRAINT "SSEEvent_SSE_VictimId_fkey" FOREIGN KEY ("SSE_VictimId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEEvent" ADD CONSTRAINT "SSEEvent_SSE_SiteId_fkey" FOREIGN KEY ("SSE_SiteId") REFERENCES "Site"("S_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEEvent" ADD CONSTRAINT "SSEEvent_SSE_ProcessusId_fkey" FOREIGN KEY ("SSE_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEEvent" ADD CONSTRAINT "SSEEventenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causerie" ADD CONSTRAINT "Causerie_CS_AnimateurId_fkey" FOREIGN KEY ("CS_AnimateurId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Causerie" ADD CONSTRAINT "CauseritenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSEStats" ADD CONSTRAINT "SSESttenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_AU_LeadId_fkey" FOREIGN KEY ("AU_LeadId") REFERENCES "User"("U_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_AU_SiteId_fkey" FOREIGN KEY ("AU_SiteId") REFERENCES "Site"("S_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_AU_ProcessusId_fkey" FOREIGN KEY ("AU_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "AuditenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_FI_AuditId_fkey" FOREIGN KEY ("FI_AuditId") REFERENCES "Audit"("AU_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_MG_ProcessId_fkey" FOREIGN KEY ("MG_ProcessId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendee" ADD CONSTRAINT "MeetingAttendee_MA_MeetingId_fkey" FOREIGN KEY ("MA_MeetingId") REFERENCES "Meeting"("MG_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendee" ADD CONSTRAINT "MeetingAttendee_MA_UserId_fkey" FOREIGN KEY ("MA_UserId") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "DocumentenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_DOC_SiteId_fkey" FOREIGN KEY ("DOC_SiteId") REFERENCES "Site"("S_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_DOC_ProcessusId_fkey" FOREIGN KEY ("DOC_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_DV_DocumentId_fkey" FOREIGN KEY ("DV_DocumentId") REFERENCES "Document"("DOC_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_DV_CreatedById_fkey" FOREIGN KEY ("DV_CreatedById") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preuve" ADD CONSTRAINT "Preuve_PV_AuditId_fkey" FOREIGN KEY ("PV_AuditId") REFERENCES "Audit"("AU_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preuve" ADD CONSTRAINT "Preuve_PV_NCId_fkey" FOREIGN KEY ("PV_NCId") REFERENCES "NonConformite"("NC_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preuve" ADD CONSTRAINT "Preuve_PV_ActionId_fkey" FOREIGN KEY ("PV_ActionId") REFERENCES "Action"("ACT_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preuve" ADD CONSTRAINT "Preuve_PV_DocumentId_fkey" FOREIGN KEY ("PV_DocumentId") REFERENCES "Document"("DOC_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preuve" ADD CONSTRAINT "PreuvtenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_IND_ProcessusId_fkey" FOREIGN KEY ("IND_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "IndicattenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorValue" ADD CONSTRAINT "IndicatorValue_IV_IndicatorId_fkey" FOREIGN KEY ("IV_IndicatorId") REFERENCES "Indicator"("IND_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessReview" ADD CONSTRAINT "ProcessReview_PRV_ProcessusId_fkey" FOREIGN KEY ("PRV_ProcessusId") REFERENCES "Processus"("PR_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessReview" ADD CONSTRAINT "ProcessReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevueDirection" ADD CONSTRAINT "RevueDirection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "EquipmentenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competence" ADD CONSTRAINT "CompetenctenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompetence" ADD CONSTRAINT "UserCompetence_UC_UserId_fkey" FOREIGN KEY ("UC_UserId") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompetence" ADD CONSTRAINT "UserCompetence_UC_CompetenceId_fkey" FOREIGN KEY ("UC_CompetenceId") REFERENCES "Competence"("CP_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_FOR_UserId_fkey" FOREIGN KEY ("FOR_UserId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tier" ADD CONSTRAINT "TietenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_SIG_UserId_fkey" FOREIGN KEY ("SIG_UserId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "SignatutenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_SAL_UserId_fkey" FOREIGN KEY ("SAL_UserId") REFERENCES "User"("U_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "TicketenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessGovernance" ADD CONSTRAINT "_ProcessGovernance_A_fkey" FOREIGN KEY ("A") REFERENCES "GovernanceActivity"("GA_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessGovernance" ADD CONSTRAINT "_ProcessGovernance_B_fkey" FOREIGN KEY ("B") REFERENCES "Processus"("PR_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantsCauserie" ADD CONSTRAINT "_ParticipantsCauserie_A_fkey" FOREIGN KEY ("A") REFERENCES "Causerie"("CS_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantsCauserie" ADD CONSTRAINT "_ParticipantsCauserie_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;
