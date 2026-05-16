import Image from "next/image";
import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { BrandWaveBackground } from "@/components/landing/brand-wave-background";
import { LoginCard } from "@/components/landing/login-card";

const trustItems = [
  { label: "HIPAA Compliant", icon: ShieldCheck },
  { label: "Secure", icon: LockKeyhole },
  { label: "Authorized Staff Only", icon: UserCheck }
];

export default function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-white text-[#061A55]">
      <BrandWaveBackground />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-12 xl:gap-20">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
          <Image
            src="/System_Logo.svg"
            alt="CureRays"
            width={320}
            height={107}
            priority
            className="h-auto w-[218px] sm:w-[280px]"
          />

          <div className="mt-14 max-w-xl sm:mt-16 lg:mt-[72px]">
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-normal text-[#061A55] sm:text-5xl lg:text-[56px]">
              CureRays Clinical Workflow System
            </h1>
            <div className="mx-auto mt-7 h-1 w-12 rounded-full bg-[#FF6620] lg:mx-0" />
            <p className="mt-7 max-w-[560px] text-base font-semibold leading-8 text-[#2B2F5F]/82 sm:text-lg">
              Securely manage treatment workflows, documentation, audit readiness,
              and administrative tools from one centralized dashboard.
            </p>
          </div>

          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-bold text-[#2B2F5F]/76 lg:justify-start">
            {trustItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <li key={item.label} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span className="hidden h-1 w-1 rounded-full bg-[#2B2F5F]/48 sm:block" aria-hidden="true" />
                  ) : null}
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-[#DDE6F5] bg-white/84 text-[#0033A0] shadow-[0_10px_24px_rgba(43,47,95,0.06)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[520px] lg:mx-0">
          <LoginCard />
        </div>
      </section>
    </main>
  );
}
