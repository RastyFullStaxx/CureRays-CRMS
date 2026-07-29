'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push('/dashboard');
  }

  return (
    <form action="/dashboard" onSubmit={handleSubmit} className="landing-login-card">
      <div className="landing-login-copy">
        <p className="landing-login-kicker">Pilot Workspace</p>
        <h2>Enter CureRays CRMS</h2>
        <p className="landing-login-subtitle">
          Demo mode accepts any valid email and a password of at least six characters.
        </p>
      </div>

      <div className="landing-login-fields">
        <label className="landing-field-label" htmlFor="email">
          Email Address
          <span className="landing-input-wrap">
            <Mail className="landing-input-icon" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="landing-input"
              placeholder="name@curerays.com"
              required
            />
          </span>
        </label>

        <div className="landing-field-label">
          <label htmlFor="password">Password</label>
          <span className="landing-input-wrap">
            <LockKeyhole className="landing-input-icon" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="landing-input landing-password-input"
              placeholder="Enter at least six characters"
              minLength={6}
              required
            />
            <button
              type="button"
              className="clinical-focus landing-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </span>
        </div>
      </div>

      <Button type="submit" className="landing-submit">
        Enter Pilot Workspace
      </Button>

      <p className="landing-secure-note">
        <ShieldCheck aria-hidden="true" />
        <span>Synthetic data only. No identity is authenticated in demo mode.</span>
      </p>
    </form>
  );
}
