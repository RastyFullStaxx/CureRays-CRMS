import { AlertTriangle, CheckCircle2, FileWarning, PenLine, PlayCircle, ShieldCheck, Upload } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, CompletionLine, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/global-page-data";

export default function AuditPage() {
  const blockers = moduleSnapshot.auditChecks.filter((check) => ["BLOCKED", "OVERDUE", "READY_FOR_REVIEW"].includes(check.status));
  const courses = moduleSnapshot.courses;
  const signedMissing = moduleSnapshot.generatedDocuments.filter((document) => document.signReviewState !== "SIGNED").length;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Upload className="h-4 w-4" />Export Audit Report</SecondaryButton>
        <PrimaryButton><PlayCircle className="h-4 w-4" />Run Audit Check</PrimaryButton>
      </ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Ready for Audit" value={courses.filter((course) => course.currentPhase === "AUDIT").length} detail="Closeout queue" icon={ShieldCheck} />
        <MetricTile label="Blocked" value={blockers.length} detail="Needs remediation" icon={AlertTriangle} tone="red" />
        <MetricTile label="Missing Signatures" value={signedMissing} detail="Provider queue" icon={PenLine} tone="orange" />
        <MetricTile label="Missing Documents" value={5} detail="Evidence gaps" icon={FileWarning} tone="orange" />
        <MetricTile label="Ready for Billing" value={9} detail="Audit aligned" icon={CheckCircle2} tone="green" />
      </MetricGrid>
      <FilterBar search="Search course, patient, diagnosis, blocker, document, or audit check..." filters={["Readiness", "Documents", "Signatures", "Images", "Billing", "Follow-up"]} />
      <WorkGrid
        main={
          <DataTable
            compact
            minWidth="1120px"
            columns={[{ header: "Course" }, { header: "Patient" }, { header: "Diagnosis" }, { header: "Phase" }, { header: "Audit %" }, { header: "Missing Items" }, { header: "Billing" }, { header: "Signature" }, { header: "Follow-up" }, { header: "Status" }, { header: "Actions" }]}
            footer={<Pagination label={`Showing 1 to ${courses.length} of ${courses.length} courses`} />}
            rows={courses.map((course, index) => {
              const readiness = Math.max(58, 96 - index * 7);
              return {
                id: course.id,
                cells: [
                  <span key="course" className="font-bold text-[#0033A0]">{course.id.replace("COURSE-", "C")}</span>,
                  <span key="patient" className="block truncate">{patientLabel(course.patientId)}</span>,
                  course.diagnosisType,
                  <Badge key="phase" tone="blue">{phaseLabel(course.currentPhase)}</Badge>,
                  <CompletionLine key="readiness" value={readiness} tone={readiness > 85 ? "green" : readiness > 70 ? "amber" : "red"} />,
                  course.flagsIssues.length || (index % 3),
                  <Badge key="billing" tone={index % 3 ? "orange" : "green"}>{index % 3 ? "Review" : "Ready"}</Badge>,
                  <Badge key="sig" tone={index % 2 ? "orange" : "green"}>{index % 2 ? "Pending" : "Complete"}</Badge>,
                  index % 2 ? "Needed" : "Scheduled",
                  <Badge key="status" tone={statusTone(course.status)}>{statusLabel(course.status)}</Badge>,
                  <RowActions key="actions" />
                ]
              };
            })}
          />
        }
        rail={
          <>
            <RightRailCard title="Audit Summary">
              <div className="space-y-2"><ListItem title="Closeout readiness" meta="Documents, signatures, treatment logs, billing, follow-up" /><ListItem title="Ready for billing" meta="9 courses" badge={<Badge tone="green">Ready</Badge>} /></div>
            </RightRailCard>
            <RightRailCard title="Current Blockers">
              <div className="space-y-2">{blockers.slice(0, 5).map((check) => <ListItem key={check.id} title={check.label} meta={check.category} badge={<Badge tone={statusTone(check.status)}>{statusLabel(check.status)}</Badge>} />)}</div>
            </RightRailCard>
            <RightRailCard title="Recent Audit Activity">
              <div className="space-y-2">{moduleSnapshot.auditChecks.slice(0, 4).map((check) => <ListItem key={check.id} title={`${check.label} checked`} meta={check.notes ?? "Audit evidence reviewed"} />)}</div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[{ label: "Run Audit Check", icon: <PlayCircle className="h-4 w-4" /> }, { label: "Generate Audit Packet", icon: <FileWarning className="h-4 w-4" /> }, { label: "Request Missing Signature", icon: <PenLine className="h-4 w-4" /> }]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
