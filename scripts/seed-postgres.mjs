import { PrismaClient as OpsClient } from '../node_modules/.prisma/ops-client/index.js';
import { PrismaClient as PhiClient } from '../node_modules/.prisma/phi-client/index.js';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ops = new OpsClient();
const phi = new PhiClient();
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const now = new Date('2026-06-12T09:00:00.000Z');
const dayMs = 24 * 60 * 60 * 1000;

function days(offset) {
  return new Date(now.getTime() + offset * dayMs);
}

const checklist = {
  txSummaryComplete: false,
  followUpScheduled: false,
  billingComplete: false,
};

const patients = [
  ['CR-2401', 'PREF-CR-2401', 'PHI-CR-2401', 'Amelia', 'Grant', 'MRN-700241', 'Basal cell carcinoma, right cheek', 'SKIN_CANCER', 'Grass Valley', 'Dr. Sarah Johnson', 'ON_TREATMENT', 'ACTIVE', 'Iris Lim, RTT', 'COURSE-2401', 'Fraction approval pending'],
  ['CR-2402', 'PREF-CR-2402', 'PHI-CR-2402', 'Noah', 'Bennett', 'MRN-700242', 'Dupuytren contracture, left hand', 'DUPUYTRENS', 'Auburn', 'Dr. Mateo Reyes', 'UPCOMING', 'ACTIVE', 'Tracy Chen, MA', 'COURSE-2402', 'Simulation order review'],
  ['CR-2403', 'PREF-CR-2403', 'PHI-CR-2403', 'Maya', 'Patel', 'MRN-700243', 'Knee osteoarthritis', 'ARTHRITIS', 'Grass Valley', 'Dr. Sarah Johnson', 'POST', 'ACTIVE', 'Amanda Lee, Billing', 'COURSE-2403', 'Closeout audit evidence'],
  ['CR-2404', 'PREF-CR-2404', 'PHI-CR-2404', 'Lucas', 'Rivera', 'MRN-700244', 'Squamous cell carcinoma, scalp', 'SKIN_CANCER', 'Grass Valley', 'Dr. Sarah Johnson', 'ON_TREATMENT', 'ON_HOLD', 'John Smith, QA', 'COURSE-2404', 'Physics review blocker'],
  ['CR-2405', 'PREF-CR-2405', 'PHI-CR-2405', 'Evelyn', 'Stone', 'MRN-700245', 'Thumb CMC arthritis', 'ARTHRITIS', 'Auburn', 'Dr. Mateo Reyes', 'UPCOMING', 'ACTIVE', 'Tracy Chen, MA', 'COURSE-2405', 'Preauth documentation'],
  ['CR-2406', 'PREF-CR-2406', 'PHI-CR-2406', 'Henry', 'Cho', 'MRN-700246', 'Basal cell carcinoma, nasal ala', 'SKIN_CANCER', 'Grass Valley', 'Dr. Sarah Johnson', 'ON_TREATMENT', 'ACTIVE', 'Iris Lim, RTT', 'COURSE-2406', 'Weekly physics chart check'],
  ['CR-2407', 'PREF-CR-2407', 'PHI-CR-2407', 'Sofia', 'Nguyen', 'MRN-700247', 'Plantar fasciitis protocol review', 'ARTHRITIS', 'Grass Valley', 'Dr. Mateo Reyes', 'POST', 'ACTIVE', 'Amanda Lee, Billing', 'COURSE-2407', 'Treatment summary signature'],
  ['CR-2408', 'PREF-CR-2408', 'PHI-CR-2408', 'Owen', 'Carter', 'MRN-700248', 'Dupuytren contracture, right hand', 'DUPUYTRENS', 'Auburn', 'Dr. Mateo Reyes', 'UPCOMING', 'PAUSED', 'John Smith, QA', 'COURSE-2408', 'Mapping fields missing'],
];

const courseConfig = {
  SKIN_CANCER: ['Skin Cancer IGSRT', 'IGSRT', 'SRT', 20, 'Skin Cancer'],
  ARTHRITIS: ['Joint Orthovoltage', 'Orthovoltage', 'Arthritis', 6, 'Arthritis'],
  DUPUYTRENS: ['Dupuytren Orthovoltage', 'Orthovoltage', 'Dupuytren', 10, 'Dupuytren'],
};

const phaseByChart = {
  UPCOMING: 'SIMULATION',
  ON_TREATMENT: 'ON_TREATMENT',
  POST: 'AUDIT',
};

const taskTemplates = [
  ['01', 'Carepath Preauth', 'CHART_PREP', 'Carepath Preauth Packet', 'VA', 'Confirm authorization and referral packet.', ['77280']],
  ['02', 'Simulation Order', 'SIMULATION', 'Simulation Order', 'RAD_ONC', 'Finalize simulation setup and lesion site.', ['77290']],
  ['03', 'Clinical Treatment Planning Note', 'PLANNING', 'Planning Note', 'PHYSICIST', 'Resolve planning and physics readiness.', ['77300']],
  ['04', 'Fractionation Log', 'ON_TREATMENT', 'Fractionation Log', 'RTT', 'Record and approve treatment fraction.', ['77401']],
  ['05', 'Treatment Summary', 'POST_TX', 'Treatment Summary', 'RAD_ONC', 'Complete summary and follow-up handoff.', ['77427']],
  ['06', 'Carepath Audit Sign', 'AUDIT', 'Carepath Audit Note', 'BILLING', 'Close billing and audit evidence.', ['G6001']],
];

const documentTemplates = [
  ['DOC-TPL-01', 'Carepath Preauth Packet', 'CHART_PREP', 'VA', 'PENDING_NEEDED', 'READY_FOR_SIGNATURE'],
  ['DOC-TPL-02', 'Simulation Order', 'SIMULATION', 'RAD_ONC', 'READY_FOR_REVIEW', 'READY_FOR_SIGNATURE'],
  ['DOC-TPL-03', 'Planning Note', 'PLANNING', 'PHYSICIST', 'MISSING_FIELDS', 'REVIEW_REQUIRED'],
  ['DOC-TPL-04', 'Fractionation Log', 'ON_TREATMENT', 'RTT', 'READY_FOR_REVIEW', 'READY_FOR_SIGNATURE'],
  ['DOC-TPL-05', 'Treatment Summary', 'POST_TX', 'RAD_ONC', 'SIGNED', 'SIGNED'],
  ['DOC-TPL-06', 'Carepath Audit Note', 'AUDIT', 'BILLING', 'NEEDS_REVIEW', 'REVIEW_REQUIRED'],
];

function patientFlags(index, chartPhase, status) {
  const flags = [];
  if (index % 3 === 0) {
    flags.push({ id: `FLAG-${index + 1}-HIGH`, severity: 'HIGH', summary: 'Signature or approval risk before next handoff', owner: 'RAD_ONC', dueDate: days(1).toISOString() });
  }
  if (status === 'ON_HOLD') {
    flags.push({ id: `FLAG-${index + 1}-HOLD`, severity: 'HIGH', summary: 'Treatment hold needs physics disposition', owner: 'PHYSICIST', dueDate: days(0).toISOString() });
  }
  if (chartPhase === 'UPCOMING') {
    flags.push({ id: `FLAG-${index + 1}-SIM`, severity: 'MEDIUM', summary: 'Simulation prep packet is not fully mapped', owner: 'MA', dueDate: days(2).toISOString() });
  }
  return flags;
}

function taskStatus(index, taskIndex) {
  if (index === 3 && taskIndex === 2) return 'BLOCKED';
  if (index === 7 && taskIndex === 1) return 'NEEDS_REVIEW';
  if (taskIndex < 2 && index % 2 === 0) return 'COMPLETED';
  if (taskIndex === 5 && index % 3 === 0) return 'OVERDUE';
  if (taskIndex === 3) return 'READY_FOR_REVIEW';
  return 'IN_PROGRESS';
}

function documentStatus(index, docIndex, base) {
  if (index === 3 && docIndex === 2) return 'MISSING_FIELDS';
  if (index === 7 && docIndex === 1) return 'NEEDS_REVIEW';
  if (docIndex < 2 && index % 2 === 0) return 'SIGNED';
  return base;
}

async function clearDatabase() {
  await phi.phiAuditEvent.deleteMany();
  await phi.generatedDocumentOutputPhi.deleteMany();
  await phi.treatmentFractionPhi.deleteMany();
  await phi.fractionLogEntryPhi.deleteMany();
  await phi.mappingRecordPhi.deleteMany();
  await phi.prescriptionPhasePhi.deleteMany();
  await phi.prescriptionPhi.deleteMany();
  await phi.simulationOrderPhi.deleteMany();
  await phi.treatmentCoursePhi.deleteMany();
  await phi.patientPhi.deleteMany();

  await ops.operationalAuditEvent.deleteMany();
  await ops.workflowDocumentState.deleteMany();
  await ops.workflowDefinition.deleteMany();
  await ops.documentRequirement.deleteMany();
  await ops.templateSource.deleteMany();
  await ops.generatedDocument.deleteMany();
  await ops.carepathTask.deleteMany();
  await ops.patientRecordHistory.deleteMany();
  await ops.courseFolderPlaceholder.deleteMany();
  await ops.operationalAuditCheck.deleteMany();
  await ops.operationalWorkflowStep.deleteMany();
  await ops.operationalCourse.deleteMany();
  await ops.operationalPatient.deleteMany();
}

async function seedOpsStaticRows() {
  const templateSources = [
    ['TPL-SRC-01', 'Carepath Preauth Packet', '01_Carepath_Preauth.docx', 'DOCX', 'ACTIVE'],
    ['TPL-SRC-02', 'Simulation Order', '02_Simulation_Order.docx', 'DOCX', 'ACTIVE'],
    ['TPL-SRC-03', 'Clinical Planning Note', '03_Clinical_Planning.docx', 'DOCX', 'MAPPING_IN_PROGRESS'],
    ['TPL-SRC-04', 'Fractionation Log', '04_Fractionation_Log.xlsx', 'XLSX', 'ACTIVE'],
    ['TPL-SRC-05', 'Treatment Summary', '05_Treatment_Summary.docx', 'DOCX', 'DRAFT'],
    ['TPL-SRC-06', 'Carepath Audit Note', '06_Carepath_Audit.docx', 'DOCX', 'MISSING'],
  ];

  for (const [id, name, sourceFileName, mimeType, status] of templateSources) {
    await ops.templateSource.create({
      data: {
        id,
        name,
        sourceFileName,
        mimeType,
        status,
        driveFileId: `drive-${id.toLowerCase()}`,
        driveUrl: `https://drive.example.local/${id}`,
        notes: 'Seeded local template registry row.',
        modifiedAt: days(-2),
      },
    });
  }

  for (const [index, template] of documentTemplates.entries()) {
    const [, name, phase, party, status] = template;
    await ops.documentRequirement.create({
      data: {
        id: `REQ-${index + 1}`,
        name,
        workflowPhase: phase,
        responsibleParty: party,
        diagnosis: index % 2 === 0 ? 'SKIN_CANCER' : 'ALL',
        protocol: index % 2 === 0 ? 'Skin Cancer IGSRT' : null,
        universal: index % 2 !== 0,
        templateSourceId: `TPL-SRC-0${index + 1}`,
        defaultStatus: status,
        requiredAction: `Complete ${name}`,
        requiredFields: ['Patient reference', 'Course reference', 'Signature state'],
        outputFormats: index === 3 ? ['XLSX', 'PDF'] : ['DOCX', 'PDF'],
        cptCode: index === 3 ? '77401' : null,
        createsTask: true,
        autoCreate: true,
        taskTitle: name,
        taskNumber: `T-${index + 1}`,
        timing: 'Before next phase',
        auditSteps: ['Template mapped', 'Responsible owner assigned', 'Signature state tracked'],
      },
    });
  }

  for (const [id, diagnosis, protocol, description] of [
    ['WF-SKIN', 'SKIN_CANCER', 'Skin Cancer IGSRT', 'Skin cancer IGSRT carepath'],
    ['WF-ARTHRITIS', 'ARTHRITIS', 'Joint Orthovoltage', 'Arthritis orthovoltage carepath'],
    ['WF-DUPUYTRENS', 'DUPUYTRENS', 'Dupuytren Orthovoltage', 'Dupuytren orthovoltage carepath'],
  ]) {
    await ops.workflowDefinition.create({
      data: {
        id,
        name: protocol,
        diagnosis,
        protocol,
        description,
        phases: ['CONSULTATION', 'CHART_PREP', 'SIMULATION', 'PLANNING', 'ON_TREATMENT', 'POST_TX', 'AUDIT'],
        documentRequirementIds: documentTemplates.map((_, index) => `REQ-${index + 1}`),
        status: 'ACTIVE',
      },
    });
  }
}

async function seedPatientsAndCourses() {
  for (const [index, patient] of patients.entries()) {
    const [id, patientRef, phiRecordId, firstName, lastName, mrn, diagnosis, diagnosisCategory, location, physician, chartRoundsPhase, status, assignedStaff, courseRef, nextAction] = patient;
    const [protocolName, treatmentModality, treatmentType, totalFractions, protocolFamily] = courseConfig[diagnosisCategory];
    const currentFraction = chartRoundsPhase === 'UPCOMING' ? index % 2 : chartRoundsPhase === 'POST' ? totalFractions : Math.min(totalFractions - 1, 4 + index);
    const workflowDefinitionId = diagnosisCategory === 'SKIN_CANCER' ? 'WF-SKIN' : diagnosisCategory === 'ARTHRITIS' ? 'WF-ARTHRITIS' : 'WF-DUPUYTRENS';
    const coursePhase = phaseByChart[chartRoundsPhase];
    const flags = patientFlags(index, chartRoundsPhase, status);

    await ops.operationalPatient.create({
      data: {
        patientRef,
        phiRecordId,
        displayLabel: `Patient ${patientRef}`,
        diagnosisCategory,
        chartRoundsPhase,
        status,
        assignedStaff,
        activeCourseRef: courseRef,
        nextActionCategory: nextAction,
        checklist,
        lastUpdatedAt: days(-index),
      },
    });
    await ops.operationalCourse.create({
      data: {
        courseRef,
        patientRef,
        diagnosisCategory,
        protocolFamily,
        workflowDefinitionId,
        bodyRegion: diagnosisCategory === 'SKIN_CANCER' ? 'Head and neck' : 'Extremity',
        laterality: index % 2 === 0 ? 'Right' : 'Left',
        totalFractions,
        currentFraction,
        chartRoundsPhase,
        status: status === 'ON_HOLD' ? 'ON_HOLD' : chartRoundsPhase === 'POST' ? 'COMPLETED' : 'ACTIVE',
        coursePhase,
      },
    });

    await phi.patientPhi.create({
      data: {
        id,
        patientRef,
        phiRecordId,
        firstName,
        lastName,
        mrn,
        diagnosis,
        diagnosisCategory,
        location,
        physician,
        chartRoundsPhase,
        status,
        assignedStaff,
        activeCourseId: courseRef,
        nextAction,
        flags,
        notes: `${diagnosis} course seeded for local PostgreSQL visual testing.`,
        checklist,
        lastUpdatedAt: days(-index),
      },
    });
    await phi.treatmentCoursePhi.create({
      data: {
        id: courseRef,
        courseRef,
        patientId: id,
        diagnosis,
        diagnosisCategory,
        protocolName,
        totalFractions,
        currentFraction,
        startDate: days(-14 + index),
        endDate: chartRoundsPhase === 'POST' ? days(-2 + index) : null,
        chartRoundsPhase,
        status: status === 'ON_HOLD' ? 'ON_HOLD' : chartRoundsPhase === 'POST' ? 'COMPLETED' : 'ACTIVE',
        treatmentModality,
        treatmentType,
        workflowDefinitionId,
        bodyRegion: diagnosisCategory === 'SKIN_CANCER' ? 'Head and neck' : 'Extremity',
        laterality: index % 2 === 0 ? 'Right' : 'Left',
        coursePhase,
        phaseOne: 'Phase I',
        phaseTwo: diagnosisCategory === 'SKIN_CANCER' ? 'Boost' : null,
        energy: diagnosisCategory === 'SKIN_CANCER' ? '70 kV' : '100 kV',
        applicator: `${3 + (index % 3)} cm cone`,
        dose: `${totalFractions * 300} cGy`,
        targetDepth: `${3 + index} mm`,
        fieldDesign: index % 2 === 0 ? 'Standard margin' : 'Custom shield',
        notes: 'Seeded PHI treatment-course detail.',
      },
    });
  }
}

async function seedOperationalWork() {
  for (const [patientIndex, patient] of patients.entries()) {
    const [, patientRef,,,,,, diagnosisCategory,,,,,, courseRef] = patient;
    const workflowDefinitionId = diagnosisCategory === 'SKIN_CANCER' ? 'WF-SKIN' : diagnosisCategory === 'ARTHRITIS' ? 'WF-ARTHRITIS' : 'WF-DUPUYTRENS';

    await ops.courseFolderPlaceholder.create({
      data: {
        id: `FOLDER-${courseRef}`,
        patientRef,
        courseRef,
        storageProvider: 'PENDING_DRIVE',
        path: `/CureRays/${patientRef}/${courseRef}`,
        folders: ['Intake', 'Simulation', 'Planning', 'Treatment', 'Audit'],
        status: 'READY',
        createdAt: days(-10 + patientIndex),
      },
    });

    await ops.patientRecordHistory.create({
      data: {
        id: `HIST-${courseRef}`,
        patientRef,
        courseRef,
        action: 'SEEDED',
        summary: 'Seeded PostgreSQL patient-course record.',
        previousValue: 'NONE',
        newValue: 'PHI_REDACTED',
        changedBy: 'SYSTEM',
        role: 'SYSTEM',
        reason: 'Local database seed',
        timestamp: days(-7 + patientIndex),
      },
    });

    for (const [taskIndex, task] of taskTemplates.entries()) {
      const [taskNumber, title, phase, documentName, responsibleParty, noteAction, cptCodes] = task;
      const status = taskStatus(patientIndex, taskIndex);
      await ops.operationalWorkflowStep.create({
        data: {
          id: `STEP-${courseRef}-${taskNumber}`,
          courseRef,
          workflowDefinitionId,
          stepNumber: Number(taskNumber),
          stepName: title,
          phase,
          status,
          responsibleRole: responsibleParty,
          triggerEvent: taskIndex === 0 ? 'Course intake' : 'Prior step completed',
          dueDate: days(taskIndex - 2 + patientIndex),
          requiresSignature: taskIndex >= 2,
          linkedDocumentId: `GDOC-${courseRef}-${taskNumber}`,
          blockers: status === 'BLOCKED' ? ['Physics review missing'] : [],
          auditChecklist: ['Owner assigned', 'Evidence traceable'],
          notes: status === 'BLOCKED' ? 'Seeded blocker for dashboard risk graph.' : null,
          createdAt: days(-12 + patientIndex),
          updatedAt: days(-taskIndex),
        },
      });
      await ops.carepathTask.create({
        data: {
          id: `TASK-${courseRef}-${taskNumber}`,
          courseRef,
          taskNumber,
          title,
          workflowPhase: phase,
          documentName,
          status,
          responsibleParty,
          timing: taskIndex < 3 ? 'Before treatment release' : 'Before closeout',
          noteAction,
          cptCodes,
          auditSteps: ['Review evidence', 'Confirm signature state'],
          auditReady: ['COMPLETED', 'SIGNED'].includes(status),
          dueDate: days(taskIndex - 2 + patientIndex),
          completedAt: status === 'COMPLETED' ? days(-taskIndex) : null,
          signedAt: status === 'SIGNED' ? days(-taskIndex) : null,
          lastUpdatedAt: days(-taskIndex),
          assignedUser: responsibleParty,
        },
      });
      await ops.operationalAuditCheck.create({
        data: {
          id: `AUDIT-${courseRef}-${taskNumber}`,
          courseRef,
          category: phase,
          label: `${title} evidence`,
          status: ['COMPLETED', 'SIGNED'].includes(status) ? 'COMPLETED' : status === 'BLOCKED' ? 'BLOCKED' : 'OPEN',
          required: true,
          evidenceDocumentId: `GDOC-${courseRef}-${taskNumber}`,
          notes: status === 'BLOCKED' ? 'Seeded open audit blocker.' : null,
          completedByUserId: status === 'COMPLETED' ? responsibleParty : null,
          completedAt: status === 'COMPLETED' ? days(-taskIndex) : null,
        },
      });
    }

    for (const [docIndex, doc] of documentTemplates.entries()) {
      const [, name, phase, responsibleParty, baseStatus, baseReviewState] = doc;
      const status = documentStatus(patientIndex, docIndex, baseStatus);
      const signed = status === 'SIGNED' || status === 'EXPORTED' || status === 'COMPLETED';
      await ops.generatedDocument.create({
        data: {
          id: `GDOC-${courseRef}-0${docIndex + 1}`,
          templateId,
          patientRef,
          courseRef,
          name,
          clinicalPhase: phase,
          responsibleParty,
          status,
          requiredAction: signed ? 'No action required' : `Resolve ${name}`,
          cptCode: docIndex === 3 ? '77401' : null,
          assignedTo: responsibleParty,
          lastUpdatedAt: days(-docIndex),
          signedAt: signed ? days(-docIndex) : null,
          exportedAt: status === 'EXPORTED' ? days(-docIndex) : null,
          signReviewState: signed ? 'SIGNED' : baseReviewState,
          auditReady: signed,
        },
      });
      await ops.workflowDocumentState.create({
        data: {
          id: `WDOC-${courseRef}-0${docIndex + 1}`,
          requirementId: `REQ-${docIndex + 1}`,
          documentId: `GDOC-${courseRef}-0${docIndex + 1}`,
          patientRef,
          courseRef,
          name,
          workflowPhase: phase,
          responsibleParty,
          status,
          requiredAction: signed ? 'No action required' : `Resolve ${name}`,
          auditReady: signed,
          templateSourceStatus: docIndex === 5 ? 'MISSING' : docIndex === 2 ? 'MAPPING_IN_PROGRESS' : 'ACTIVE',
          sourceDriveUrl: `https://drive.example.local/TPL-SRC-0${docIndex + 1}`,
          mapped: docIndex !== 5,
          lastUpdatedAt: days(-docIndex),
        },
      });
    }

    await ops.operationalAuditEvent.create({
      data: {
        id: `OPS-EVENT-${courseRef}`,
        patientRef,
        userId: 'SYSTEM',
        userName: 'Seed Script',
        role: 'SYSTEM',
        action: 'SEED',
        entityType: 'COURSE',
        entityId: courseRef,
        previousValue: 'NONE',
        newValue: 'PHI_REDACTED',
        redacted: true,
        timestamp: days(-patientIndex),
        reason: 'Local PostgreSQL seed',
      },
    });
  }
}

async function seedPhiClinicalRows() {
  for (const [patientIndex, patient] of patients.entries()) {
    const [patientId, , , , , , , diagnosisCategory, , physician, chartRoundsPhase, , , courseId] = patient;
    const currentFraction = chartRoundsPhase === 'UPCOMING' ? 2 : chartRoundsPhase === 'POST' ? 6 : 5 + patientIndex;

    await phi.simulationOrderPhi.create({
      data: {
        id: `SIM-${courseId}`,
        patientId,
        courseId,
        lesionLocation: diagnosisCategory === 'SKIN_CANCER' ? 'Right cheek' : 'Hand/wrist',
        laterality: patientIndex % 2 === 0 ? 'Right' : 'Left',
        lesionBorderInked: true,
        allMarginsInked: patientIndex % 3 !== 0,
        phaseIMarginInstruction: '5 mm margin',
        phaseIIMarginInstruction: 'Boost margin per physician',
        chairSetup: 'Seated treatment chair',
        position: 'Neutral',
        setupPhotoChecklist: ['Face-on', 'Oblique', 'Applicator alignment'],
        ultrasoundFrequencies: ['18 MHz', '22 MHz'],
        specialPhysicsRequired: patientIndex % 4 === 0,
        specialPhysicsReason: patientIndex % 4 === 0 ? 'Custom shielding review' : 'Not required',
        weeklyPhysicsRequired: chartRoundsPhase === 'ON_TREATMENT',
        weeklyPhysicsReason: chartRoundsPhase === 'ON_TREATMENT' ? 'Active treatment course' : 'Not active',
        inVivoDosimetryRequired: diagnosisCategory === 'SKIN_CANCER',
        radiationOncologist: physician,
        dateCompleted: chartRoundsPhase === 'UPCOMING' ? null : days(-6 + patientIndex),
        signedAt: chartRoundsPhase === 'UPCOMING' ? null : days(-5 + patientIndex),
        status: chartRoundsPhase === 'UPCOMING' ? 'READY_FOR_REVIEW' : 'SIGNED',
        lastUpdatedAt: days(-patientIndex),
      },
    });

    await phi.prescriptionPhi.create({
      data: {
        id: `RX-${courseId}`,
        patientId,
        courseId,
        site: diagnosisCategory === 'SKIN_CANCER' ? 'Skin lesion' : 'Joint/hand',
        laterality: patientIndex % 2 === 0 ? 'Right' : 'Left',
        verifiedInSensus: patientIndex % 3 !== 0,
        imagingGuidance: diagnosisCategory === 'SKIN_CANCER' ? ['Ultrasound', 'Setup photos'] : ['Clinical setup'],
        priorRadiationTherapy: false,
        preAuthorized: patientIndex % 2 === 0,
        signedAt: chartRoundsPhase === 'UPCOMING' ? null : days(-4 + patientIndex),
        dateOrdered: days(-9 + patientIndex),
        status: chartRoundsPhase === 'UPCOMING' ? 'READY_FOR_REVIEW' : 'SIGNED',
        lastUpdatedAt: days(-patientIndex),
      },
    });
    await phi.prescriptionPhasePhi.create({
      data: {
        id: `RXPH-${courseId}-1`,
        prescriptionId: `RX-${courseId}`,
        phaseName: 'Phase I',
        energyKv: diagnosisCategory === 'SKIN_CANCER' ? 70 : 100,
        phaseTotalDoseGy: diagnosisCategory === 'ARTHRITIS' ? 6 : 40,
        dosePerFractionGy: diagnosisCategory === 'ARTHRITIS' ? 1 : 2,
        totalFractions: diagnosisCategory === 'ARTHRITIS' ? 6 : 20,
        timeMinutes: 2.5 + patientIndex / 10,
        ssdCm: 15,
        applicatorSize: `${3 + (patientIndex % 3)} cm`,
        marginMm: 5,
        technique: 'Orthovoltage',
        shieldingDesign: patientIndex % 2 === 0 ? 'Standard' : 'Custom',
        depthOfTargetMm: 4 + patientIndex,
      },
    });

    await phi.mappingRecordPhi.create({
      data: {
        id: `MAP-${courseId}`,
        patientId,
        courseId,
        diagnosis: diagnosisCategory,
        bodySite: diagnosisCategory === 'SKIN_CANCER' ? 'Face' : 'Extremity',
        laterality: patientIndex % 2 === 0 ? 'Right' : 'Left',
        impressions: 'Seeded mapping impressions for local database review.',
        fieldDesignDecision: patientIndex % 2 === 0 ? 'Standard field' : 'Custom shielding field',
        status: patientIndex % 3 === 0 ? 'READY_FOR_REVIEW' : 'SIGNED',
        lastUpdatedAt: days(-patientIndex),
      },
    });

    for (let fraction = 1; fraction <= Math.min(currentFraction, 8); fraction += 1) {
      const approved = fraction < currentFraction - 1 && patientIndex !== 3;
      const needsRevision = patientIndex === 5 && fraction === currentFraction - 1;
      await phi.fractionLogEntryPhi.create({
        data: {
          id: `FXLOG-${courseId}-${fraction}`,
          courseId,
          fractionNumber: fraction,
          status: needsRevision ? 'REVISION_NEEDED' : approved ? 'APPROVED' : 'NEEDS_REVIEW',
          date: days(-8 + fraction + patientIndex),
          phase: 'Phase I',
          energy: diagnosisCategory === 'SKIN_CANCER' ? '70 kV' : '100 kV',
          energyKv: diagnosisCategory === 'SKIN_CANCER' ? 70 : 100,
          ssd: '15 cm',
          ssdCm: 15,
          fieldSizeCm: `${3 + (patientIndex % 3)} x ${3 + (patientIndex % 3)}`,
          treatmentTimeMinutes: 2.3 + fraction / 10,
          dosePerFraction: diagnosisCategory === 'ARTHRITIS' ? 100 : 200,
          dosePerFractionCgy: diagnosisCategory === 'ARTHRITIS' ? 100 : 200,
          cumulativeDose: (diagnosisCategory === 'ARTHRITIS' ? 100 : 200) * fraction,
          cumulativeDoseCgy: (diagnosisCategory === 'ARTHRITIS' ? 100 : 200) * fraction,
          technicianInitials: patientIndex % 2 === 0 ? 'IL' : 'TC',
          mdApproval: approved,
          mdApprovalState: needsRevision ? 'REVISION_NEEDED' : approved ? 'APPROVED' : 'PENDING',
          mdApprovedAt: approved ? days(-7 + fraction + patientIndex) : null,
          mdApprovedByUserId: approved ? 'RAD_ONC' : null,
          dotApproval: approved && fraction % 4 !== 0,
          dotApprovalState: approved && fraction % 4 !== 0 ? 'APPROVED' : 'PENDING',
          dotApprovedAt: approved && fraction % 4 !== 0 ? days(-7 + fraction + patientIndex) : null,
          dotApprovedByUserId: approved && fraction % 4 !== 0 ? 'RTT' : null,
          depthOfTarget: `${4 + patientIndex} mm`,
          depthOfTargetMm: 4 + patientIndex,
          isodosePercent: 90,
          isodoseToDotPercent: 90,
          doseToDepth: 180,
          doseToDotCgy: 180,
          cumulativeDoseToDepth: 180 * fraction,
          cumulativeDoseToDotCgy: 180 * fraction,
          treatmentSetupComments: approved ? 'Setup matched reference photos.' : 'Awaiting approval.',
          isodoseOverrideReason: needsRevision ? 'Manual review requested for depth variance.' : null,
          calculationStatus: needsRevision ? 'NEEDS_OVERRIDE' : 'AUTO_LOOKUP',
          calculationReferenceVersion: 'seed-v1',
          calculationSourceTemplate: 'Local seed worksheet',
          calculationSourceTabs: ['Skin', 'Arthritis', 'Dupuytren'],
          calculationDepthRoundedMm: 4 + patientIndex,
          calculationLookupKey: `SEED-${courseId}-${fraction}`,
          calculationClinicalValidationRequired: !approved,
          calculationWarnings: approved ? [] : ['Approval pending'],
          isodoseNote: 'Seeded isodose calculation.',
          revisionApprovalType: needsRevision ? 'MD' : null,
          revisionReason: needsRevision ? 'Depth correction requested.' : null,
          revisionRequestedAt: needsRevision ? days(-1) : null,
          revisionRequestedByUserId: needsRevision ? 'RTT' : null,
          notes: 'Seeded fraction log row.',
        },
      });
      await phi.treatmentFractionPhi.create({
        data: {
          id: `TXFX-${courseId}-${fraction}`,
          courseId,
          fractionNumber: fraction,
          phase: 'Phase I',
          treatmentDate: days(-8 + fraction + patientIndex),
          plannedDose: diagnosisCategory === 'ARTHRITIS' ? 100 : 200,
          deliveredDose: approved ? (diagnosisCategory === 'ARTHRITIS' ? 100 : 200) : null,
          cumulativeDose: (diagnosisCategory === 'ARTHRITIS' ? 100 : 200) * fraction,
          energy: diagnosisCategory === 'SKIN_CANCER' ? '70 kV' : '100 kV',
          applicator: `${3 + (patientIndex % 3)} cm`,
          imageGuidanceCompleted: approved,
          imageGuidanceStatus: approved ? 'COMPLETED' : 'PENDING',
          imageAssetIds: approved ? [`IMG-${courseId}-${fraction}`] : [],
          scheduledFromPrescription: true,
          sourcePrescriptionId: `RX-${courseId}`,
          sourcePhaseId: `RXPH-${courseId}-1`,
          linkedFractionLogEntryId: `FXLOG-${courseId}-${fraction}`,
          physicsCheckRequired: fraction % 5 === 0,
          physicsCheckCompletedAt: fraction % 5 === 0 && approved ? days(-6 + fraction + patientIndex) : null,
          physicsCheckCompletedByUserId: fraction % 5 === 0 && approved ? 'PHYSICIST' : null,
          otvRequired: fraction % 5 === 0,
          otvCompletedAt: fraction % 5 === 0 && approved ? days(-6 + fraction + patientIndex) : null,
          otvCompletedByUserId: fraction % 5 === 0 && approved ? 'RAD_ONC' : null,
          generatedAt: days(-10 + patientIndex),
          lockedAt: approved ? days(-7 + fraction + patientIndex) : null,
          status: approved ? 'COMPLETED' : 'SCHEDULED',
          therapistId: 'RTT',
          physicianReviewedAt: approved ? days(-7 + fraction + patientIndex) : null,
          notes: 'Seeded treatment fraction.',
        },
      });
    }

    await phi.generatedDocumentOutputPhi.create({
      data: {
        id: `OUT-${courseId}`,
        documentId: `GDOC-${courseId}-05`,
        patientId,
        courseId,
        format: 'PDF',
        version: 1,
        status: chartRoundsPhase === 'POST' ? 'EXPORTED' : 'READY',
        driveFileUrl: `https://drive.example.local/${courseId}/summary.pdf`,
        contentPreview: 'PHI preview retained only in PHI database.',
        renderedAt: days(-patientIndex),
      },
    });

    await phi.phiAuditEvent.create({
      data: {
        id: `PHI-EVENT-${courseId}`,
        patientId,
        userId: 'SYSTEM',
        userName: 'Seed Script',
        role: 'SYSTEM',
        action: 'SEED',
        entityType: 'PATIENT',
        entityId: patientId,
        previousValue: 'NONE',
        newValue: 'PHI_REDACTED',
        timestamp: days(-patientIndex),
        reason: 'Local PostgreSQL seed',
      },
    });
  }
}

async function main() {
  await clearDatabase();
  await seedOpsStaticRows();
  await seedPatientsAndCourses();
  await seedOperationalWork();
  await seedPhiClinicalRows();
  const [opsPatients, opsTasks, opsDocuments, phiPatients, phiFractions] = await Promise.all([
    ops.operationalPatient.count(),
    ops.carepathTask.count(),
    ops.generatedDocument.count(),
    phi.patientPhi.count(),
    phi.fractionLogEntryPhi.count(),
  ]);

  console.log(`Seeded OPS: ${opsPatients} patients, ${opsTasks} carepath tasks, ${opsDocuments} generated documents.`);
  console.log(`Seeded PHI: ${phiPatients} patients, ${phiFractions} fraction log entries.`);
}

main()
  .catch((error) => {
    if (String(error?.message ?? error).includes("Can't reach database server")) {
      runWindowsPsqlSeed();
      return;
    }

    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([ops.$disconnect(), phi.$disconnect()]);
  });

function runWindowsPsqlSeed() {
  const sqlPath = join(rootDir, 'scripts', 'seed-postgres-local.sql');
  const outPath = join(rootDir, 'seed-postgres-out.txt');
  const errPath = join(rootDir, 'seed-postgres-err.txt');
  const windowsSqlPath = `C:${sqlPath.slice('/mnt/c'.length).replaceAll('/', '\\')}`;
  const windowsOutPath = `C:${outPath.slice('/mnt/c'.length).replaceAll('/', '\\')}`;
  const windowsErrPath = `C:${errPath.slice('/mnt/c'.length).replaceAll('/', '\\')}`;

  rmSync(outPath, { force: true });
  rmSync(errPath, { force: true });

  const script = [
    "$env:PGPASSWORD='curerays_dev_password'",
    `$args='-h localhost -p 5432 -U postgres -d curerays_phi -v ON_ERROR_STOP=1 -f "${windowsSqlPath}"'`,
    `$p=Start-Process -FilePath 'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe' -ArgumentList $args -NoNewWindow -Wait -PassThru -RedirectStandardOutput '${windowsOutPath}' -RedirectStandardError '${windowsErrPath}'`,
    'exit $p.ExitCode',
  ].join('; ');

  try {
    execFileSync('powershell.exe', ['-NoProfile', '-Command', script], { stdio: 'pipe' });
    const output = existsSync(outPath) ? readFileSync(outPath, 'utf8').trim() : '';
    if (output) console.log(output);
    console.log('Seeded local PostgreSQL through Windows psql fallback.');
  } catch (fallbackError) {
    const stderr = existsSync(errPath) ? readFileSync(errPath, 'utf8') : '';
    console.error(stderr || fallbackError);
    process.exitCode = 1;
  } finally {
    rmSync(outPath, { force: true });
    rmSync(errPath, { force: true });
  }
}
