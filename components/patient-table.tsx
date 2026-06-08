import type {
  CarepathTask,
  ChartRoundsPhase,
  FractionLogEntry,
  GeneratedDocument,
  OperationalPatient,
  OperationalTreatmentCourse,
  Patient,
  TreatmentCourse,
} from '@/lib/types';
import { patientName } from '@/lib/workflow';
import { SectionCard } from '@/components/section-card';

export function PatientTable({
  patients,
  courses,
  tasks,
  documents,
  fractions,
  title,
  description,
}: {
  patients: Array<Patient | OperationalPatient>;
  courses: Array<TreatmentCourse | OperationalTreatmentCourse>;
  tasks: CarepathTask[];
  documents: GeneratedDocument[];
  fractions: FractionLogEntry[];
  title?: string;
  description?: string;
}) {
  return (
    <SectionCard title={title ?? 'Patients'} description={description}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-white/70 text-left text-xs font-bold uppercase text-curerays-indigo">
              <th scope="col" className="px-4 py-3">Patient</th>
              <th scope="col" className="px-4 py-3">Phase</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Next Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/70">
            {patients.map((patient) => {
              const displayName =
                'displayLabel' in patient ? patient.displayLabel : patientName(patient as Patient);
              return (
                <tr key={patient.id} className="transition hover:bg-white/40">
                  <td className="px-4 py-3 text-sm font-semibold text-curerays-dark-plum">{displayName}</td>
                  <td className="px-4 py-3 text-sm text-curerays-indigo">
                    {patient.chartRoundsPhase.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-curerays-indigo">
                    {patient.status.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-curerays-indigo">
                    {'nextAction' in patient ? (patient as Patient).nextAction ?? '—' : '—'}
                  </td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-curerays-indigo">
                  No patients in this phase.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
