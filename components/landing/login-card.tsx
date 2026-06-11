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
      className="landing-login-card rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-10 sm:py-12"
    >
      <div>
        <h2 className="text-4xl font-bold tracking-normal text-[var(--color-text)] sm:text-[44px]">
          Welcome back
        </h2>
        <p className="landing-login-subtitle mt-4 text-base font-semibold leading-7 text-[var(--color-text-muted)]">
          Sign in to access the CureRays Admin Dashboard
        </p>
      </div>

      <div className="landing-login-fields mt-10 grid gap-6">
        <label className="landing-field-label grid gap-2 text-sm font-bold text-[var(--color-text)]" htmlFor="email">
          Email address
          <span className="landing-input-wrap relative block">
            <Mail
              className="landing-input-icon pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="landing-input h-[52px] min-h-[52px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 pl-12 text-base font-semibold text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              placeholder="Enter your email"
            />
          </span>
        </label>

        <label className="landing-field-label grid gap-2 text-sm font-bold text-[var(--color-text)]" htmlFor="password">
          Password
          <span className="landing-input-wrap relative block">
            <LockKeyhole
              className="landing-input-icon pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="landing-input landing-password-input h-[52px] min-h-[52px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-12 py-3 text-base font-semibold text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="landing-password-toggle absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/12"
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
        className="landing-submit mt-8 h-[52px] min-h-[52px] w-full rounded-lg bg-[var(--color-primary)] px-5 py-3 text-base font-bold text-white shadow-[var(--shadow-card)] transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20"
      >
        Sign In
      </button>

      <div className="landing-divider my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-bold text-[var(--color-text-muted)]">
        <span className="landing-divider-line h-px bg-[var(--color-border)]" />
        <span>or</span>
        <span className="landing-divider-line h-px bg-[var(--color-border)]" />
      </div>

      <button
        type="button"
        className="landing-forgot-button mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-bg)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/12"
      >
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        Forgot password?
      </button>

      <p className="landing-secure-note mt-8 flex items-center justify-center gap-3 text-center text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
        <span>Secure access for authorized clinical staff only.</span>
      </p>
    </form>
  );
}
