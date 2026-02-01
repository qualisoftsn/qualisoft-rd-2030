-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "ACT_RegulatoryRequirementId" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "DOC_RegulatoryRequirementId" TEXT;

-- CreateTable
CREATE TABLE "RegulatoryRequirement" (
    "RR_Id" TEXT NOT NULL,
    "RR_Title" TEXT NOT NULL,
    "RR_Description" TEXT NOT NULL,
    "RR_Category" TEXT NOT NULL,
    "RR_Type" TEXT NOT NULL,
    "RR_Reference" TEXT NOT NULL,
    "RR_Authority" TEXT NOT NULL,
    "RR_DueDate" TIMESTAMP(3) NOT NULL,
    "RR_Frequency" INTEGER,
    "RR_LastCompliance" TIMESTAMP(3),
    "RR_Status" TEXT NOT NULL DEFAULT 'PENDING',
    "RR_Priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "RR_EvidenceUrl" TEXT,
    "RR_Comment" TEXT,
    "RR_IsRecurring" BOOLEAN NOT NULL DEFAULT false,
    "RR_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "RR_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "RR_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "RegulatoryRequirement_pkey" PRIMARY KEY ("RR_Id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "AL_Id" TEXT NOT NULL,
    "AL_Title" TEXT NOT NULL,
    "AL_Message" TEXT NOT NULL,
    "AL_Type" TEXT NOT NULL,
    "AL_Priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "AL_Status" TEXT NOT NULL DEFAULT 'UNREAD',
    "AL_DueDate" TIMESTAMP(3) NOT NULL,
    "AL_TriggerDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AL_ResolveDate" TIMESTAMP(3),
    "AL_IsPushSent" BOOLEAN NOT NULL DEFAULT false,
    "AL_IsEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "AL_IsSmsSent" BOOLEAN NOT NULL DEFAULT false,
    "AL_RequirementId" TEXT,
    "AL_AuditId" TEXT,
    "AL_ActionId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("AL_Id")
);

-- CreateTable
CREATE TABLE "AlertRecipient" (
    "AR_Id" TEXT NOT NULL,
    "AR_AlertId" TEXT NOT NULL,
    "AR_UserId" TEXT NOT NULL,
    "AR_ReadAt" TIMESTAMP(3),
    "AR_Status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "AlertRecipient_pkey" PRIMARY KEY ("AR_Id")
);

-- CreateTable
CREATE TABLE "LegalUpdate" (
    "LU_Id" TEXT NOT NULL,
    "LU_Title" TEXT NOT NULL,
    "LU_Summary" TEXT NOT NULL,
    "LU_Content" TEXT NOT NULL,
    "LU_Source" TEXT NOT NULL,
    "LU_PublicationDate" TIMESTAMP(3) NOT NULL,
    "LU_EffectiveDate" TIMESTAMP(3),
    "LU_Category" TEXT NOT NULL,
    "LU_Impact" TEXT NOT NULL,
    "LU_IsPublished" BOOLEAN NOT NULL DEFAULT false,
    "LU_PublishedAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "LegalUpdate_pkey" PRIMARY KEY ("LU_Id")
);

-- CreateTable
CREATE TABLE "ComplianceCalendar" (
    "CC_Id" TEXT NOT NULL,
    "CC_Title" TEXT NOT NULL,
    "CC_Description" TEXT,
    "CC_Date" TIMESTAMP(3) NOT NULL,
    "CC_Type" TEXT NOT NULL,
    "CC_IsMandatory" BOOLEAN NOT NULL DEFAULT true,
    "CC_IsRecurring" BOOLEAN NOT NULL DEFAULT false,
    "CC_Frequency" INTEGER,
    "CC_LastDone" TIMESTAMP(3),
    "CC_NextDue" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ComplianceCalendar_pkey" PRIMARY KEY ("CC_Id")
);

-- CreateIndex
CREATE INDEX "RegulatoryRequirement_tenantId_idx" ON "RegulatoryRequirement"("tenantId");

-- CreateIndex
CREATE INDEX "RegulatoryRequirement_tenantId_RR_Status_idx" ON "RegulatoryRequirement"("tenantId", "RR_Status");

-- CreateIndex
CREATE INDEX "RegulatoryRequirement_tenantId_RR_Priority_idx" ON "RegulatoryRequirement"("tenantId", "RR_Priority");

-- CreateIndex
CREATE INDEX "RegulatoryRequirement_tenantId_RR_Category_idx" ON "RegulatoryRequirement"("tenantId", "RR_Category");

-- CreateIndex
CREATE INDEX "RegulatoryRequirement_RR_DueDate_idx" ON "RegulatoryRequirement"("RR_DueDate");

-- CreateIndex
CREATE INDEX "Alert_tenantId_idx" ON "Alert"("tenantId");

-- CreateIndex
CREATE INDEX "Alert_tenantId_AL_Status_idx" ON "Alert"("tenantId", "AL_Status");

-- CreateIndex
CREATE INDEX "Alert_tenantId_AL_Priority_idx" ON "Alert"("tenantId", "AL_Priority");

-- CreateIndex
CREATE INDEX "Alert_AL_DueDate_idx" ON "Alert"("AL_DueDate");

-- CreateIndex
CREATE INDEX "Alert_AL_TriggerDate_idx" ON "Alert"("AL_TriggerDate");

-- CreateIndex
CREATE INDEX "AlertRecipient_AR_UserId_idx" ON "AlertRecipient"("AR_UserId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertRecipient_AR_AlertId_AR_UserId_key" ON "AlertRecipient"("AR_AlertId", "AR_UserId");

-- CreateIndex
CREATE INDEX "LegalUpdate_tenantId_idx" ON "LegalUpdate"("tenantId");

-- CreateIndex
CREATE INDEX "LegalUpdate_LU_PublicationDate_idx" ON "LegalUpdate"("LU_PublicationDate");

-- CreateIndex
CREATE INDEX "LegalUpdate_LU_Category_idx" ON "LegalUpdate"("LU_Category");

-- CreateIndex
CREATE INDEX "ComplianceCalendar_tenantId_idx" ON "ComplianceCalendar"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceCalendar_CC_Date_idx" ON "ComplianceCalendar"("CC_Date");

-- CreateIndex
CREATE INDEX "ComplianceCalendar_CC_NextDue_idx" ON "ComplianceCalendar"("CC_NextDue");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_RegulatoryRequirementId_fkey" FOREIGN KEY ("ACT_RegulatoryRequirementId") REFERENCES "RegulatoryRequirement"("RR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_DOC_RegulatoryRequirementId_fkey" FOREIGN KEY ("DOC_RegulatoryRequirementId") REFERENCES "RegulatoryRequirement"("RR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatoryRequirement" ADD CONSTRAINT "RegulatoryRequirement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_AL_RequirementId_fkey" FOREIGN KEY ("AL_RequirementId") REFERENCES "RegulatoryRequirement"("RR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_AL_AuditId_fkey" FOREIGN KEY ("AL_AuditId") REFERENCES "Audit"("AU_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_AL_ActionId_fkey" FOREIGN KEY ("AL_ActionId") REFERENCES "Action"("ACT_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRecipient" ADD CONSTRAINT "AlertRecipient_AR_AlertId_fkey" FOREIGN KEY ("AR_AlertId") REFERENCES "Alert"("AL_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRecipient" ADD CONSTRAINT "AlertRecipient_AR_UserId_fkey" FOREIGN KEY ("AR_UserId") REFERENCES "User"("U_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalUpdate" ADD CONSTRAINT "LegalUpdate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCalendar" ADD CONSTRAINT "ComplianceCalendar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;
