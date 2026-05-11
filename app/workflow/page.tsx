import { AlertTriangle, CalendarDays, ClipboardList, FileText, PenLine, Settings, ShieldCheck, Upload } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, DonutChart, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, phaseLabel, responsiblePartyName, statusLabel, statusTone } from "@/lib/global-page-data";

export default function WorkflowPage() {
  const steps = moduleSnapshot.workflowSteps;
  const ready = steps.filter((step) => step.status === "READY_FOR_REVIEW").length;
  const pending = steps.filter((step) => ["PENDING", "IN_PROGRESS"].includes(step.status)).length;
  const signed = steps.filter((step) => step.signedAt).length;
  const blocked = steps.filter((step) => step.status === "BLOCKED").length;
  const overdue = steps.filter((step) => step.blockers.length).length;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Upload className="h-4 w-4" />Export</SecondaryButton>
        <PrimaryButton><Settings className="h-4 w-4" />Customize</PrimaryButton>
      </ModuleActions>
      <FilterBar search="Search workflow steps, patients, courses, or blockers..." filters={["Phase", "Status", "Diagnosis", "Assignee", "Due", "Role"]} />
      <MetricGrid columns={5}>
        <MetricTile label="Active Steps" value={steps.length} detail="Across all courses" icon={CalendarDays} />
        <MetricTile label="Ready for Review" value={ready} detail="Awaiting check" icon={PenLine} tone="purple" />
        <MetricTile label="Pending Signatures" value={signed} detail="Signed steps" icon={FileText} tone="green" />
        <MetricTile label="Blocked" value={blocked} detail="Needs escalation" icon={AlertTriangle} tone="red" />
        <MetricTile label="Overdue" value={overdue} detail="Past due or blocked" icon={ShieldCheck} tone="orange" />
      </MetricGrid>
      <WorkGrid
        main={
          <DataTable
            compact
            minWidth="1120px"
            columns={[
              { header: "Step" },
              { header: "Patient / Course" },
              { header: "Phase" },
              { header: "Status" },
              { header: "Role" },
              { header: "Assigned" },
              { header: "Due" },
              { header: "Signature" },
              { header: "Linked Doc" },
              { header: "Blocker" },
              { header: "Actions" }
            ]}
            footer={<Pagination label={`Showing 1 to ${steps.length} of ${steps.length} steps`} perPage="15 per page" />}
            rows={steps.map((step) => ({
              id: step.id,
              cells: [
                <div key="step"><p className="font-bold text-[#0033A0]">{step.stepNumber}. {step.stepName}</p></div>,
                <span key="course" className="block truncate">{patientLabel(moduleSnapshot.treatmentCourses.find((course) => course.id === step.courseId)?.patientId ?? "")} / {step.courseId.replace("COURSE-", "C")}</span>,
                <Badge key="phase" tone={statusTone(step.phase)}>{phaseLabel(step.phase)}</Badge>,
                <Badge key="status" tone={statusTone(step.status)}>{statusLabel(step.status)}</Badge>,
                responsiblePartyName(step.responsibleRole),
                step.assignedUserId ?? responsiblePartyName(step.responsibleRole),
                step.dueDate ?? "Ongoing",
                step.requiresSignature ? (step.signedAt ? <Badge key="signed" tone="green">Signed</Badge> : <Badge key="sig" tone="orange">Required</Badge>) : "-",
                step.linkedDocumentId ?? "Pending",
                step.blockers[0] ? <span key="blocker" className="line-clamp-2 text-[#FF6620]">{step.blockers[0]}</span> : "-",
                <RowActions key="actions" />
              ]
            }))}
          />
        }
        rail={
          <>
            <RightRailCard title="Workflow by Phase">
              <DonutChart total={steps.length} label="steps" segments={[
                { label: "Chart Prep", value: steps.filter((step) => step.phase === "CHART_PREP").length, color: "#F59E0B" },
                { label: "Planning", value: steps.filter((step) => step.phase === "PLANNING").length, color: "#2563EB" },
                { label: "On Treatment", value: steps.filter((step) => step.phase === "ON_TREATMENT").length, color: "#059669" },
                { label: "Audit", value: steps.filter((step) => step.phase === "AUDIT").length, color: "#8B5CF6" }
              ]} />
            </RightRailCard>
            <RightRailCard title="Current Blockers">
              <div className="space-y-2">
                {steps.filter((step) => step.status === "BLOCKED" || step.blockers.length).map((step) => (
                  <ListItem key={step.id} title={step.stepName} meta={step.blockers[0] ?? "Signature or evidence required"} badge={<Badge tone="red">High</Badge>} />
                ))}
              </div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[
                { label: "Assign Step", meta: "Route to role or user", icon: <ClipboardList className="h-4 w-4" /> },
                { label: "Route for Signature", meta: "Send linked document", icon: <PenLine className="h-4 w-4" /> },
                { label: "Generate Missing Document", meta: "Create from template", icon: <FileText className="h-4 w-4" /> }
              ]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
