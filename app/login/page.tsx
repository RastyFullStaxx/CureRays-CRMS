import Image from 'next/image';
import { LoginCard } from '@/components/landing/login-card';
import { RadiotherapyOrbitCanvasMount } from '@/components/landing/radiotherapy-orbit-canvas-loader';

const courseStages = [
  { name: 'Overview', detail: 'Course gate and next action' },
  { name: 'Prepare', detail: 'Structured clinical work' },
  { name: 'Treatment', detail: 'Fractions and approvals' },
  { name: 'Record & Closeout', detail: 'Documents and completion' },
] as const;

const pilotLoop = [
  { label: 'Fill', detail: 'Complete the structured form' },
  { label: 'Save', detail: 'Resume a durable draft' },
  { label: 'Generate', detail: 'Create the clinic document' },
  { label: 'Download', detail: 'Export DOCX or XLSX' },
] as const;

export default function LoginPage() {
  return (
    <main className="landing-page dark">
      <span className="landing-ambient" aria-hidden="true" />
      <RadiotherapyOrbitCanvasMount />

      <div className="landing-page-frame">
        <header className="landing-topbar">
          <div className="landing-brand">
            <Image
              src="/System_Logo.svg"
              alt="CureRays"
              width={144}
              height={48}
              priority
              className="landing-logo"
            />
            <span>Clinical Workflow System</span>
          </div>
          <span className="landing-pilot-marker">Synthetic Data Pilot</span>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <div className="landing-copy-block">
              <p className="landing-kicker">Patient-Course Operations</p>
              <h1 id="landing-title" className="landing-title">
                One Course. Every Next Action in View.
              </h1>
              <p className="landing-description">
                Coordinate preparation, treatment, records, and clinic documents from one patient-centered workspace.
              </p>
            </div>

            <ol className="landing-course-map" aria-label="Patient course workspaces">
              {courseStages.map((stage, index) => (
                <li key={stage.name}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{stage.name}</strong>
                    <p>{stage.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="landing-card-wrap">
            <LoginCard />
          </div>
        </section>

        <section className="landing-proof" aria-labelledby="pilot-loop-title">
          <div className="landing-section-heading">
            <p>Working Pilot Loop</p>
            <h2 id="pilot-loop-title">From Structured Work to Clinic Documents</h2>
          </div>
          <ol className="landing-proof-flow">
            {pilotLoop.map((step, index) => (
              <li key={step.label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-operations" aria-labelledby="operations-title">
          <div className="landing-section-heading">
            <p>Course-Centered Clarity</p>
            <h2 id="operations-title">The Operational Truth Stays Together</h2>
          </div>
          <dl className="landing-signal-list">
            <div>
              <dt>Next Action</dt>
              <dd>Know what must happen before the course can advance.</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>Keep responsibility visible across clinical and operations teams.</dd>
            </div>
            <div>
              <dt>Blocker</dt>
              <dd>Surface missing evidence, review, or approval without hiding the work.</dd>
            </div>
            <div>
              <dt>Document Readiness</dt>
              <dd>Generate clinic-layout outputs from saved structured data.</dd>
            </div>
          </dl>
        </section>

        <aside className="landing-boundary" aria-labelledby="pilot-boundary-title">
          <div>
            <p>Pilot Boundary</p>
            <h2 id="pilot-boundary-title">Designed for Controlled Staff Evaluation</h2>
          </div>
          <p>
            Use synthetic or de-identified data only. Demo access is not production authentication, and prototype calculations are not clinical guidance.
          </p>
        </aside>

        <footer className="landing-footer">
          <span>CureRays Radiation Medicine</span>
          <span>Clinical Workflow System · Synthetic Data Pilot</span>
        </footer>
      </div>
    </main>
  );
}
