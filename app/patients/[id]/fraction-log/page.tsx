import { notFound } from 'next/navigation';
import { CalendarDays, CheckCircle2, ClipboardCheck, Radiation } from 'lucide-react';
import { FractionWorksheetPanel } from '@/components/fraction-worksheet-panel';
import { PageHeader } from '@/components/shared/page-header';
import { PageStack } from '@/components/shared/page-stack';
import { StatCard } from '@/components/shared/stat-card';
import { StatGrid } from '@/components/shared/stat-grid';
import { fractionLogEntries, getTreatmentFractions, prescriptions, treatmentCourses } from '@/lib/services/operational-page-service';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { courseFractions, patientActiveCourse } from '@/lib/workflow';

export default function PatientFractionLogPage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess('Render patient fraction log page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const entries = courseFractions(course.id, fractionLogEntries);
  const scheduledFractions = getTreatmentFractions().filter((fraction) => fraction.courseId === course.id);
  const prescription = prescriptions.find((item) => item.courseId === course.id);
  const approved = entries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const cumulativeDose = entries.at(-1)?.cumulativeDoseCgy ?? entries.at(-1)?.cumulativeDose ?? 0;
  const nextReview = entries.find((entry) => !entry.mdApproval || !entry.dotApproval);

  return (
    <PageStack className="overflow-hidden">
      <PageHeader
        title="Fraction Log"
        subtitle={`${patient.firstName} ${patient.lastName} | ${course.id.replace('COURSE-', 'C')} | ${course.protocolName}`}
        breadcrumb={[
          { label: 'Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${patient.id}` },
          { label: 'Fraction Log', href: `/patients/${patient.id}/fraction-log` },
        ]}
      />

      <StatGrid>
        <StatCard icon={Radiation} label="Approved Fractions" value={`${approved}/${course.totalFractions}`} sub="MD + DOT complete" tone="success" />
        <StatCard icon={CalendarDays} label="Current Fraction" value={Math.max(course.currentFraction, approved)} sub="Course progress" tone="primary" />
        <StatCard icon={ClipboardCheck} label="Cumulative Dose" value={`${cumulativeDose} cGy`} sub="Latest logged" tone="info" />
        <StatCard icon={CheckCircle2} label="Next Review" value={nextReview ? `Fx ${nextReview.fractionNumber}` : 'Complete'} sub={nextReview?.date ?? 'No open approvals'} tone={nextReview ? 'warning' : 'success'} />
      </StatGrid>

      <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto pr-1">
        <FractionWorksheetPanel
          initialEntries={entries}
          course={course}
          phases={prescription?.phases ?? []}
          scheduledFractions={scheduledFractions}
          title="Native Fractionation Worksheet"
        />
      </div>
    </PageStack>
  );
}
