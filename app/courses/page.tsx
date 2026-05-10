import Link from "next/link";
import { ContactRound, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { CourseTimeline } from "@/components/course-timeline";
import { getCourses } from "@/lib/module-data";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function CoursesPage() {
  const courses = getCourses();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Patient-course center"
        title="Courses"
        description="Each patient can have multiple treatment courses. Course state drives workflow steps, tasks, documents, treatment delivery, billing, and audit closeout."
        icon={ContactRound}
        stat={`${courses.length} courses`}
        actions={<PrimaryAction><Plus className="mr-2 inline h-4 w-4" />Create Course</PrimaryAction>}
      />
      <SummaryCardGrid columns={3}>
        {pageMetrics.patients.slice(0, 6).map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ActionToolbar
        searchPlaceholder="Search course, diagnosis, treatment site, phase, or next action"
        filters={["Diagnosis", "Detailed Phase", "Simple Phase", "Status", "Location", "Physician", "Flags"]}
      />
      <ViewTabs tabs={viewTabs.courses} />
      <WorkspaceGrid
        main={
          <DataTable
            minWidth="1500px"
            compact
            columns={[
              { header: "Course ID" },
              { header: "Patient" },
              { header: "Diagnosis" },
              { header: "Site" },
              { header: "Laterality" },
              { header: "Current Phase" },
              { header: "Status" },
              { header: "Start Date" },
              { header: "End Date" },
              { header: "Physician" },
              { header: "Assigned Staff" },
              { header: "Progress" },
              { header: "Blockers" },
              { header: "Next Action" }
            ]}
            rows={courses.map((course) => ({
              id: course.id,
              cells: [
                <Link key="course" href={`/patients/${course.patientId}`} className="font-bold text-[#0033A0]">
                  {course.id}
                </Link>,
                course.patientId,
                course.diagnosisType,
                course.treatmentSite,
                course.laterality ?? "N/A",
                <CourseTimeline key="timeline" currentPhase={course.currentPhase} />,
                course.status.replaceAll("_", " "),
                course.startDate ?? "Pending",
                course.endDate ?? "Open",
                course.physicianId ?? "Unassigned",
                course.assignedStaff.join(", "),
                "68%",
                course.flagsIssues.length ? <span key="block" className="font-bold text-[#FF6620]">{course.flagsIssues.length} blocker(s)</span> : "None",
                course.nextAction
              ]
            }))}
          />
        }
        rail={
          <DetailPanel title="Course Detail" subtitle="Cross-patient course drawer placeholder." actionLabel="Open patient">
            <FieldList
              items={[
                { label: "Course", value: courses[0]?.id ?? "Course" },
                { label: "Workflow", value: "11 / 15 steps" },
                { label: "Documents", value: "7 ready" },
                { label: "Treatment", value: "8 of 20 fx" },
                { label: "Audit", value: "Needs billing", tone: "warning" }
              ]}
            />
          </DetailPanel>
        }
      />
    </AppPageShell>
  );
}
