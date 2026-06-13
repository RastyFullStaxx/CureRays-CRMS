import Image from "next/image";
import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { LoginCard } from "@/components/landing/login-card";
import { RadiotherapyOrbitCanvasMount } from "@/components/landing/radiotherapy-orbit-canvas-loader";

const trustItems = [
  { label: "HIPAA Compliant", icon: ShieldCheck },
  { label: "Secure", icon: LockKeyhole },
  { label: "Authorized Staff Only", icon: UserCheck }
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-ambient" aria-hidden="true" />
      <RadiotherapyOrbitCanvasMount />

      <section className="landing-shell" aria-labelledby="landing-title">
        <div className="landing-copy">
          <Image
            src="/System_Logo.svg"
            alt="CureRays"
            width={320}
            height={107}
            priority
            className="landing-logo"
          />

          <div className="landing-copy-block">
            <h1 id="landing-title" className="landing-title">
              Workflow System
            </h1>
          </div>

          <ul className="landing-trust-list" aria-label="Security and access commitments">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="clinical-pill clinical-pill-default landing-trust-item">
                  <span className="landing-trust-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="landing-card-wrap">
          <LoginCard />
        </div>
      </section>
    </main>
  );
}
