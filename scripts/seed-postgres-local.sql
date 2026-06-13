\set ON_ERROR_STOP on

\connect curerays_phi postgres
DELETE FROM "PhiAuditEvent";
DELETE FROM "GeneratedDocumentOutputPhi";
DELETE FROM "TreatmentFractionPhi";
DELETE FROM "FractionLogEntryPhi";
DELETE FROM "MappingRecordPhi";
DELETE FROM "PrescriptionPhasePhi";
DELETE FROM "PrescriptionPhi";
DELETE FROM "SimulationOrderPhi";
DELETE FROM "TreatmentCoursePhi";
DELETE FROM "PatientPhi";

INSERT INTO "PatientPhi" ("id","patientRef","phiRecordId","firstName","lastName","mrn","diagnosis","diagnosisCategory","location","physician","chartRoundsPhase","status","assignedStaff","activeCourseId","nextAction","flags","notes","checklist","lastUpdatedAt")
VALUES
('CR-2401','PREF-CR-2401','PHI-CR-2401','Amelia','Grant','MRN-700241','Basal cell carcinoma, right cheek','SKIN_CANCER','Grass Valley','Dr. Sarah Johnson','ON_TREATMENT','ACTIVE','Iris Lim, RTT','COURSE-2401','Fraction approval pending','[{"id":"FLAG-1-HIGH","severity":"HIGH","summary":"Signature or approval risk before next handoff","owner":"RAD_ONC","dueDate":"2026-06-13T09:00:00.000Z"}]'::jsonb,'Seeded PHI row.','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,'2026-06-12T09:00:00.000Z'),
('CR-2402','PREF-CR-2402','PHI-CR-2402','Noah','Bennett','MRN-700242','Dupuytren contracture, left hand','DUPUYTRENS','Auburn','Dr. Mateo Reyes','UPCOMING','ACTIVE','Tracy Chen, MA','COURSE-2402','Simulation order review','[{"id":"FLAG-2-SIM","severity":"MEDIUM","summary":"Simulation prep packet is not fully mapped","owner":"MA","dueDate":"2026-06-14T09:00:00.000Z"}]'::jsonb,'Seeded PHI row.','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,'2026-06-11T09:00:00.000Z'),
('CR-2403','PREF-CR-2403','PHI-CR-2403','Maya','Patel','MRN-700243','Knee osteoarthritis','ARTHRITIS','Grass Valley','Dr. Sarah Johnson','POST','ACTIVE','Amanda Lee, Billing','COURSE-2403','Closeout audit evidence','[]'::jsonb,'Seeded PHI row.','{"txSummaryComplete":true,"followUpScheduled":true,"billingComplete":false}'::jsonb,'2026-06-10T09:00:00.000Z'),
('CR-2404','PREF-CR-2404','PHI-CR-2404','Lucas','Rivera','MRN-700244','Squamous cell carcinoma, scalp','SKIN_CANCER','Grass Valley','Dr. Sarah Johnson','ON_TREATMENT','ON_HOLD','John Smith, QA','COURSE-2404','Physics review blocker','[{"id":"FLAG-4-HOLD","severity":"HIGH","summary":"Treatment hold needs physics disposition","owner":"PHYSICIST","dueDate":"2026-06-12T09:00:00.000Z"}]'::jsonb,'Seeded PHI row.','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,'2026-06-09T09:00:00.000Z'),
('CR-2405','PREF-CR-2405','PHI-CR-2405','Evelyn','Stone','MRN-700245','Thumb CMC arthritis','ARTHRITIS','Auburn','Dr. Mateo Reyes','UPCOMING','ACTIVE','Tracy Chen, MA','COURSE-2405','Preauth documentation','[{"id":"FLAG-5-SIM","severity":"MEDIUM","summary":"Simulation prep packet is not fully mapped","owner":"MA","dueDate":"2026-06-14T09:00:00.000Z"}]'::jsonb,'Seeded PHI row.','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,'2026-06-08T09:00:00.000Z'),
('CR-2406','PREF-CR-2406','PHI-CR-2406','Henry','Cho','MRN-700246','Basal cell carcinoma, nasal ala','SKIN_CANCER','Grass Valley','Dr. Sarah Johnson','ON_TREATMENT','ACTIVE','Iris Lim, RTT','COURSE-2406','Weekly physics chart check','[{"id":"FLAG-6-HIGH","severity":"HIGH","summary":"Weekly physics chart check pending","owner":"PHYSICIST","dueDate":"2026-06-13T09:00:00.000Z"}]'::jsonb,'Seeded PHI row.','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,'2026-06-07T09:00:00.000Z');

INSERT INTO "TreatmentCoursePhi" ("id","courseRef","patientId","diagnosis","diagnosisCategory","protocolName","totalFractions","currentFraction","startDate","endDate","chartRoundsPhase","status","treatmentModality","treatmentType","workflowDefinitionId","bodyRegion","laterality","coursePhase","phaseOne","phaseTwo","energy","applicator","dose","targetDepth","fieldDesign","notes")
SELECT "activeCourseId", "activeCourseId", id, diagnosis, "diagnosisCategory",
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'Skin Cancer IGSRT' WHEN "diagnosisCategory"='ARTHRITIS' THEN 'Joint Orthovoltage' ELSE 'Dupuytren Orthovoltage' END,
CASE WHEN "diagnosisCategory"='ARTHRITIS' THEN 6 WHEN "diagnosisCategory"='DUPUYTRENS' THEN 10 ELSE 20 END,
CASE WHEN "chartRoundsPhase"='UPCOMING' THEN 1 WHEN "chartRoundsPhase"='POST' THEN 6 ELSE 6 END,
'2026-05-28T09:00:00.000Z', CASE WHEN "chartRoundsPhase"='POST' THEN '2026-06-10T09:00:00.000Z'::timestamp ELSE NULL END,
"chartRoundsPhase", CASE WHEN status='ON_HOLD' THEN 'ON_HOLD' WHEN "chartRoundsPhase"='POST' THEN 'COMPLETED' ELSE 'ACTIVE' END,
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'IGSRT' ELSE 'Orthovoltage' END,
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'SRT' ELSE "diagnosisCategory"::text END,
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'WF-SKIN' WHEN "diagnosisCategory"='ARTHRITIS' THEN 'WF-ARTHRITIS' ELSE 'WF-DUPUYTRENS' END,
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'Head and neck' ELSE 'Extremity' END,
'Right', CASE WHEN "chartRoundsPhase"='UPCOMING' THEN 'SIMULATION' WHEN "chartRoundsPhase"='POST' THEN 'AUDIT' ELSE 'ON_TREATMENT' END,
'Phase I', NULL, CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN '70 kV' ELSE '100 kV' END, '4 cm cone', '4000 cGy', '5 mm', 'Standard margin', 'Seeded course.'
FROM "PatientPhi";

INSERT INTO "SimulationOrderPhi" ("id","patientId","courseId","lesionLocation","laterality","lesionBorderInked","allMarginsInked","phaseIMarginInstruction","phaseIIMarginInstruction","chairSetup","position","setupPhotoChecklist","ultrasoundFrequencies","specialPhysicsRequired","specialPhysicsReason","weeklyPhysicsRequired","weeklyPhysicsReason","inVivoDosimetryRequired","radiationOncologist","dateCompleted","signedAt","status","lastUpdatedAt")
SELECT 'SIM-' || "courseRef", "patientId", "id", COALESCE("bodyRegion",'Site'), COALESCE("laterality",'Right'), true, true, '5 mm margin', 'Boost per physician', 'Seated chair', 'Neutral', ARRAY['Face-on','Oblique'], ARRAY['18 MHz','22 MHz'], status='ON_HOLD', 'Seeded physics reason', "chartRoundsPhase"='ON_TREATMENT', 'Active treatment course', "diagnosisCategory"='SKIN_CANCER', 'Dr. Sarah Johnson', "startDate", "startDate", CASE WHEN "chartRoundsPhase"='UPCOMING' THEN 'READY_FOR_REVIEW' ELSE 'SIGNED' END, now()
FROM "TreatmentCoursePhi";

INSERT INTO "PrescriptionPhi" ("id","patientId","courseId","site","laterality","verifiedInSensus","imagingGuidance","priorRadiationTherapy","preAuthorized","signedAt","dateOrdered","status","lastUpdatedAt")
SELECT 'RX-' || "courseRef", "patientId", "id", COALESCE("bodyRegion",'Site'), COALESCE("laterality",'Right'), true, ARRAY['Ultrasound','Setup photos'], false, true, CASE WHEN "chartRoundsPhase"='UPCOMING' THEN NULL ELSE "startDate" END, "startDate", CASE WHEN "chartRoundsPhase"='UPCOMING' THEN 'READY_FOR_REVIEW' ELSE 'SIGNED' END, now()
FROM "TreatmentCoursePhi";

INSERT INTO "PrescriptionPhasePhi" ("id","prescriptionId","phaseName","energyKv","phaseTotalDoseGy","dosePerFractionGy","totalFractions","timeMinutes","ssdCm","applicatorSize","marginMm","technique","shieldingDesign","depthOfTargetMm")
SELECT 'RXPH-' || p."courseId", p.id, 'Phase I', CASE WHEN c."diagnosisCategory"='SKIN_CANCER' THEN 70 ELSE 100 END, 40, 2, c."totalFractions", 2.5, 15, '4 cm', 5, 'Orthovoltage', 'Standard', 5
FROM "PrescriptionPhi" p JOIN "TreatmentCoursePhi" c ON c.id=p."courseId";

INSERT INTO "MappingRecordPhi" ("id","patientId","courseId","diagnosis","bodySite","laterality","impressions","fieldDesignDecision","status","lastUpdatedAt")
SELECT 'MAP-' || "courseRef", "patientId", id, "diagnosisCategory", COALESCE("bodyRegion",'Site'), COALESCE("laterality",'Right'), 'Seeded impressions.', 'Standard field', 'SIGNED', now()
FROM "TreatmentCoursePhi";

INSERT INTO "FractionLogEntryPhi" ("id","courseId","fractionNumber","status","date","phase","energy","energyKv","ssd","ssdCm","fieldSizeCm","treatmentTimeMinutes","dosePerFraction","dosePerFractionCgy","cumulativeDose","cumulativeDoseCgy","technicianInitials","mdApproval","mdApprovalState","mdApprovedAt","mdApprovedByUserId","dotApproval","dotApprovalState","dotApprovedAt","dotApprovedByUserId","depthOfTarget","depthOfTargetMm","isodosePercent","isodoseToDotPercent","doseToDepth","doseToDotCgy","cumulativeDoseToDepth","cumulativeDoseToDotCgy","treatmentSetupComments","calculationStatus","calculationReferenceVersion","calculationSourceTemplate","calculationSourceTabs","calculationDepthRoundedMm","calculationLookupKey","calculationClinicalValidationRequired","calculationWarnings","isodoseNote","notes")
SELECT 'FXLOG-' || c.id || '-' || gs, c.id, gs,
CASE WHEN c.status='ON_HOLD' AND gs=3 THEN 'REVISION_NEEDED' WHEN gs < c."currentFraction" THEN 'APPROVED' ELSE 'NEEDS_REVIEW' END,
('2026-06-01'::date + gs), 'Phase I', COALESCE(c.energy,'70 kV'), CASE WHEN c."diagnosisCategory"='SKIN_CANCER' THEN 70 ELSE 100 END, '15 cm', 15, '4 x 4', 2.5, 200, 200, 200*gs, 200*gs, 'IL',
gs < c."currentFraction" AND c.status <> 'ON_HOLD', CASE WHEN c.status='ON_HOLD' AND gs=3 THEN 'REVISION_NEEDED' WHEN gs < c."currentFraction" THEN 'APPROVED' ELSE 'PENDING' END,
CASE WHEN gs < c."currentFraction" AND c.status <> 'ON_HOLD' THEN now() ELSE NULL END, CASE WHEN gs < c."currentFraction" AND c.status <> 'ON_HOLD' THEN 'RAD_ONC' ELSE NULL END,
gs < c."currentFraction" - 1 AND c.status <> 'ON_HOLD', CASE WHEN gs < c."currentFraction" - 1 AND c.status <> 'ON_HOLD' THEN 'APPROVED' ELSE 'PENDING' END,
CASE WHEN gs < c."currentFraction" - 1 AND c.status <> 'ON_HOLD' THEN now() ELSE NULL END, CASE WHEN gs < c."currentFraction" - 1 AND c.status <> 'ON_HOLD' THEN 'RTT' ELSE NULL END,
'5 mm', 5, 90, 90, 180, 180, 180*gs, 180*gs, 'Seeded setup.', CASE WHEN c.status='ON_HOLD' AND gs=3 THEN 'NEEDS_OVERRIDE' ELSE 'AUTO_LOOKUP' END, 'seed-v1', 'Local seed worksheet', ARRAY['Skin','Arthritis'], 5, 'SEED-' || c.id || '-' || gs, NOT (gs < c."currentFraction"), CASE WHEN gs < c."currentFraction" THEN ARRAY[]::text[] ELSE ARRAY['Approval pending'] END, 'Seeded isodose.', 'Seeded fraction row.'
FROM "TreatmentCoursePhi" c CROSS JOIN generate_series(1,6) gs;

INSERT INTO "TreatmentFractionPhi" ("id","courseId","fractionNumber","phase","treatmentDate","plannedDose","deliveredDose","cumulativeDose","energy","applicator","imageGuidanceCompleted","imageGuidanceStatus","imageAssetIds","scheduledFromPrescription","sourcePrescriptionId","sourcePhaseId","linkedFractionLogEntryId","physicsCheckRequired","status","therapistId","notes")
SELECT 'TXFX-' || "courseId" || '-' || "fractionNumber", "courseId", "fractionNumber", phase, date, "dosePerFraction", CASE WHEN status='APPROVED' THEN "dosePerFraction" ELSE NULL END, "cumulativeDose", energy, '4 cm', status='APPROVED', CASE WHEN status='APPROVED' THEN 'COMPLETED' ELSE 'PENDING' END, ARRAY[]::text[], true, 'RX-' || "courseId", 'RXPH-' || "courseId", id, "fractionNumber" % 5 = 0, CASE WHEN status='APPROVED' THEN 'COMPLETED' ELSE 'SCHEDULED' END, 'RTT', 'Seeded treatment fraction.'
FROM "FractionLogEntryPhi";

INSERT INTO "GeneratedDocumentOutputPhi" ("id","documentId","patientId","courseId","format","version","status","driveFileUrl","contentPreview","renderedAt")
SELECT 'OUT-' || id, 'GDOC-' || id || '-05', "patientId", id, 'PDF', 1, CASE WHEN "chartRoundsPhase"='POST' THEN 'EXPORTED' ELSE 'READY' END, 'https://drive.example.local/' || id || '/summary.pdf', 'PHI preview retained only in PHI database.', now()
FROM "TreatmentCoursePhi";

INSERT INTO "PhiAuditEvent" ("id","patientId","userId","userName","role","action","entityType","entityId","previousValue","newValue","timestamp","reason")
SELECT 'PHI-EVENT-' || id, id, 'SYSTEM', 'Seed Script', 'SYSTEM', 'SEED', 'PATIENT', id, 'NONE', 'PHI_REDACTED', now(), 'Local PostgreSQL seed'
FROM "PatientPhi";

GRANT USAGE ON SCHEMA public TO curerays_phi_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO curerays_phi_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO curerays_phi_user;

\connect curerays_ops postgres
DELETE FROM "OperationalAuditEvent";
DELETE FROM "WorkflowDocumentState";
DELETE FROM "WorkflowDefinition";
DELETE FROM "DocumentRequirement";
DELETE FROM "TemplateSource";
DELETE FROM "GeneratedDocument";
DELETE FROM "CarepathTask";
DELETE FROM "PatientRecordHistory";
DELETE FROM "CourseFolderPlaceholder";
DELETE FROM "OperationalAuditCheck";
DELETE FROM "OperationalWorkflowStep";
DELETE FROM "OperationalCourse";
DELETE FROM "OperationalPatient";

INSERT INTO "OperationalPatient" ("patientRef","phiRecordId","displayLabel","diagnosisCategory","chartRoundsPhase","status","assignedStaff","activeCourseRef","nextActionCategory","checklist","lastUpdatedAt")
VALUES
('PREF-CR-2401','PHI-CR-2401','Patient PREF-CR-2401','SKIN_CANCER','ON_TREATMENT','ACTIVE','Iris Lim, RTT','COURSE-2401','Fraction approval pending','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,now()),
('PREF-CR-2402','PHI-CR-2402','Patient PREF-CR-2402','DUPUYTRENS','UPCOMING','ACTIVE','Tracy Chen, MA','COURSE-2402','Simulation order review','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,now()),
('PREF-CR-2403','PHI-CR-2403','Patient PREF-CR-2403','ARTHRITIS','POST','ACTIVE','Amanda Lee, Billing','COURSE-2403','Closeout audit evidence','{"txSummaryComplete":true,"followUpScheduled":true,"billingComplete":false}'::jsonb,now()),
('PREF-CR-2404','PHI-CR-2404','Patient PREF-CR-2404','SKIN_CANCER','ON_TREATMENT','ON_HOLD','John Smith, QA','COURSE-2404','Physics review blocker','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,now()),
('PREF-CR-2405','PHI-CR-2405','Patient PREF-CR-2405','ARTHRITIS','UPCOMING','ACTIVE','Tracy Chen, MA','COURSE-2405','Preauth documentation','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,now()),
('PREF-CR-2406','PHI-CR-2406','Patient PREF-CR-2406','SKIN_CANCER','ON_TREATMENT','ACTIVE','Iris Lim, RTT','COURSE-2406','Weekly physics chart check','{"txSummaryComplete":false,"followUpScheduled":false,"billingComplete":false}'::jsonb,now());

INSERT INTO "OperationalCourse" ("courseRef","patientRef","diagnosisCategory","protocolFamily","workflowDefinitionId","bodyRegion","laterality","totalFractions","currentFraction","chartRoundsPhase","status","coursePhase")
SELECT "activeCourseRef", "patientRef", "diagnosisCategory",
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'Skin Cancer' WHEN "diagnosisCategory"='ARTHRITIS' THEN 'Arthritis' ELSE 'Dupuytren' END,
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'WF-SKIN' WHEN "diagnosisCategory"='ARTHRITIS' THEN 'WF-ARTHRITIS' ELSE 'WF-DUPUYTRENS' END,
CASE WHEN "diagnosisCategory"='SKIN_CANCER' THEN 'Head and neck' ELSE 'Extremity' END,
'Right',
CASE WHEN "diagnosisCategory"='ARTHRITIS' THEN 6 WHEN "diagnosisCategory"='DUPUYTRENS' THEN 10 ELSE 20 END,
CASE WHEN "chartRoundsPhase"='UPCOMING' THEN 1 WHEN "chartRoundsPhase"='POST' THEN 6 ELSE 6 END,
"chartRoundsPhase", CASE WHEN status='ON_HOLD' THEN 'ON_HOLD' WHEN "chartRoundsPhase"='POST' THEN 'COMPLETED' ELSE 'ACTIVE' END,
CASE WHEN "chartRoundsPhase"='UPCOMING' THEN 'SIMULATION' WHEN "chartRoundsPhase"='POST' THEN 'AUDIT' ELSE 'ON_TREATMENT' END
FROM "OperationalPatient";

INSERT INTO "TemplateSource" ("id","name","sourceFileName","driveFileId","driveUrl","mimeType","status","notes","modifiedAt")
VALUES
('TPL-SRC-01','Carepath Preauth Packet','01_Carepath_Preauth.docx','drive-tpl-src-01','https://drive.example.local/TPL-SRC-01','DOCX','ACTIVE','Seeded template.',now()),
('TPL-SRC-02','Simulation Order','02_Simulation_Order.docx','drive-tpl-src-02','https://drive.example.local/TPL-SRC-02','DOCX','ACTIVE','Seeded template.',now()),
('TPL-SRC-03','Clinical Planning Note','03_Clinical_Planning.docx','drive-tpl-src-03','https://drive.example.local/TPL-SRC-03','DOCX','MAPPING_IN_PROGRESS','Seeded template.',now()),
('TPL-SRC-04','Fractionation Log','04_Fractionation_Log.xlsx','drive-tpl-src-04','https://drive.example.local/TPL-SRC-04','XLSX','ACTIVE','Seeded template.',now()),
('TPL-SRC-05','Treatment Summary','05_Treatment_Summary.docx','drive-tpl-src-05','https://drive.example.local/TPL-SRC-05','DOCX','DRAFT','Seeded template.',now()),
('TPL-SRC-06','Carepath Audit Note','06_Carepath_Audit.docx','drive-tpl-src-06','https://drive.example.local/TPL-SRC-06','DOCX','MISSING','Seeded template.',now());

INSERT INTO "DocumentRequirement" ("id","name","workflowPhase","responsibleParty","diagnosis","protocol","universal","templateSourceId","defaultStatus","requiredAction","requiredFields","outputFormats","cptCode","createsTask","autoCreate","taskTitle","taskNumber","timing","auditSteps")
SELECT 'REQ-' || gs, names[gs], phases[gs], parties[gs], CASE WHEN gs % 2=0 THEN 'ALL' ELSE 'SKIN_CANCER' END, NULL, gs % 2=0, 'TPL-SRC-0' || gs, statuses[gs]::"DocumentStatus", 'Complete ' || names[gs], ARRAY['Patient reference','Course reference'], CASE WHEN gs=4 THEN ARRAY['XLSX','PDF'] ELSE ARRAY['DOCX','PDF'] END, CASE WHEN gs=4 THEN '77401' ELSE NULL END, true, true, names[gs], 'T-' || gs, 'Before next phase', ARRAY['Evidence traceable','Signature tracked']
FROM generate_series(1,6) gs,
(SELECT ARRAY['Carepath Preauth Packet','Simulation Order','Planning Note','Fractionation Log','Treatment Summary','Carepath Audit Note'] names,
ARRAY['CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'] phases,
ARRAY['VA','RAD_ONC','PHYSICIST','RTT','RAD_ONC','BILLING'] parties,
ARRAY['PENDING_NEEDED','READY_FOR_REVIEW','MISSING_FIELDS','READY_FOR_REVIEW','SIGNED','NEEDS_REVIEW'] statuses) s;

INSERT INTO "WorkflowDefinition" ("id","name","diagnosis","protocol","description","phases","documentRequirementIds","status")
VALUES
('WF-SKIN','Skin Cancer IGSRT','SKIN_CANCER','Skin Cancer IGSRT','Seeded skin workflow.',ARRAY['CONSULTATION','CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'],ARRAY['REQ-1','REQ-2','REQ-3','REQ-4','REQ-5','REQ-6'],'ACTIVE'),
('WF-ARTHRITIS','Joint Orthovoltage','ARTHRITIS','Joint Orthovoltage','Seeded arthritis workflow.',ARRAY['CONSULTATION','CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'],ARRAY['REQ-1','REQ-2','REQ-3','REQ-4','REQ-5','REQ-6'],'ACTIVE'),
('WF-DUPUYTRENS','Dupuytren Orthovoltage','DUPUYTRENS','Dupuytren Orthovoltage','Seeded dupuytren workflow.',ARRAY['CONSULTATION','CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'],ARRAY['REQ-1','REQ-2','REQ-3','REQ-4','REQ-5','REQ-6'],'ACTIVE');

INSERT INTO "CourseFolderPlaceholder" ("id","patientRef","courseRef","storageProvider","path","folders","status","createdAt")
SELECT 'FOLDER-' || "courseRef", "patientRef", "courseRef", 'PENDING_DRIVE', '/CureRays/' || "patientRef" || '/' || "courseRef", ARRAY['Intake','Simulation','Planning','Treatment','Audit'], 'READY', now()
FROM "OperationalCourse";

INSERT INTO "OperationalWorkflowStep" ("id","courseRef","workflowDefinitionId","stepNumber","stepName","phase","status","responsibleRole","triggerEvent","dueDate","requiresSignature","linkedDocumentId","blockers","auditChecklist","notes","createdAt","updatedAt")
SELECT 'STEP-' || c."courseRef" || '-' || gs, c."courseRef", c."workflowDefinitionId", gs, names[gs], phases[gs],
CASE WHEN c.status='ON_HOLD' AND gs=3 THEN 'BLOCKED' WHEN gs < 3 THEN 'COMPLETED' WHEN gs=4 THEN 'READY_FOR_REVIEW' ELSE 'IN_PROGRESS' END,
parties[gs], 'Seeded trigger', now() + ((gs-3) || ' days')::interval, gs >= 3, 'GDOC-' || c."courseRef" || '-0' || gs,
CASE WHEN c.status='ON_HOLD' AND gs=3 THEN ARRAY['Physics review missing'] ELSE ARRAY[]::text[] END,
ARRAY['Owner assigned','Evidence traceable'], CASE WHEN c.status='ON_HOLD' AND gs=3 THEN 'Seeded blocker.' ELSE NULL END, now(), now()
FROM "OperationalCourse" c CROSS JOIN generate_series(1,6) gs,
(SELECT ARRAY['Carepath Preauth','Simulation Order','Clinical Treatment Planning Note','Fractionation Log','Treatment Summary','Carepath Audit Sign'] names,
ARRAY['CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'] phases,
ARRAY['VA','RAD_ONC','PHYSICIST','RTT','RAD_ONC','BILLING'] parties) s;

INSERT INTO "CarepathTask" ("id","courseRef","taskNumber","title","workflowPhase","documentName","status","responsibleParty","timing","noteAction","cptCodes","auditSteps","auditReady","dueDate","completedAt","signedAt","lastUpdatedAt","assignedUser")
SELECT 'TASK-' || c."courseRef" || '-' || gs, c."courseRef", lpad(gs::text,2,'0'), names[gs], phases[gs], docs[gs],
CASE WHEN c.status='ON_HOLD' AND gs=3 THEN 'BLOCKED' WHEN gs < 3 THEN 'COMPLETED' WHEN gs=6 AND c."chartRoundsPhase"='POST' THEN 'OVERDUE' WHEN gs=4 THEN 'READY_FOR_REVIEW' ELSE 'IN_PROGRESS' END,
parties[gs], 'Before next phase', 'Complete ' || docs[gs], ARRAY['77401'], ARRAY['Review evidence','Confirm signature'], gs < 3, now() + ((gs-3) || ' days')::interval, CASE WHEN gs < 3 THEN now() ELSE NULL END, NULL, now(), parties[gs]
FROM "OperationalCourse" c CROSS JOIN generate_series(1,6) gs,
(SELECT ARRAY['Carepath Preauth','Simulation Order','Clinical Treatment Planning Note','Fractionation Log','Treatment Summary','Carepath Audit Sign'] names,
ARRAY['Carepath Preauth Packet','Simulation Order','Planning Note','Fractionation Log','Treatment Summary','Carepath Audit Note'] docs,
ARRAY['CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'] phases,
ARRAY['VA','RAD_ONC','PHYSICIST','RTT','RAD_ONC','BILLING'] parties) s;

INSERT INTO "OperationalAuditCheck" ("id","courseRef","category","label","status","required","evidenceDocumentId","notes","completedByUserId","completedAt")
SELECT 'AUDIT-' || "courseRef" || '-' || "taskNumber", "courseRef", "workflowPhase", title || ' evidence', CASE WHEN "auditReady" THEN 'COMPLETED' WHEN status='BLOCKED' THEN 'BLOCKED' ELSE 'OPEN' END, true, 'GDOC-' || "courseRef" || '-' || "taskNumber", NULL, CASE WHEN "auditReady" THEN "responsibleParty" ELSE NULL END, CASE WHEN "auditReady" THEN now() ELSE NULL END
FROM "CarepathTask";

INSERT INTO "GeneratedDocument" ("id","templateId","patientRef","courseRef","name","clinicalPhase","responsibleParty","status","requiredAction","cptCode","assignedTo","lastUpdatedAt","signedAt","exportedAt","signReviewState","auditReady")
SELECT 'GDOC-' || c."courseRef" || '-0' || gs, 'DOC-TPL-0' || gs, c."patientRef", c."courseRef", docs[gs], phases[gs], parties[gs],
CASE WHEN gs < 3 THEN 'SIGNED'::"DocumentStatus" WHEN c.status='ON_HOLD' AND gs=3 THEN 'MISSING_FIELDS'::"DocumentStatus" ELSE statuses[gs]::"DocumentStatus" END,
CASE WHEN gs < 3 THEN 'No action required' ELSE 'Resolve ' || docs[gs] END, CASE WHEN gs=4 THEN '77401' ELSE NULL END, parties[gs], now(), CASE WHEN gs < 3 THEN now() ELSE NULL END, NULL, CASE WHEN gs < 3 THEN 'SIGNED' ELSE 'READY_FOR_SIGNATURE' END, gs < 3
FROM "OperationalCourse" c CROSS JOIN generate_series(1,6) gs,
(SELECT ARRAY['Carepath Preauth Packet','Simulation Order','Planning Note','Fractionation Log','Treatment Summary','Carepath Audit Note'] docs,
ARRAY['CHART_PREP','SIMULATION','PLANNING','ON_TREATMENT','POST_TX','AUDIT'] phases,
ARRAY['VA','RAD_ONC','PHYSICIST','RTT','RAD_ONC','BILLING'] parties,
ARRAY['PENDING_NEEDED','READY_FOR_REVIEW','MISSING_FIELDS','READY_FOR_REVIEW','SIGNED','NEEDS_REVIEW'] statuses) s;

INSERT INTO "WorkflowDocumentState" ("id","requirementId","documentId","patientRef","courseRef","name","workflowPhase","responsibleParty","status","requiredAction","auditReady","templateSourceStatus","sourceDriveUrl","mapped","lastUpdatedAt")
SELECT 'WDOC-' || "courseRef" || '-' || right(id,2), 'REQ-' || right(id,1), id, "patientRef", "courseRef", name, "clinicalPhase", "responsibleParty", status, "requiredAction", "auditReady", CASE WHEN right(id,1)='6' THEN 'MISSING'::"TemplateSourceStatus" WHEN right(id,1)='3' THEN 'MAPPING_IN_PROGRESS'::"TemplateSourceStatus" ELSE 'ACTIVE'::"TemplateSourceStatus" END, 'https://drive.example.local/' || "templateId", right(id,1) <> '6', now()
FROM "GeneratedDocument";

INSERT INTO "PatientRecordHistory" ("id","patientRef","courseRef","action","summary","previousValue","newValue","changedBy","role","reason","timestamp")
SELECT 'HIST-' || "courseRef", "patientRef", "courseRef", 'SEEDED', 'Seeded PostgreSQL patient-course record.', 'NONE', 'PHI_REDACTED', 'SYSTEM', 'SYSTEM', 'Local database seed', now()
FROM "OperationalCourse";

INSERT INTO "OperationalAuditEvent" ("id","patientRef","userId","userName","role","action","entityType","entityId","previousValue","newValue","redacted","timestamp","reason")
SELECT 'OPS-EVENT-' || "courseRef", "patientRef", 'SYSTEM', 'Seed Script', 'SYSTEM', 'SEED', 'COURSE', "courseRef", 'NONE', 'PHI_REDACTED', true, now(), 'Local PostgreSQL seed'
FROM "OperationalCourse";

GRANT USAGE ON SCHEMA public TO curerays_ops_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO curerays_ops_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO curerays_ops_user;
