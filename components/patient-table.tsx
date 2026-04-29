import Link from "next/link";
import { AlertTriangle, ArrowRight, LockKeyhole } from "lucide-react";
import type { CarepathTask, FractionLogEntry, GeneratedDocument, Patient, TreatmentCourse } from "@/lib/types";
import {
  auditReadinessScore,
  carepathProgress,
  completedTaskStatuses,
  courseDocuments,
  courseFractions,
  courseTasks,
  documentProgress,
  formatLastUpdated,
  patientActiveCourse,
  patientName
} from "@/lib/workflow";
import { PhaseBadge, ResponsiblePartyBadge, StatusBadge } from "@/components/badges";
import { ProgressBar } from "@/components/progress-bar";

type PatientTableProps = {
  patients: Patient[];
  courses?: TreatmentCourse[];
  tasks?: CarepathTask[];
  documents?: GeneratedDocument[];
  fractions?: FractionLogEntry[];
  title?: string;
  description?: string;
};

export function PatientTable({
  patients,
  courses = [],
  tasks = [],
  documents = [],
  fractions = [],
  title = "Patient workflow",
  description
}: PatientTableProps) {
  return (
    <section className="glass-panel overflow-hidden rounded-glass">
      <div className="flex flex-col gap-2 border-b border-white/70 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">{title}</h3>
          {description ? <p className="mt-1 text-sm text-curerays-indigo">{description}</p> : null}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-xs font-semibold text-curerays-indigo">
          <LockKeyhole className="h-3.5 w-3.5 text-curerays-plum" aria-hidden="true" />
          PHI-minimized operational view
        </span>
      </div>

      <div className="scrollbar-soft overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse">
          <thead>
            <tr className="bg-white/42 text-left text-xs font-bold uppercase text-curerays-indigo">
              <th scope="col" className="px-5 py-3">Patient</th>
              <th scope="col" className="px-5 py-3">Course</th>
              <th scope="col" className="px-5 py-3">Phase</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Carepath</th>
              <th scope="col" className="px-5 py-3">Documents</th>
              <th scope="col" className="px-5 py-3">Audit</th>
              <th scope="col" className="px-5 py-3">Next Action</th>
              <th scope="col" className="px-5 py-3">Flag</th>
              <th scope="col" className="px-5 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/70">
            {patients.map((patient) => {
              const course = patientActiveCourse(patient, courses);
              const patientTasks = course ? courseTasks(course.id, tasks) : [];
              const patientDocuments = course ? courseDocuments(course.id, documents) : [];
              const patientFractions = course ? courseFractions(course.id, fractions) : [];
              const carepath = carepathProgress(patientTasks);
              const document = documentProgress(patientDocuments);
              const audit = auditReadinessScore(patientTasks, patientDocuments, patientFractions);
              const nextTask = patientTasks.find((task) => !completedTaskStatuses.includes(task.status));

              return (
                <tr key={patient.id} className="bg-white/28 transition hover:bg-white/58">
                  <td className="px-5 py-4 align-top">
                    <Link href={`/patients/${patient.id}`} className="font-semibold text-curerays-dark-plum hover:text-curerays-blue">
                      {patientName(patient)}
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-curerays-indigo">
                      {patient.id} - {patient.location}
                    </p>
                    <p className="mt-1 text-xs text-curerays-indigo/70">{patient.mrn}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="max-w-52 text-sm font-semibold leading-5 text-curerays-dark-plum">
                      {course?.protocolName ?? "No active course"}
                    </p>
                    <p className="mt-1 text-xs text-curerays-indigo">{patient.diagnosis}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <PhaseBadge phase={patient.chartRoundsPhase} />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="min-w-36">
                      <ProgressBar value={carepath.percent} />
                      <p className="mt-2 text-xs font-semibold text-curerays-indigo">
                        {carepath.completed}/{carepath.total} tasks
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="min-w-36">
                      <ProgressBar value={document.percent} />
                      <p className="mt-2 text-xs font-semibold text-curerays-indigo">
                        {document.completed}/{document.total} docs
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="text-lg font-semibold text-curerays-dark-plum">{audit}%</span>
                    <p className="text-xs font-semibold text-curerays-indigo">ready</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex max-w-60 items-start gap-2 text-sm font-medium leading-5 text-curerays-dark-plum/82">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-curerays-orange" aria-hidden="true" />
                      <span>{patient.nextAction}</span>
                    </div>
                    {nextTask ? (
                      <div className="mt-2">
                        <ResponsiblePartyBadge party={nextTask.responsibleParty} />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top">
                    {patient.flags.length > 0 ? (
                      <span className="inline-flex max-w-44 items-center gap-2 rounded-full bg-curerays-orange/10 px-3 py-1 text-xs font-bold text-curerays-orange ring-1 ring-curerays-orange/15">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{patient.flags[0].summary}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-curerays-indigo/58">No active flags</span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top text-xs font-semibold text-curerays-indigo">
                    {formatLastUpdated(patient.lastUpdatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
