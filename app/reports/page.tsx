'use client';

import { useMemo, useState } from 'react';
import { UsersRound, CalendarDays, ClipboardList, FileText, PenLine } from 'lucide-react';
import Link from 'next/link';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
} from '@/lib/clinical-store';
import { createFacetOptions } from '@/lib/table-filters';

export default function ReportsPage() {
  const patients = operationalPatients();
  const [query, setQuery] = useState('');
  const [diagnosisFilter, setDiagnosisFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [signalFilter, setSignalFilter] = useState('');
  const diagnosisOptions = createFacetOptions(patients, (patient) => patient.diagnosisCategory);
  const phaseOptions = createFacetOptions(patients, (patient) => patient.chartRoundsPhase?.replace(/_/g, ' '));
  const scopedPatients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return patients.filter((patient) => {
      const phase = patient.chartRoundsPhase?.replace(/_/g, ' ') ?? '';
      const text = [
        patient.displayLabel,
        patient.patientRef,
        patient.diagnosisCategory,
        phase,
        patient.nextActionCategory,
      ].join(' ').toLowerCase();

      return (!normalizedQuery || text.includes(normalizedQuery))
        && (!diagnosisFilter || patient.diagnosisCategory === diagnosisFilter)
        && (!phaseFilter || phase === phaseFilter);
    });
  }, [diagnosisFilter, patients, phaseFilter, query]);
  const onTreatment = scopedPatients.filter((p) => p.chartRoundsPhase === 'ON_TREATMENT').length;
  const overdueTasks = carepathTasks.filter((t) => t.status === 'BLOCKED').length;

  return (
    <PageStack>
      <PageHeader
        title="Reports"
        subtitle="Operational intelligence and clinical workflow signals"
      />

      <StatGrid>
        <StatCard icon={UsersRound} label="Active Patients" value={scopedPatients.length} tone="primary" />
        <StatCard icon={CalendarDays} label="On Treatment" value={onTreatment} tone="success" />
        <StatCard icon={ClipboardList} label="Pending Tasks" value={carepathTasks.length} tone="warning" />
        <StatCard icon={FileText} label="Documents Ready" value={generatedDocuments.length} tone="info" />
        <StatCard icon={PenLine} label="Overdue Tasks" value={overdueTasks} tone="error" />
      </StatGrid>

      <FilterStrip>
        <FilterField grow>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search report, diagnosis, phase, staff workload, or audit signal"
          />
        </FilterField>
        <FilterField>
          <Select value={diagnosisFilter} onChange={(event) => setDiagnosisFilter(event.target.value)} aria-label="Diagnosis">
            <option value="">All Diagnoses</option>
            {diagnosisOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </FilterField>
        <FilterField>
          <Select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)} aria-label="Phase">
            <option value="">All Phases</option>
            {phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </FilterField>
        <FilterField>
          <Select value={signalFilter} onChange={(event) => setSignalFilter(event.target.value)} aria-label="Signal">
            <option value="">All Signals</option>
            <option value="patients">Patient Phase</option>
            <option value="documents">Documentation</option>
            <option value="tasks">Tasks</option>
          </Select>
        </FilterField>
      </FilterStrip>

      <div className="grid gap-4 xl:grid-cols-2">
        {signalFilter !== 'documents' && signalFilter !== 'tasks' && <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Patient Phase Distribution
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Upcoming', value: scopedPatients.filter((p) => p.chartRoundsPhase === 'UPCOMING').length, color: 'var(--color-info)' },
              { label: 'On Treatment', value: onTreatment, color: 'var(--color-success)' },
              { label: 'Post', value: scopedPatients.filter((p) => p.chartRoundsPhase === 'POST').length, color: 'var(--color-primary)' },
            ].map((segment) => (
              <div key={segment.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ background: segment.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{segment.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{segment.value}</span>
              </div>
            ))}
          </div>
        </Card>}

        {signalFilter !== 'patients' && signalFilter !== 'tasks' && <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Documentation Readiness
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Signed', value: generatedDocuments.filter((d) => d.signReviewState === 'SIGNED').length, color: 'var(--color-success)' },
              { label: 'Pending Review', value: generatedDocuments.filter((d) => d.signReviewState === 'READY_FOR_SIGNATURE').length, color: 'var(--color-info)' },
              { label: 'Needs Action', value: generatedDocuments.filter((d) => d.signReviewState === 'REVIEW_REQUIRED').length, color: 'var(--color-warning)' },
            ].map((segment) => (
              <div key={segment.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ background: segment.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{segment.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{segment.value}</span>
              </div>
            ))}
          </div>
        </Card>}

        {signalFilter !== 'patients' && signalFilter !== 'documents' && <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Task Pressure
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Open Tasks', value: carepathTasks.filter((task) => !['COMPLETED', 'SIGNED', 'CLOSED'].includes(task.status)).length, color: 'var(--color-info)' },
              { label: 'Blocked', value: overdueTasks, color: 'var(--color-error)' },
              { label: 'Completed', value: carepathTasks.filter((task) => task.status === 'COMPLETED').length, color: 'var(--color-success)' },
            ].map((segment) => (
              <div key={segment.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ background: segment.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{segment.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{segment.value}</span>
              </div>
            ))}
          </div>
        </Card>}
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>Need deeper patterns?</h2>
            <p className="mt-2" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
              Reports show current state. Analytics explains bottlenecks, risks, and solution opportunities.
            </p>
          </div>
          <Link href="/analytics">
            <Button>Open Analytics</Button>
          </Link>
        </div>
      </Card>
    </PageStack>
  );
}
