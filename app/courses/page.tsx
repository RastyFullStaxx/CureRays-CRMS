import Link from "next/link";
import { ContactRound } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { CourseTimeline } from "@/components/course-timeline";
import { getCourses } from "@/lib/module-data";

export default function CoursesPage() {
  const courses = getCourses();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Patient-course center"
        title="Courses"
        description="Each patient can have multiple treatment courses. Course state drives workflow steps, tasks, documents, treatment delivery, billing, and audit closeout."
        icon={ContactRound}
        stat={`${courses.length} courses`}
      />
      <FilterBar
        searchPlaceholder="Search course, diagnosis, treatment site, phase, or next action"
        filters={["Diagnosis", "Detailed Phase", "Simple Phase", "Status", "Location", "Physician", "Flags"]}
      />
      <DataTable
        minWidth="1320px"
        columns={[
          { header: "Course" },
          { header: "Patient" },
          { header: "Diagnosis" },
          { header: "Site / Laterality" },
          { header: "Phase Timeline" },
          { header: "Status" },
          { header: "Assigned Staff" },
          { header: "Next Action" },
          { header: "Flags" }
        ]}
        rows={courses.map((course) => ({
          id: course.id,
          cells: [
            <Link key="course" href={`/patients/${course.patientId}`} className="font-semibold text-curerays-blue">
              {course.courseNumber}
            </Link>,
            course.patientId,
            course.diagnosisType,
            `${course.treatmentSite} ${course.laterality ? `(${course.laterality})` : ""}`,
            <CourseTimeline key="timeline" currentPhase={course.currentPhase} />,
            course.status.replaceAll("_", " "),
            course.assignedStaff.join(", "),
            course.nextAction,
            course.flagsIssues.length ? course.flagsIssues.join("; ") : "None"
          ]
        }))}
      />
    </div>
  );
}
