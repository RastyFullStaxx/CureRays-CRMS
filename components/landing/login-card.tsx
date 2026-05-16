"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export function LoginCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: Replace this placeholder route with real authentication and session validation.
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#DDE6F5] bg-white px-6 py-8 shadow-[0_16px_40px_rgba(43,47,95,0.08)] sm:px-10 sm:py-12"
    >
      <div>
        <h2 className="text-4xl font-bold tracking-normal text-[#061A55] sm:text-[44px]">
          Welcome back
        </h2>
        <p className="mt-4 text-base font-semibold leading-7 text-[#3D5A80]/78">
          Sign in to access the CureRays Admin Dashboard
        </p>
      </div>

      <div className="mt-10 grid gap-6">
        <label className="grid gap-2 text-sm font-bold text-[#061A55]" htmlFor="email">
          Email address
          <span className="relative block">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2B2F5F]/58"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="h-[52px] min-h-[52px] w-full rounded-lg border border-[#DDE6F5] bg-white px-4 py-3 pl-12 text-base font-semibold text-[#061A55] outline-none transition placeholder:text-[#3D5A80]/48 focus:border-[#0033A0] focus:ring-4 focus:ring-[#0033A0]/10"
              placeholder="Enter your email"
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#061A55]" htmlFor="password">
          Password
          <span className="relative block">
            <LockKeyhole
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2B2F5F]/58"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-[52px] min-h-[52px] w-full rounded-lg border border-[#DDE6F5] bg-white px-12 py-3 text-base font-semibold text-[#061A55] outline-none transition placeholder:text-[#3D5A80]/48 focus:border-[#0033A0] focus:ring-4 focus:ring-[#0033A0]/10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#2B2F5F]/64 transition hover:bg-[#F5F7FB] hover:text-[#0033A0] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/12"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="mt-8 h-[52px] min-h-[52px] w-full rounded-lg bg-[#0033A0] px-5 py-3 text-base font-bold text-white shadow-[0_10px_22px_rgba(0,51,160,0.18)] transition hover:bg-[#082F86] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/20"
      >
        Sign In
      </button>

      <div className="my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-bold text-[#3D5A80]/62">
        <span className="h-px bg-[#DDE6F5]" />
        <span>or</span>
        <span className="h-px bg-[#DDE6F5]" />
      </div>

      <button
        type="button"
        className="mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#0033A0] transition hover:bg-[#F5F7FB] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/12"
      >
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        Forgot password?
      </button>

      <p className="mt-8 flex items-center justify-center gap-3 text-center text-sm font-semibold leading-6 text-[#3D5A80]/66">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#2B2F5F]/46" aria-hidden="true" />
        <span>Secure access for authorized clinical staff only.</span>
      </p>
    </form>
  );
}
