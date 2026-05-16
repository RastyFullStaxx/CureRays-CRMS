import Image from "next/image";
import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { BrandWaveBackground } from "@/components/landing/brand-wave-background";
import { LoginCard } from "@/components/landing/login-card";

const trustItems = [
  { label: "HIPAA Compliant", icon: ShieldCheck },
  { label: "Secure", icon: LockKeyhole },
  { label: "Authorized Staff Only", icon: UserCheck }
];

const landingCriticalCss = `
.landing-page {
  background: #ffffff;
  color: #061a55;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

.landing-shell {
  align-items: center;
  display: grid;
  gap: clamp(2.5rem, 6vw, 5rem);
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  margin: 0 auto;
  max-width: 80rem;
  min-height: 100vh;
  padding: clamp(2.5rem, 5vw, 4rem);
  position: relative;
  width: 100%;
  z-index: 1;
}

.landing-copy {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  max-width: 42rem;
  min-width: 0;
  text-align: left;
}

.landing-logo {
  height: auto;
  width: clamp(218px, 20vw, 280px);
}

.landing-copy-block {
  margin-top: clamp(3.5rem, 7vw, 4.5rem);
  max-width: 35rem;
}

.landing-title {
  color: #061a55;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.12;
  margin: 0;
  text-wrap: balance;
}

.landing-accent {
  background: #ff6620;
  border-radius: 999px;
  height: 4px;
  margin-top: 1.75rem;
  width: 48px;
}

.landing-description {
  color: rgba(43, 47, 95, 0.82);
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.75;
  margin: 1.75rem 0 0;
  max-width: 35rem;
}

.landing-trust-list {
  align-items: center;
  color: rgba(43, 47, 95, 0.76);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.875rem;
  font-weight: 700;
  gap: 0.75rem 1.25rem;
  list-style: none;
  margin: 3rem 0 0;
  padding: 0;
}

.landing-trust-item {
  align-items: center;
  display: flex;
  gap: 0.75rem;
}

.landing-trust-dot {
  background: rgba(43, 47, 95, 0.48);
  border-radius: 999px;
  display: block;
  height: 4px;
  width: 4px;
}

.landing-trust-icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #dde6f5;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(43, 47, 95, 0.06);
  color: #0033a0;
  display: grid;
  height: 36px;
  justify-items: center;
  place-items: center;
  width: 36px;
}

.landing-trust-icon svg {
  height: 16px;
  width: 16px;
}

.landing-card-wrap {
  max-width: 520px;
  min-width: 0;
  width: 100%;
}

.landing-login-card {
  background: #ffffff;
  border: 1px solid #dde6f5;
  border-radius: 8px;
  box-shadow: 0 16px 40px rgba(43, 47, 95, 0.08);
  box-sizing: border-box;
  color: #061a55;
  padding: clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3.2vw, 2.5rem);
  width: 100%;
}

.landing-login-card h2 {
  color: #061a55;
  font-size: clamp(2.25rem, 4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 0;
}

.landing-login-card p {
  color: rgba(61, 90, 128, 0.78);
}

.landing-login-subtitle {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.7;
  margin: 1rem 0 0;
}

.landing-login-fields {
  display: grid;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.landing-field-label {
  color: #061a55;
  display: grid;
  font-size: 0.875rem;
  font-weight: 800;
  gap: 0.5rem;
}

.landing-input-wrap {
  display: block;
  position: relative;
}

.landing-input-icon,
.landing-password-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.landing-input-icon {
  color: rgba(43, 47, 95, 0.58);
  height: 20px;
  left: 1rem;
  pointer-events: none;
  width: 20px;
}

.landing-input {
  background: #ffffff;
  border: 1px solid #dde6f5;
  border-radius: 8px;
  box-sizing: border-box;
  color: #061a55;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  min-height: 52px;
  outline: none;
  padding: 0.75rem 1rem 0.75rem 3rem;
  width: 100%;
}

.landing-password-input {
  padding-left: 3rem;
  padding-right: 3rem;
}

.landing-input::placeholder {
  color: rgba(61, 90, 128, 0.48);
}

.landing-input:focus {
  border-color: #0033a0;
  box-shadow: 0 0 0 4px rgba(0, 51, 160, 0.1);
}

.landing-password-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 999px;
  color: rgba(43, 47, 95, 0.64);
  cursor: pointer;
  display: grid;
  height: 36px;
  place-items: center;
  right: 0.75rem;
  width: 36px;
}

.landing-password-toggle svg {
  height: 20px;
  width: 20px;
}

.landing-password-toggle:hover,
.landing-password-toggle:focus {
  background: #f5f7fb;
  color: #0033a0;
  outline: none;
}

.landing-submit {
  background: #0033a0;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 10px 22px rgba(0, 51, 160, 0.18);
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
  margin-top: 2rem;
  min-height: 52px;
  padding: 0.75rem 1.25rem;
  width: 100%;
}

.landing-submit:hover,
.landing-submit:focus {
  background: #082f86;
  outline: none;
}

.landing-divider {
  align-items: center;
  color: rgba(61, 90, 128, 0.62);
  display: grid;
  font-size: 0.75rem;
  font-weight: 800;
  gap: 1rem;
  grid-template-columns: 1fr auto 1fr;
  margin: 2rem 0;
}

.landing-divider-line {
  background: #dde6f5;
  height: 1px;
}

.landing-forgot-button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: #0033a0;
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 800;
  gap: 0.5rem;
  margin: 0 auto;
  padding: 0.5rem 0.75rem;
}

.landing-forgot-button svg {
  height: 16px;
  width: 16px;
}

.landing-secure-note {
  align-items: center;
  color: rgba(61, 90, 128, 0.66);
  display: flex;
  font-size: 0.875rem;
  font-weight: 600;
  gap: 0.75rem;
  justify-content: center;
  line-height: 1.5;
  margin: 2rem 0 0;
  text-align: center;
}

.landing-secure-note svg {
  color: rgba(43, 47, 95, 0.46);
  flex: 0 0 auto;
  height: 16px;
  width: 16px;
}

.brand-wave-background {
  background: #ffffff;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}

.wave-layer {
  bottom: -2px;
  height: 47vh;
  left: -7vw;
  min-height: 260px;
  position: absolute;
  width: 114vw;
  will-change: transform;
}

.wave-layer-blue {
  animation: wave-drift-a 26s ease-in-out infinite alternate;
  bottom: -5vh;
}

.wave-layer-light {
  animation: wave-drift-b 32s ease-in-out infinite alternate;
  bottom: -1vh;
}

.wave-layer-orange {
  animation: wave-drift-c 22s ease-in-out infinite alternate;
  bottom: 1vh;
}

.wave-layer-contours {
  animation: wave-drift-d 30s ease-in-out infinite alternate;
  bottom: -3vh;
  height: 58vh;
  opacity: 0.9;
}

@keyframes wave-drift-a {
  from { transform: translate3d(-2%, 1%, 0) scale(1.02); }
  to { transform: translate3d(2%, -2%, 0) scale(1.045); }
}

@keyframes wave-drift-b {
  from { transform: translate3d(2%, -1%, 0) scale(1.01); }
  to { transform: translate3d(-2%, 1.5%, 0) scale(1.035); }
}

@keyframes wave-drift-c {
  from { transform: translate3d(-1%, -1%, 0) scale(1.01); }
  to { transform: translate3d(2.5%, 1%, 0) scale(1.03); }
}

@keyframes wave-drift-d {
  from { transform: translate3d(1%, 0, 0) scale(1.01); }
  to { transform: translate3d(-1.5%, -1%, 0) scale(1.02); }
}

@media (max-width: 1023px) {
  .landing-shell {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 2.5rem 1.5rem 4rem;
  }

  .landing-copy {
    align-items: center;
    text-align: center;
  }

  .landing-accent {
    margin-left: auto;
    margin-right: auto;
  }

  .landing-trust-list {
    justify-content: center;
  }

  .landing-trust-dot {
    display: none;
  }

  .wave-layer {
    height: 38vh;
    left: -18vw;
    min-height: 220px;
    width: 136vw;
  }

  .wave-layer-contours {
    height: 44vh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave-layer {
    animation: none;
    transform: none;
  }
}
`;

export default function LandingPage() {
  return (
    <main className="landing-page relative isolate min-h-screen overflow-hidden bg-white text-[#061A55]">
      <style dangerouslySetInnerHTML={{ __html: landingCriticalCss }} />
      <BrandWaveBackground />

      <section className="landing-shell relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-12 xl:gap-20">
        <div className="landing-copy mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
          <Image
            src="/System_Logo.svg"
            alt="CureRays"
            width={320}
            height={107}
            priority
            className="landing-logo h-auto w-[218px] sm:w-[280px]"
          />

          <div className="landing-copy-block mt-14 max-w-xl sm:mt-16 lg:mt-[72px]">
            <h1 className="landing-title text-balance text-4xl font-bold leading-tight tracking-normal text-[#061A55] sm:text-5xl lg:text-[56px]">
              CureRays Clinical Workflow System
            </h1>
            <div className="landing-accent mx-auto mt-7 h-1 w-12 rounded-full bg-[#FF6620] lg:mx-0" />
            <p className="landing-description mt-7 max-w-[560px] text-base font-semibold leading-8 text-[#2B2F5F]/82 sm:text-lg">
              Securely manage treatment workflows, documentation, audit readiness,
              and administrative tools from one centralized dashboard.
            </p>
          </div>

          <ul className="landing-trust-list mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-bold text-[#2B2F5F]/76 lg:justify-start">
            {trustItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="landing-trust-item flex items-center gap-3">
                  {index > 0 ? (
                    <span className="landing-trust-dot hidden h-1 w-1 rounded-full bg-[#2B2F5F]/48 sm:block" aria-hidden="true" />
                  ) : null}
                  <span className="landing-trust-icon grid h-9 w-9 place-items-center rounded-full border border-[#DDE6F5] bg-white/84 text-[#0033A0] shadow-[0_10px_24px_rgba(43,47,95,0.06)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="landing-card-wrap mx-auto w-full max-w-[520px] lg:mx-0">
          <LoginCard />
        </div>
      </section>
    </main>
  );
}
