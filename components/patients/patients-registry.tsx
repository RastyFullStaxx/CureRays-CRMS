"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FilePlus2,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UsersRound,
  X
} from "lucide-react";
import type { CarepathTask, ChartRoundsPhase, Patient, PatientStatus, TreatmentCourse } from "@/lib/types";
import { cn } from "@/lib/workflow";

type PatientsRegistryProps = {
  patients: Patient[];
  courses: TreatmentCourse[];
  tasks: CarepathTask[];
};

type RegistryView = "All Patients" | "Upcoming" | "On Treatment" | "Post" | "Blocked" | "Needs Action";

const views: RegistryView[] = ["All Patients", "Upcoming", "On Treatment", "Post", "Blocked", "Needs Action"];

const filters = ["Diagnosis", "Phase", "Detailed Phase", "Status", "MD", "Assigned Staff", "Date Range", "Has Flags"];

const metricCards = [
  { label: "Total Active Courses", value: 48, detail: "Across registry", icon: UsersRound, tone: "blue" },
  { label: "Upcoming", value: 24, detail: "Starting soon", icon: CalendarDays, tone: "blue" },
  { label: "On Treatment", value: 27, detail: "Currently active", icon: ShieldCheck, tone: "blue" },
  { label: "Post-Tx", value: 41, detail: "Closeout workflows", icon: CheckCircle2, tone: "indigo" },
  { label: "Blocked", value: 6, detail: "Action needed", icon: ListFilter, tone: "orange" },
  { label: "Missing Follow-Up", value: 5, detail: "Scheduling gaps", icon: Clock3, tone: "amber" }
] as const;

const phaseLabels: Record<ChartRoundsPhase, string> = {
  UPCOMING: "Upcoming",
  ON_TREATMENT: "On Treatment",
  POST: "Post-Tx"
};

const statusLabels: Record<PatientStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  PAUSED: "Paused"
};

const carepathStages = ["Carepath", "Simulation", "Planning", "On Treatment", "Audit"];

function phaseClass(phase: ChartRoundsPhase) {
  if (phase === "ON_TREATMENT") {
    return "bg-[#0033A0] text-white ring-[#0033A0]/15";
  }
  if (phase === "POST") {
    return "bg-[#F1ECF5] text-[#725784] ring-[#A295A4]/25";
  }
  return "bg-[#EAF1FF] text-[#0033A0] ring-[#7DA0CA]/25";
}

function statusClass(status: PatientStatus) {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-500/15";
  }
  if (status === "ON_HOLD") {
    return "bg-[#FFF0E8] text-[#FF6620] ring-[#FF6620]/20";
  }
  return "bg-[#EEF3FA] text-[#2B2F5F] ring-[#7DA0CA]/25";
}

function metricToneClass(tone: (typeof metricCards)[number]["tone"]) {
  const tones = {
    blue: "bg-[#EAF1FF] text-[#0033A0]",
    indigo: "bg-[#EEF3FA] text-[#2B2F5F]",
    orange: "bg-[#FFF0E8] text-[#FF6620]",
    amber: "bg-[#FFF7D6] text-[#B46B00]"
  };
  return tones[tone];
}

function activeCourseFor(patient: Patient, courses: TreatmentCourse[]) {
  return courses.find((course) => course.id === patient.activeCourseId);
}

function openTaskCount(patient: Patient, tasks: CarepathTask[]) {
  return tasks.filter((task) => task.courseId === patient.activeCourseId && !["COMPLETED", "SIGNED", "CLOSED"].includes(task.status)).length;
}

function matchesView(patient: Patient, view: RegistryView) {
  if (view === "Upcoming") return patient.chartRoundsPhase === "UPCOMING";
  if (view === "On Treatment") return patient.chartRoundsPhase === "ON_TREATMENT";
  if (view === "Post") return patient.chartRoundsPhase === "POST";
  if (view === "Blocked") return patient.status === "ON_HOLD";
  if (view === "Needs Action") return patient.flags.length > 0 || !patient.checklist.followUpScheduled || !patient.checklist.billingComplete;
  return true;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 10);
}

function courseProgressIndex(patient: Patient) {
  if (patient.chartRoundsPhase === "UPCOMING") return 1;
  if (patient.chartRoundsPhase === "ON_TREATMENT") return 3;
  return 4;
}

export function PatientsRegistry({ patients, courses, tasks }: PatientsRegistryProps) {
  const [activeView, setActiveView] = useState<RegistryView>("All Patients");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPatient = patients.find((patient) => patient.id === selectedId) ?? null;
  const selectedCourse = selectedPatient ? activeCourseFor(selectedPatient, courses) : null;

  const filteredPatients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return patients.filter((patient) => {
      if (!matchesView(patient, activeView)) return false;
      if (!normalizedQuery) return true;
      return [
        patient.id,
        patient.mrn,
        patient.firstName,
        patient.lastName,
        patient.diagnosis,
        patient.location,
        patient.physician,
        patient.assignedStaff,
        patient.nextAction,
        ...patient.flags.map((flag) => flag.summary)
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeView, patients, query]);

  return (
    <div className="space-y-4 bg-white">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {metricCards.map((metric) => (
          <article key={metric.label} className="min-h-[78px] rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#3D5A80]">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold leading-none text-[#061A55]">{metric.value}</p>
                <p className="mt-1 truncate text-[11px] font-semibold text-[#3D5A80]/80">{metric.detail}</p>
              </div>
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", metricToneClass(metric.tone))}>
                <metric.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#D8E4F5] bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-[#0033A0]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#061A55] outline-none placeholder:text-[#3D5A80]/65"
              placeholder="Search patient, MRN, diagnosis, staff, or next action"
              type="search"
            />
          </label>
          <div className="scrollbar-soft flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="inline-flex h-10 min-w-fit items-center gap-2 rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] px-3 text-xs font-bold text-[#061A55]"
              >
                {filter}
                <ChevronDown className="h-3.5 w-3.5 text-[#0033A0]" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] px-3 py-2 text-xs font-bold text-[#061A55]">
              Live View: {patients.length}
            </span>
            <button type="button" className="rounded-xl border border-[#D8E4F5] bg-white px-3 py-2 text-xs font-bold text-[#0033A0]">
              <Upload className="mr-2 inline h-4 w-4" aria-hidden="true" />
              Import / Sync
            </button>
            <button type="button" className="rounded-xl bg-[#0033A0] px-3 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)]">
              <Plus className="mr-2 inline h-4 w-4" aria-hidden="true" />
              Add Patient
            </button>
          </div>
        </div>
        <div className="scrollbar-soft mt-3 flex gap-2 overflow-x-auto border-t border-[#E7EEF8] pt-3">
          {views.map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className={cn(
                "h-9 min-w-fit rounded-xl px-3 text-sm font-bold transition",
                activeView === view ? "bg-[#0033A0] text-white" : "border border-[#D8E4F5] bg-white text-[#3D5A80] hover:bg-[#F8FBFF]"
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E7EEF8] px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-[#061A55]">Patient Registry ({filteredPatients.length})</h2>
            <p className="mt-0.5 text-xs font-semibold text-[#3D5A80]">One master list with phase-driven views.</p>
          </div>
          <button type="button" className="rounded-xl border border-[#D8E4F5] bg-white px-3 py-2 text-xs font-bold text-[#0033A0]">
            Column Settings
          </button>
        </div>
        <div className="scrollbar-soft max-w-full overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#F8FBFF] text-left text-[11px] font-bold uppercase tracking-wide text-[#3D5A80]">
                {["Patient", "Name", "Diagnosis", "Site / Location", "MD", "Phase", "Status", "Dates", "Staff", "Next Action", "Flags", ""].map((header) => (
                  <th key={header || "actions"} scope="col" className="px-3 py-2.5">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EEF8]">
              {filteredPatients.map((patient) => {
                const course = activeCourseFor(patient, courses);
                const isSelected = selectedId === patient.id;
                return (
                  <tr
                    key={patient.id}
                    onClick={() => setSelectedId(patient.id)}
                    className={cn(
                      "h-[68px] cursor-pointer bg-white text-sm transition hover:bg-[#F8FBFF]",
                      isSelected && "bg-[#F8FBFF] shadow-[inset_4px_0_0_#0033A0]"
                    )}
                  >
                    <td className="w-[132px] px-3 py-2.5">
                      <Link
                        href={`/patients/${patient.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="block font-bold text-[#0033A0] hover:underline"
                      >
                        {patient.id}
                      </Link>
                      <span className="block truncate text-xs font-semibold text-[#3D5A80]">{patient.mrn}</span>
                    </td>
                    <td className="w-[150px] px-3 py-2.5">
                      <span className="block truncate font-bold text-[#061A55]">{patient.lastName}, {patient.firstName}</span>
                    </td>
                    <td className="w-[180px] px-3 py-2.5">
                      <span className="block max-w-[170px] truncate font-semibold text-[#061A55]" title={patient.diagnosis}>
                        {patient.diagnosis}
                      </span>
                    </td>
                    <td className="w-[150px] px-3 py-2.5">
                      <span className="block max-w-[140px] truncate font-semibold text-[#061A55]" title={patient.location}>
                        {patient.location}
                      </span>
                    </td>
                    <td className="w-[150px] px-3 py-2.5">
                      <span className="block max-w-[140px] truncate font-semibold text-[#061A55]" title={patient.physician}>
                        {patient.physician}
                      </span>
                    </td>
                    <td className="w-[120px] px-3 py-2.5">
                      <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1", phaseClass(patient.chartRoundsPhase))}>
                        {phaseLabels[patient.chartRoundsPhase]}
                      </span>
                    </td>
                    <td className="w-[104px] px-3 py-2.5">
                      <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1", statusClass(patient.status))}>
                        {statusLabels[patient.status]}
                      </span>
                    </td>
                    <td className="w-[118px] px-3 py-2.5">
                      <span className="block text-xs font-bold text-[#061A55]">{formatDate(course?.startDate)}</span>
                      <span className="block text-xs font-semibold text-[#3D5A80]">{formatDate(course?.endDate)}</span>
                    </td>
                    <td className="w-[135px] px-3 py-2.5">
                      <span className="block max-w-[125px] truncate font-semibold text-[#061A55]" title={patient.assignedStaff}>
                        {patient.assignedStaff}
                      </span>
                    </td>
                    <td className="w-[220px] px-3 py-2.5">
                      <span className="block max-w-[210px] truncate font-semibold text-[#061A55]" title={patient.nextAction}>
                        {patient.nextAction}
                      </span>
                    </td>
                    <td className="w-[130px] px-3 py-2.5">
                      {patient.flags.length ? (
                        <span className="inline-flex max-w-[120px] items-center gap-1 rounded-full bg-[#FFF0E8] px-2.5 py-1 text-xs font-bold text-[#FF6620] ring-1 ring-[#FF6620]/20" title={patient.flags.map((flag) => flag.summary).join(", ")}>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6620]" />
                          {patient.flags.length} flag{patient.flags.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#7DA0CA]">Clear</span>
                      )}
                    </td>
                    <td className="w-[64px] px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(patient.id);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-[#D8E4F5] bg-white text-[#0033A0] hover:bg-[#F8FBFF]"
                        aria-label={`Open quick view for ${patient.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#E7EEF8] px-4 py-3 text-sm font-semibold text-[#3D5A80] md:flex-row md:items-center md:justify-between">
          <span>Showing {filteredPatients.length} of {patients.length} patients</span>
          <span>Phase/status filters update this master registry without moving rows between tabs.</span>
        </div>
      </section>

      {selectedPatient ? (
        <PatientQuickView
          patient={selectedPatient}
          course={selectedCourse}
          openTasks={openTaskCount(selectedPatient, tasks)}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}

function PatientQuickView({
  patient,
  course,
  openTasks,
  onClose
}: {
  patient: Patient;
  course?: TreatmentCourse | null;
  openTasks: number;
  onClose: () => void;
}) {
  const progressIndex = courseProgressIndex(patient);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-[#061A55]/20" aria-label="Close patient quick view" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-[#D8E4F5] bg-white shadow-[-16px_0_40px_rgba(0,51,160,0.14)] sm:w-[420px]">
        <header className="flex items-start justify-between gap-3 border-b border-[#E7EEF8] p-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-[#FF6620]">Patient Quick View</p>
            <h2 className="mt-2 truncate text-xl font-bold text-[#061A55]">{patient.lastName}, {patient.firstName}</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">{patient.id} · {patient.mrn}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#D8E4F5] text-[#0033A0] hover:bg-[#F8FBFF]">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto p-5">
          <section className="rounded-2xl border border-[#D8E4F5] bg-[#F8FBFF] p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Diagnosis" value={patient.diagnosis} />
              <Info label="Physician" value={patient.physician} />
              <Info label="Active Course" value={course?.id ?? patient.activeCourseId} />
              <Info label="Location" value={patient.location} />
              <Info label="Phase" value={<span className={cn("rounded-full px-2.5 py-1 text-xs font-bold ring-1", phaseClass(patient.chartRoundsPhase))}>{phaseLabels[patient.chartRoundsPhase]}</span>} />
              <Info label="Status" value={<span className={cn("rounded-full px-2.5 py-1 text-xs font-bold ring-1", statusClass(patient.status))}>{statusLabels[patient.status]}</span>} />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-[#D8E4F5] bg-white p-4">
            <h3 className="text-sm font-bold text-[#061A55]">Next Action</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#3D5A80]">{patient.nextAction}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniState label="Open Tasks" value={openTasks} warning={openTasks > 0} />
              <MiniState label="Flags" value={patient.flags.length} warning={patient.flags.length > 0} />
              <MiniState label="Tx Fx" value={course ? `${course.currentFraction}/${course.totalFractions}` : "-"} />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-[#D8E4F5] bg-white p-4">
            <h3 className="text-sm font-bold text-[#061A55]">Registry Readiness</h3>
            <div className="mt-3 space-y-3">
              <ChecklistRow label="TX Summary Complete" complete={patient.checklist.txSummaryComplete} />
              <ChecklistRow label="Follow-Up Scheduled" complete={patient.checklist.followUpScheduled} />
              <ChecklistRow label="Billing Complete" complete={patient.checklist.billingComplete} />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-[#D8E4F5] bg-white p-4">
            <h3 className="text-sm font-bold text-[#061A55]">Carepath Status</h3>
            <ol className="mt-4 space-y-3">
              {carepathStages.map((stage, index) => {
                const state = index < progressIndex ? "Completed" : index === progressIndex ? "In Progress" : "Upcoming";
                return (
                  <li key={stage} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold",
                        index <= progressIndex ? "border-[#0033A0] bg-[#0033A0] text-white" : "border-[#D8E4F5] bg-white text-[#7DA0CA]"
                      )}
                    >
                      {index < progressIndex ? "✓" : index === progressIndex ? "•" : ""}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-bold text-[#061A55]">{stage}</span>
                    <span className="text-xs font-semibold text-[#3D5A80]">{state}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="mt-4 rounded-2xl border border-[#D8E4F5] bg-white p-4">
            <h3 className="text-sm font-bold text-[#061A55]">Flags / Issues</h3>
            <div className="mt-3 space-y-2">
              {patient.flags.length ? (
                patient.flags.map((flag) => (
                  <div key={flag.id} className="rounded-xl border border-[#FFD7C2] bg-[#FFF8F4] p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#FF6620]">{flag.severity} · {flag.owner}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-[#061A55]">{flag.summary}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-[#F8FBFF] p-3 text-sm font-bold text-[#3D5A80]">No active flags.</p>
              )}
            </div>
          </section>
        </div>

        <footer className="space-y-3 border-t border-[#E7EEF8] p-5">
          <Link href={`/patients/${patient.id}`} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0033A0] text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)]">
            Open Workspace
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="grid grid-cols-3 gap-2">
            {["Create Task", "Update Phase", "Add Note"].map((action, index) => (
              <button key={action} type="button" className="h-10 rounded-xl border border-[#D8E4F5] bg-white text-xs font-bold text-[#0033A0] hover:bg-[#F8FBFF]">
                {index === 0 ? <FilePlus2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> : null}
                {action}
              </button>
            ))}
          </div>
        </footer>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#3D5A80]">{label}</p>
      <div className="mt-1 min-w-0 text-sm font-bold text-[#061A55]">{value}</div>
    </div>
  );
}

function MiniState({ label, value, warning = false }: { label: string; value: string | number; warning?: boolean }) {
  return (
    <div className={cn("rounded-xl p-3 text-center", warning ? "bg-[#FFF0E8]" : "bg-[#EAF1FF]")}>
      <p className={cn("text-lg font-bold leading-none", warning ? "text-[#FF6620]" : "text-[#0033A0]")}>{value}</p>
      <p className="mt-1 text-[11px] font-bold text-[#3D5A80]">{label}</p>
    </div>
  );
}

function ChecklistRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-[#061A55]">{label}</span>
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", complete ? "bg-emerald-50 text-emerald-700" : "bg-[#FFF0E8] text-[#FF6620]")}>
        {complete ? "Complete" : "Pending"}
      </span>
    </div>
  );
}
