import 'server-only';

export {
  adminRoles,
  adminUsers,
  clinicalDocumentRows,
  moduleSnapshot,
  patientLabel,
  patientMrn,
  permissionRoles,
  permissionRows,
  phaseLabel,
  responsiblePartyName,
  settingsCategories,
  statusLabel,
  statusTone,
  templateRows,
} from '@/lib/global-page-data';
export {
  auditChecks,
  billingItems,
  clinicalFormTemplates,
  getCourses,
  getDocumentInstances,
  getTasks,
  getTreatmentFractions,
  getTreatmentPlans,
  getWorkflowSteps,
  imagingAssets,
} from '@/lib/module-data';
export { handJointRows } from '@/lib/page-layout-data';
export {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  getIgsrtWorkspace,
  operationalAuditEvents,
  operationalPatients,
  operationalTreatmentCourses,
  prescriptions,
  treatmentCourses,
} from '@/lib/clinical-store';
export {
  documentRequirements,
  documentTemplates,
  internalFormTemplates,
  templateSources,
  workflowDefinitions,
} from '@/lib/template-registry';
