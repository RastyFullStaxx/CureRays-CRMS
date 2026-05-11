import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Flag, Plus, Upload } from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
  Badge,
  DonutChart,
  FilterBar,
  ListItem,
  MetricGrid,
  MetricTile,
  ModuleActions,
  ModulePage,
  Pagination,
  PrimaryButton,
  QuickActions,
  RightRailCard,
  RowActions,
  SecondaryButton,
  WorkGrid
} from "@/components/module-ui";
import { moduleSnapshot, patientLabel, patientMrn, phaseLabel, statusLabel, statusTone } from "@/lib/global-page-data";

export default function CoursesPage() {
  const courses = moduleSnapshot.courses;
  const active = courses.filter((course) => course.status !== "COMPLETED").length;
  const upcoming = courses.filter((course) => course.simpleDashboardPhase === "UPCOMING").length;
  const onTreatment = courses.filter((course) => course.simpleDashboardPhase === "ON_TREATMENT").length;
  const post = courses.filter((course) => course.simpleDashboardPhase === "POST").length;
  const blocked = courses.filter((course) => course.flagsIssues.length || course.status === "BLOCKED").length;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Upload className="h-4 w-4" />Export</SecondaryButton>
        <SecondaryButton>Open Patient Workspace</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />New Course</PrimaryButton>
      </ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Active Courses" value={active} detail="Across patients" icon={ClipboardList} />
        <MetricTile label="Upcoming" value={upcoming} detail="Chart prep" icon={CalendarDays} tone="blue" />
        <MetricTile label="On Treatment" value={onTreatment} detail="Active delivery" icon={CheckCircle2} tone="green" />
        <MetricTile label="Post-Tx" value={post} detail="Summary and audit" icon={Flag} tone="purple" />
        <MetricTile label="Needs Action" value={blocked} detail="Blocked or flagged" icon={AlertTriangle} tone="orange" />
      </MetricGrid>
      <FilterBar
        search="Search patient, MRN, diagnosis, course, or next action..."
        filters={["Phase", "Diagnosis", "Physician", "Site", "Status", "Date Range"]}
      />
      <WorkGrid
        main={
          <DataTable
            minWidth="1180px"
            compact
            columns={[
              { header: "Course" },
              { header: "Patient" },
              { header: "MRN" },
              { header: "Diagnosis" },
              { header: "Site" },
              { header: "Physician" },
              { header: "Phase" },
              { header: "Status" },
              { header: "Start Date" },
              { header: "End Date" },
              { header: "Next Action" },
              { header: "Flags" },
              { header: "Staff" },
              { header: "Actions" }
            ]}
            footer={<Pagination label={`Showing 1 to ${courses.length} of ${courses.length} courses`} perPage="6 per page" />}
            rows={courses.map((course) => ({
              id: course.id,
              cells: [
                <div key="course" className="min-w-0"><p className="truncate font-bold text-[#0033A0]">{course.id.replace("COURSE-", "C")}</p><p className="truncate text-[11px] text-[#3D5A80]">{course.courseNumber}</p></div>,
                <span key="patient" className="block truncate font-bold">{patientLabel(course.patientId)}</span>,
                patientMrn(course.patientId),
                <Badge key="dx" tone={course.diagnosisType === "Skin" ? "blue" : course.diagnosisType === "Arthritis" ? "green" : "purple"}>{course.diagnosisType}</Badge>,
                <span key="site" className="block truncate">{course.treatmentSite}</span>,
                <span key="physician" className="block truncate">{course.physicianId ?? "Unassigned"}</span>,
                <Badge key="phase" tone={statusTone(course.currentPhase)}>{phaseLabel(course.currentPhase)}</Badge>,
                <Badge key="status" tone={statusTone(course.status)}>{statusLabel(course.status)}</Badge>,
                course.startDate ?? "Pending",
                course.endDate ?? "-",
                <span key="action" className="line-clamp-2">{course.nextAction}</span>,
                course.flagsIssues.length ? <Flag key="flag" className="h-4 w-4 text-[#FF6620]" aria-hidden="true" /> : <span key="none" className="text-[#7DA0CA]">-</span>,
                <span key="staff" className="block truncate">{course.assignedStaff.join(", ")}</span>,
                <RowActions key="actions" />
              ]
            }))}
          />
        }
        rail={
          <>
            <RightRailCard title="Course Summary">
              <DonutChart
                total={courses.length}
                label="courses"
                segments={[
                  { label: "Upcoming", value: upcoming, color: "#1D4ED8" },
                  { label: "On Treatment", value: onTreatment, color: "#059669" },
                  { label: "Post-Tx", value: post, color: "#8B5CF6" },
                  { label: "Blocked", value: blocked, color: "#FF6620" }
                ]}
              />
            </RightRailCard>
            <RightRailCard title="Blockers">
              <div className="space-y-2">
                {courses.filter((course) => course.flagsIssues.length).slice(0, 4).map((course) => (
                  <ListItem key={course.id} title={course.flagsIssues[0]} meta={`${patientLabel(course.patientId)} - ${course.id.replace("COURSE-", "C")}`} badge={<Badge tone="orange">Flag</Badge>} />
                ))}
              </div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions
                actions={[
                  { label: "Create Course", meta: "Start a new course", icon: <Plus className="h-4 w-4" /> },
                  { label: "Update Phase", meta: "Change chart-rounds phase", icon: <Flag className="h-4 w-4" /> },
                  { label: "Assign Staff", meta: "Route ownership", icon: <ClipboardList className="h-4 w-4" /> }
                ]}
              />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
