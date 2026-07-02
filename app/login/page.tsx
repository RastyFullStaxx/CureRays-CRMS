import Image from 'next/image';
import { LoginCard } from '@/components/landing/login-card';
import { RadiotherapyOrbitCanvasMount } from '@/components/landing/radiotherapy-orbit-canvas-loader';

export default function LoginPage() {
  return (
    <main className="landing-page">
      <span className="landing-ambient" aria-hidden="true" />
      <RadiotherapyOrbitCanvasMount />
      <section className="landing-shell" aria-labelledby="login-title">
        <div className="landing-copy">
          <Image
            src="/System_Logo_Landscape.png"
            alt="CureRays"
            width={440}
            height={116}
            priority
            className="landing-logo"
          />
          <div className="landing-copy-block">
            <h1 id="login-title" className="landing-title">
              Clinical workspace with Mac-level clarity.
            </h1>
            <p className="landing-description">
              Review patient-course operations, treatment readiness, documents, and risk signals in one calm CureRays command surface.
            </p>
            <ul className="landing-trust-list" aria-label="Workspace Assurances">
              <li className="landing-trust-item mac-glass-surface">Local demo data</li>
              <li className="landing-trust-item mac-glass-surface">OPS / PHI split</li>
              <li className="landing-trust-item mac-glass-surface">Dashboard first</li>
            </ul>
          </div>
        </div>

        <div className="landing-card-wrap">
          <LoginCard />
        </div>
      </section>
    </main>
  );
}
