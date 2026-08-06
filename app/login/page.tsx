import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LoginCard } from '@/components/login/login-card';
import { RadiotherapyOrbitCanvasMount } from '@/components/login/radiotherapy-orbit-canvas-loader';

export const metadata: Metadata = {
  title: 'Staff Sign In',
  description: 'Sign in to the CureRays Clinical Workflow System.'
};

/**
 * Sign-in only. The public marketing surface lives at `/` under app/(site)/ —
 * this page carries no product marketing so the two never drift apart.
 */
export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-visual" aria-hidden="true">
        <span className="login-ambient" />
        <RadiotherapyOrbitCanvasMount />
      </div>

      <div className="login-panel">
        <Link className="login-brand clinical-focus" href="/">
          <Image
            src="/System_Logo.svg"
            alt=""
            width={40}
            height={40}
            priority
            className="login-logo"
          />
          <span className="login-brand-copy">
            <strong>CureRays</strong>
            <span>Clinical Workflow System</span>
          </span>
        </Link>

        <LoginCard />

        <p className="login-boundary">
          Staff access is verified through assigned pilot accounts. Use sample or de-identified
          data only. Prototype calculations are not clinical guidance.
        </p>

        <Link className="login-back clinical-focus" href="/">
          <span aria-hidden="true">←</span>
          Back To CureRays
        </Link>
      </div>
    </main>
  );
}
