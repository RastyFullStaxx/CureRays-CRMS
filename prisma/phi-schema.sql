-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ChartRoundsPhase" AS ENUM ('UPCOMING', 'ON_TREATMENT', 'POST');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'PAUSED');

-- CreateEnum
CREATE TYPE "DiagnosisCategory" AS ENUM ('SKIN_CANCER', 'ARTHRITIS', 'DUPUYTRENS');

-- CreateTable
CREATE TABLE "PatientPhi" (
    "id" TEXT NOT NULL,
    "patientRef" TEXT NOT NULL,
    "phiRecordId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "diagnosisCategory" "DiagnosisCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "physician" TEXT NOT NULL,
    "chartRoundsPhase" "ChartRoundsPhase" NOT NULL,
    "status" "PatientStatus" NOT NULL,
    "assignedStaff" TEXT NOT NULL,
    "activeCourseId" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "flags" JSONB NOT NULL,
    "notes" TEXT NOT NULL,
    "checklist" JSONB NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentCoursePhi" (
    "id" TEXT NOT NULL,
    "courseRef" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "diagnosisCategory" "DiagnosisCategory" NOT NULL,
    "protocolName" TEXT NOT NULL,
    "totalFractions" INTEGER NOT NULL,
    "currentFraction" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "chartRoundsPhase" "ChartRoundsPhase" NOT NULL,
    "status" TEXT NOT NULL,
    "treatmentModality" TEXT NOT NULL,
    "treatmentType" TEXT NOT NULL,
    "workflowDefinitionId" TEXT,
    "bodyRegion" TEXT,
    "laterality" TEXT,
    "coursePhase" TEXT,
    "phaseOne" TEXT,
    "phaseTwo" TEXT,
    "energy" TEXT,
    "applicator" TEXT,
    "dose" TEXT,
    "targetDepth" TEXT,
    "fieldDesign" TEXT,
    "notes" TEXT NOT NULL,

    CONSTRAINT "TreatmentCoursePhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationOrderPhi" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lesionLocation" TEXT NOT NULL,
    "laterality" TEXT NOT NULL,
    "lesionBorderInked" BOOLEAN NOT NULL,
    "allMarginsInked" BOOLEAN NOT NULL,
    "phaseIMarginInstruction" TEXT NOT NULL,
    "phaseIIMarginInstruction" TEXT NOT NULL,
    "chairSetup" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "setupPhotoChecklist" TEXT[],
    "ultrasoundFrequencies" TEXT[],
    "specialPhysicsRequired" BOOLEAN NOT NULL,
    "specialPhysicsReason" TEXT NOT NULL,
    "weeklyPhysicsRequired" BOOLEAN NOT NULL,
    "weeklyPhysicsReason" TEXT NOT NULL,
    "inVivoDosimetryRequired" BOOLEAN NOT NULL,
    "radiationOncologist" TEXT NOT NULL,
    "dateCompleted" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationOrderPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionPhi" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "laterality" TEXT NOT NULL,
    "verifiedInSensus" BOOLEAN NOT NULL,
    "imagingGuidance" TEXT[],
    "priorRadiationTherapy" BOOLEAN NOT NULL,
    "preAuthorized" BOOLEAN NOT NULL,
    "signedAt" TIMESTAMP(3),
    "dateOrdered" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionPhasePhi" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "phaseName" TEXT NOT NULL,
    "energyKv" INTEGER NOT NULL,
    "phaseTotalDoseGy" DECIMAL(65,30) NOT NULL,
    "dosePerFractionGy" DECIMAL(65,30) NOT NULL,
    "totalFractions" INTEGER NOT NULL,
    "timeMinutes" DECIMAL(65,30) NOT NULL,
    "ssdCm" DECIMAL(65,30) NOT NULL,
    "applicatorSize" TEXT NOT NULL,
    "marginMm" INTEGER NOT NULL,
    "technique" TEXT NOT NULL,
    "shieldingDesign" TEXT NOT NULL,
    "depthOfTargetMm" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PrescriptionPhasePhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MappingRecordPhi" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "diagnosis" "DiagnosisCategory" NOT NULL,
    "bodySite" TEXT NOT NULL,
    "laterality" TEXT NOT NULL,
    "impressions" TEXT NOT NULL,
    "fieldDesignDecision" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MappingRecordPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FractionLogEntryPhi" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "fractionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "date" TIMESTAMP(3) NOT NULL,
    "phase" TEXT NOT NULL,
    "energy" TEXT NOT NULL,
    "energyKv" INTEGER,
    "ssd" TEXT NOT NULL,
    "ssdCm" DECIMAL(65,30),
    "fieldSizeCm" TEXT,
    "treatmentTimeMinutes" DECIMAL(65,30),
    "dosePerFraction" INTEGER NOT NULL,
    "dosePerFractionCgy" INTEGER,
    "cumulativeDose" INTEGER NOT NULL,
    "cumulativeDoseCgy" DECIMAL(65,30),
    "technicianInitials" TEXT NOT NULL,
    "mdApproval" BOOLEAN NOT NULL,
    "mdApprovalState" TEXT,
    "mdApprovedAt" TIMESTAMP(3),
    "mdApprovedByUserId" TEXT,
    "dotApproval" BOOLEAN NOT NULL,
    "dotApprovalState" TEXT,
    "dotApprovedAt" TIMESTAMP(3),
    "dotApprovedByUserId" TEXT,
    "depthOfTarget" TEXT NOT NULL,
    "depthOfTargetMm" DECIMAL(65,30),
    "isodosePercent" INTEGER NOT NULL,
    "isodoseToDotPercent" DECIMAL(65,30),
    "doseToDepth" INTEGER NOT NULL,
    "doseToDotCgy" DECIMAL(65,30),
    "cumulativeDoseToDepth" INTEGER NOT NULL,
    "cumulativeDoseToDotCgy" DECIMAL(65,30),
    "treatmentSetupComments" TEXT,
    "isodoseOverrideReason" TEXT,
    "calculationStatus" TEXT,
    "calculationReferenceVersion" TEXT,
    "calculationSourceTemplate" TEXT,
    "calculationSourceTabs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "calculationDepthRoundedMm" DECIMAL(65,30),
    "calculationLookupKey" TEXT,
    "calculationClinicalValidationRequired" BOOLEAN NOT NULL DEFAULT true,
    "calculationWarnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isodoseNote" TEXT,
    "revisionApprovalType" TEXT,
    "revisionReason" TEXT,
    "revisionRequestedAt" TIMESTAMP(3),
    "revisionRequestedByUserId" TEXT,
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedByUserId" TEXT,
    "correctionReason" TEXT,
    "correctedAt" TIMESTAMP(3),
    "correctedByUserId" TEXT,
    "notes" TEXT NOT NULL,

    CONSTRAINT "FractionLogEntryPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentFractionPhi" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "fractionNumber" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "treatmentDate" TIMESTAMP(3) NOT NULL,
    "plannedDose" INTEGER NOT NULL,
    "deliveredDose" INTEGER,
    "cumulativeDose" INTEGER NOT NULL,
    "energy" TEXT,
    "applicator" TEXT,
    "imageGuidanceCompleted" BOOLEAN NOT NULL DEFAULT false,
    "imageGuidanceStatus" TEXT,
    "imageAssetIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageGuidanceNotApplicableReason" TEXT,
    "scheduledFromPrescription" BOOLEAN NOT NULL DEFAULT false,
    "sourcePrescriptionId" TEXT,
    "sourcePhaseId" TEXT,
    "linkedFractionLogEntryId" TEXT,
    "physicsCheckRequired" BOOLEAN NOT NULL DEFAULT false,
    "physicsCheckCompletedAt" TIMESTAMP(3),
    "physicsCheckCompletedByUserId" TEXT,
    "otvRequired" BOOLEAN NOT NULL DEFAULT false,
    "otvCompletedAt" TIMESTAMP(3),
    "otvCompletedByUserId" TEXT,
    "generatedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "therapistId" TEXT,
    "physicianReviewedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "TreatmentFractionPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocumentOutputPhi" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "driveFileUrl" TEXT,
    "contentPreview" TEXT NOT NULL,
    "renderedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedDocumentOutputPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhiAuditEvent" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
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
    "timestamp" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "PhiAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientPhi_patientRef_key" ON "PatientPhi"("patientRef");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPhi_phiRecordId_key" ON "PatientPhi"("phiRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPhi_mrn_key" ON "PatientPhi"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentCoursePhi_courseRef_key" ON "TreatmentCoursePhi"("courseRef");

-- AddForeignKey
ALTER TABLE "TreatmentCoursePhi" ADD CONSTRAINT "TreatmentCoursePhi_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientPhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationOrderPhi" ADD CONSTRAINT "SimulationOrderPhi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TreatmentCoursePhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionPhi" ADD CONSTRAINT "PrescriptionPhi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TreatmentCoursePhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionPhasePhi" ADD CONSTRAINT "PrescriptionPhasePhi_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "PrescriptionPhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MappingRecordPhi" ADD CONSTRAINT "MappingRecordPhi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TreatmentCoursePhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FractionLogEntryPhi" ADD CONSTRAINT "FractionLogEntryPhi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TreatmentCoursePhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentFractionPhi" ADD CONSTRAINT "TreatmentFractionPhi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TreatmentCoursePhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocumentOutputPhi" ADD CONSTRAINT "GeneratedDocumentOutputPhi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TreatmentCoursePhi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhiAuditEvent" ADD CONSTRAINT "PhiAuditEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientPhi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

