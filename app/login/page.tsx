import Image from 'next/image';
import { LoginCard } from '@/components/landing/login-card';
import { RadiotherapyOrbitCanvasMount } from '@/components/landing/radiotherapy-orbit-canvas-loader';

const courseStages = [
  { name: 'Overview', detail: 'Course gate and next action' },
  { name: 'Prepare', detail: 'Structured clinical work' },
  { name: 'Treatment', detail: 'Fractions and approvals' },
  { name: 'Record & Closeout', detail: 'Documents and completion' },
] as const;

const workflowLoop = [
  { label: 'Fill', detail: 'Complete the structured form' },
  { label: 'Save', detail: 'Resume the course work' },
  { label: 'Generate', detail: 'Create the clinic document' },
  { label: 'Download', detail: 'Export DOCX or XLSX' },
] as const;

const cureraysPrinciples = [
  {
    name: 'One Course Context',
    detail: 'See preparation, treatment, and closeout as one connected path.',
  },
  {
    name: 'Clear Handoffs',
    detail: 'Keep ownership, blockers, and the next action legible across teams.',
  },
  {
    name: 'Document Continuity',
    detail: 'Build clinic documents from the structured work used to advance the course.',
  },
] as const;

export default function LoginPage() {
  return (
    <main className="landing-page">
      <div className="landing-page-frame">
        <header className="landing-topbar">
          <a className="landing-brand clinical-focus" href="#top" aria-label="CureRays home">
            <Image
              src="/System_Logo.svg"
              alt=""
              width={44}
              height={44}
              priority
              className="landing-logo"
            />
            <span className="landing-brand-copy">
              <strong>CureRays</strong>
              <span>Clinical Workflow System</span>
            </span>
          </a>

          <nav className="landing-nav" aria-label="Landing page">
            <a className="clinical-focus" href="#about">
              About CureRays
            </a>
            <a className="clinical-focus" href="#course">
              The Course
            </a>
            <a className="clinical-focus landing-nav-primary" href="#sign-in">
              Sign In
            </a>
          </nav>
        </header>

        <section id="top" className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-visual" aria-hidden="true">
            <span className="landing-ambient" />
            <RadiotherapyOrbitCanvasMount />
          </div>

          <div className="landing-copy">
            <div className="landing-copy-block">
              <p className="landing-kicker">CureRays Radiation Medicine</p>
              <h1 id="landing-title" className="landing-title">
                Radiation Medicine, Orchestrated Around Every Course.
              </h1>
              <p className="landing-description">
                CureRays brings preparation, treatment, records, and clinic documents into one
                coordinated operational view.
              </p>
              <p className="landing-hero-note">
                Keep the next action, owner, blocker, and supporting work visible from intake
                through closeout.
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

            <a className="landing-story-link clinical-focus" href="#about">
              Discover the CureRays approach
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div id="sign-in" className="landing-card-wrap">
            <LoginCard />
          </div>
        </section>

        <section id="about" className="landing-about" aria-labelledby="about-title">
          <div className="landing-about-media">
            <Image
              src="/curerays-treatment-geometry.png"
              alt="Abstract precision treatment geometry in a luminous clinical space"
              width={1717}
              height={916}
              sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1440px) 48vw, 696px"
              className="landing-about-image"
            />
            <div className="landing-about-caption">
              <span>Precision Needs Context</span>
              <p>One operational view for the work surrounding every course.</p>
            </div>
          </div>

          <div className="landing-about-copy">
            <div className="landing-section-heading">
              <p>About CureRays</p>
              <h2 id="about-title">Clinical Focus. Operational Clarity.</h2>
              <p className="landing-section-description">
                At CureRays, every patient course depends on coordinated preparation, treatment,
                documentation, and review. CRMS gives that work one shared operational home.
              </p>
            </div>

            <dl className="landing-principles">
              {cureraysPrinciples.map((principle, index) => (
                <div key={principle.name}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <dt>{principle.name}</dt>
                  <dd>{principle.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="course" className="landing-proof" aria-labelledby="workflow-loop-title">
          <div className="landing-section-heading">
            <p>The Course</p>
            <h2 id="workflow-loop-title">From Structured Work to Clinic Documents</h2>
            <p className="landing-section-description">
              Complete the work once, keep its context with the course, and carry it forward into
              the clinic document.
            </p>
          </div>
          <ol className="landing-proof-flow">
            {workflowLoop.map((step, index) => (
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
            <p className="landing-section-description">
              The workspace is organized around the decisions that move a patient course forward.
            </p>
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

        <aside className="landing-boundary" aria-labelledby="demo-boundary-title">
          <div>
            <p>Demo Access</p>
            <h2 id="demo-boundary-title">A Controlled Staff Demonstration</h2>
          </div>
          <p>
            This demonstration does not create or verify an identity. Use sample or de-identified
            data only. Prototype calculations are not clinical guidance.
          </p>
          <a className="clinical-focus" href="#sign-in">
            Open the Demo
          </a>
        </aside>

        <footer className="landing-footer">
          <span>CureRays Radiation Medicine</span>
          <span>Clinical Workflow System</span>
          <span>Demo Environment</span>
        </footer>
      </div>
    </main>
  );
}
