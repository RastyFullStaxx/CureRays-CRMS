-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ChartRoundsPhase" AS ENUM ('UPCOMING', 'ON_TREATMENT', 'POST');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'PAUSED');

-- CreateEnum
CREATE TYPE "DiagnosisCategory" AS ENUM ('SKIN_CANCER', 'ARTHRITIS', 'DUPUYTRENS');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_NEEDED', 'MISSING_FIELDS', 'READY_FOR_REVIEW', 'SIGNED', 'EXPORTED', 'NOT_APPLICABLE', 'NEEDS_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TemplateSourceStatus" AS ENUM ('ACTIVE', 'DRAFT', 'RETIRED', 'MISSING', 'MAPPING_IN_PROGRESS');

-- CreateEnum
CREATE TYPE "TemplateSourceMimeType" AS ENUM ('DOCX', 'XLSX', 'PPTX', 'FOLDER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WorkflowDefinitionStatus" AS ENUM ('ACTIVE', 'DRAFT', 'MAPPING_IN_PROGRESS');

-- CreateTable
CREATE TABLE "OperationalPatient" (
    "patientRef" TEXT NOT NULL,
    "phiRecordId" TEXT NOT NULL,
    "displayLabel" TEXT NOT NULL,
    "diagnosisCategory" "DiagnosisCategory" NOT NULL,
    "chartRoundsPhase" "ChartRoundsPhase" NOT NULL,
    "status" "PatientStatus" NOT NULL,
    "assignedStaff" TEXT NOT NULL,
    "activeCourseRef" TEXT,
    "nextActionCategory" TEXT NOT NULL,
    "checklist" JSONB NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalPatient_pkey" PRIMARY KEY ("patientRef")
);

-- CreateTable
CREATE TABLE "OperationalCourse" (
    "courseRef" TEXT NOT NULL,
    "patientRef" TEXT NOT NULL,
    "diagnosisCategory" "DiagnosisCategory" NOT NULL,
    "protocolFamily" TEXT NOT NULL,
    "workflowDefinitionId" TEXT,
    "bodyRegion" TEXT,
    "laterality" TEXT,
    "totalFractions" INTEGER NOT NULL,
    "currentFraction" INTEGER NOT NULL,
    "chartRoundsPhase" "ChartRoundsPhase" NOT NULL,
    "status" TEXT NOT NULL,
    "coursePhase" TEXT,

    CONSTRAINT "OperationalCourse_pkey" PRIMARY KEY ("courseRef")
);

-- CreateTable
CREATE TABLE "OperationalWorkflowStep" (
    "id" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responsibleRole" TEXT NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "requiresSignature" BOOLEAN NOT NULL,
    "linkedDocumentId" TEXT,
    "naReason" TEXT,
    "blockers" TEXT[],
    "auditChecklist" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalWorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalAuditCheck" (
    "id" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "evidenceDocumentId" TEXT,
    "notes" TEXT,
    "completedByUserId" TEXT,
    "completedAt" TIMESTAMP(3),
    "naReason" TEXT,

    CONSTRAINT "OperationalAuditCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFolderPlaceholder" (
    "id" TEXT NOT NULL,
    "patientRef" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "folders" TEXT[],
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseFolderPlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientRecordHistory" (
    "id" TEXT NOT NULL,
    "patientRef" TEXT NOT NULL,
    "courseRef" TEXT,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "previousValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "role" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "deviceId" TEXT,
    "reason" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientRecordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarepathTask" (
    "id" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "taskNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "workflowPhase" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responsibleParty" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "noteAction" TEXT NOT NULL,
    "cptCodes" TEXT[],
    "auditSteps" TEXT[],
    "auditReady" BOOLEAN NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "assignedUser" TEXT NOT NULL,

    CONSTRAINT "CarepathTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "patientRef" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clinicalPhase" TEXT NOT NULL,
    "responsibleParty" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "requiredAction" TEXT NOT NULL,
    "cptCode" TEXT,
    "assignedTo" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "signedAt" TIMESTAMP(3),
    "exportedAt" TIMESTAMP(3),
    "signReviewState" TEXT NOT NULL,
    "auditReady" BOOLEAN NOT NULL,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "driveFileId" TEXT,
    "driveUrl" TEXT,
    "mimeType" "TemplateSourceMimeType" NOT NULL,
    "status" "TemplateSourceStatus" NOT NULL,
    "notes" TEXT,
    "modifiedAt" TIMESTAMP(3),

    CONSTRAINT "TemplateSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequirement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workflowPhase" TEXT NOT NULL,
    "responsibleParty" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "protocol" TEXT,
    "bodyRegion" TEXT,
    "treatmentModality" TEXT,
    "universal" BOOLEAN NOT NULL DEFAULT false,
    "requiredWhen" TEXT,
    "templateSourceId" TEXT,
    "defaultStatus" "DocumentStatus" NOT NULL,
    "requiredAction" TEXT NOT NULL,
    "requiredFields" TEXT[],
    "outputFormats" TEXT[],
    "cptCode" TEXT,
    "createsTask" BOOLEAN NOT NULL DEFAULT false,
    "autoCreate" BOOLEAN NOT NULL DEFAULT true,
    "taskTitle" TEXT,
    "taskNumber" TEXT,
    "timing" TEXT,
    "auditSteps" TEXT[],

    CONSTRAINT "DocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phases" TEXT[],
    "documentRequirementIds" TEXT[],
    "status" "WorkflowDefinitionStatus" NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDocumentState" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "documentId" TEXT,
    "patientRef" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workflowPhase" TEXT NOT NULL,
    "responsibleParty" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "requiredAction" TEXT NOT NULL,
    "auditReady" BOOLEAN NOT NULL,
    "templateSourceStatus" "TemplateSourceStatus",
    "sourceDriveUrl" TEXT,
    "mapped" BOOLEAN NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDocumentState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalAuditEvent" (
    "id" TEXT NOT NULL,
    "patientRef" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "deviceId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "redacted" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "OperationalAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationalPatient_phiRecordId_key" ON "OperationalPatient"("phiRecordId");

-- AddForeignKey
ALTER TABLE "OperationalCourse" ADD CONSTRAINT "OperationalCourse_patientRef_fkey" FOREIGN KEY ("patientRef") REFERENCES "OperationalPatient"("patientRef") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_templateSourceId_fkey" FOREIGN KEY ("templateSourceId") REFERENCES "TemplateSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

