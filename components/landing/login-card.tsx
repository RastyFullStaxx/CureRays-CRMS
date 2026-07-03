"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="landing-login-card">
      <div className="landing-login-copy">
        <h2>Welcome Back</h2>
        <p className="landing-login-subtitle">
          Sign in to access the CureRays Admin Dashboard
        </p>
      </div>

      <div className="landing-login-fields">
        <label className="landing-field-label" htmlFor="email">
          Email address
          <span className="landing-input-wrap">
            <Mail className="landing-input-icon" aria-hidden="true" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="landing-input"
              placeholder="Enter your email"
              style={{ height: "var(--height-landing-control)" }}
            />
          </span>
        </label>

        <label className="landing-field-label" htmlFor="password">
          Password
          <span className="landing-input-wrap">
            <LockKeyhole className="landing-input-icon" aria-hidden="true" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="landing-input landing-password-input"
              placeholder="Enter your password"
              style={{ height: "var(--height-landing-control)" }}
            />
            <button
              type="button"
              className="clinical-focus landing-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </span>
        </label>
      </div>

      <Button type="submit" className="landing-submit">
        Sign In
      </Button>

      <div className="landing-divider">
        <span className="landing-divider-line" />
        <span>or</span>
        <span className="landing-divider-line" />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="landing-forgot-button"
      >
        <LockKeyhole aria-hidden="true" />
        Forgot password?
      </Button>

      <p className="landing-secure-note">
        <ShieldCheck aria-hidden="true" />
        <span>Secure access for authorized clinical staff only.</span>
      </p>
    </form>
  );
}
