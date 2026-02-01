-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "ACT_LegalRequirementId" TEXT;

-- CreateTable
CREATE TABLE "SenegalLegalRequirement" (
    "SLR_Id" TEXT NOT NULL,
    "SLR_Category" TEXT NOT NULL,
    "SLR_Title" TEXT NOT NULL,
    "SLR_Description" TEXT,
    "SLR_Reference" TEXT NOT NULL,
    "SLR_Domain" TEXT NOT NULL,
    "SLR_Authority" TEXT NOT NULL,
    "SLR_Deadline" TIMESTAMP(3),
    "SLR_Status" TEXT NOT NULL DEFAULT 'A_RESPECTER',
    "SLR_Evidence" TEXT,
    "SLR_Comment" TEXT,
    "SLR_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SLR_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SLR_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "SenegalLegalRequirement_pkey" PRIMARY KEY ("SLR_Id")
);

-- CreateTable
CREATE TABLE "LegalChecklist" (
    "LC_Id" TEXT NOT NULL,
    "LC_Standard" TEXT NOT NULL,
    "LC_Clause" TEXT NOT NULL,
    "LC_Title" TEXT NOT NULL,
    "LC_Description" TEXT NOT NULL,
    "LC_Criteria" TEXT NOT NULL,
    "LC_IsMandatory" BOOLEAN NOT NULL DEFAULT true,
    "LC_SenegalSpecific" BOOLEAN NOT NULL DEFAULT false,
    "LC_Reference" TEXT,
    "LC_IsActive" BOOLEAN NOT NULL DEFAULT true,
    "LC_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LC_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "LegalChecklist_pkey" PRIMARY KEY ("LC_Id")
);

-- CreateTable
CREATE TABLE "ChecklistResponse" (
    "CR_Id" TEXT NOT NULL,
    "CR_ChecklistId" TEXT NOT NULL,
    "CR_Response" TEXT NOT NULL,
    "CR_Evidence" TEXT,
    "CR_Comment" TEXT,
    "CR_IsCompliant" BOOLEAN NOT NULL DEFAULT false,
    "CR_CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CR_UpdatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ChecklistResponse_pkey" PRIMARY KEY ("CR_Id")
);

-- CreateIndex
CREATE INDEX "SenegalLegalRequirement_tenantId_idx" ON "SenegalLegalRequirement"("tenantId");

-- CreateIndex
CREATE INDEX "SenegalLegalRequirement_tenantId_SLR_Category_idx" ON "SenegalLegalRequirement"("tenantId", "SLR_Category");

-- CreateIndex
CREATE INDEX "SenegalLegalRequirement_tenantId_SLR_Status_idx" ON "SenegalLegalRequirement"("tenantId", "SLR_Status");

-- CreateIndex
CREATE INDEX "SenegalLegalRequirement_tenantId_SLR_Authority_idx" ON "SenegalLegalRequirement"("tenantId", "SLR_Authority");

-- CreateIndex
CREATE INDEX "LegalChecklist_tenantId_idx" ON "LegalChecklist"("tenantId");

-- CreateIndex
CREATE INDEX "LegalChecklist_tenantId_LC_Standard_idx" ON "LegalChecklist"("tenantId", "LC_Standard");

-- CreateIndex
CREATE INDEX "LegalChecklist_tenantId_LC_Clause_idx" ON "LegalChecklist"("tenantId", "LC_Clause");

-- CreateIndex
CREATE INDEX "ChecklistResponse_tenantId_idx" ON "ChecklistResponse"("tenantId");

-- CreateIndex
CREATE INDEX "ChecklistResponse_CR_ChecklistId_idx" ON "ChecklistResponse"("CR_ChecklistId");

-- CreateIndex
CREATE INDEX "ChecklistResponse_tenantId_CR_Response_idx" ON "ChecklistResponse"("tenantId", "CR_Response");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ACT_LegalRequirementId_fkey" FOREIGN KEY ("ACT_LegalRequirementId") REFERENCES "SenegalLegalRequirement"("SLR_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SenegalLegalRequirement" ADD CONSTRAINT "SenegalLegalRequirement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalChecklist" ADD CONSTRAINT "LegalChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistResponse" ADD CONSTRAINT "ChecklistResponse_CR_ChecklistId_fkey" FOREIGN KEY ("CR_ChecklistId") REFERENCES "LegalChecklist"("LC_Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistResponse" ADD CONSTRAINT "ChecklistResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("T_Id") ON DELETE CASCADE ON UPDATE CASCADE;
