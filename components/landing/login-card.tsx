'use client';

import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const submissionPending = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionPending.current) return;

    submissionPending.current = true;
    setPending(true);
    setError(false);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: form.get('accountId'),
          password: form.get('password'),
        }),
      });

      if (!response.ok) {
        setError(true);
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError(true);
    } finally {
      submissionPending.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="landing-login-card">
      <div className="landing-login-copy">
        <p className="landing-login-kicker">Staff Pilot Access</p>
        <h2>Open CureRays CRMS</h2>
        <p className="landing-login-subtitle">
          Enter your assigned pilot account ID and password.
        </p>
      </div>

      <div className="landing-login-fields">
        <label className="landing-field-label" htmlFor="accountId">
          Account ID
          <span className="landing-input-wrap">
            <Mail className="landing-input-icon" aria-hidden="true" />
            <Input
              id="accountId"
              name="accountId"
              type="text"
              autoComplete="username"
              className="landing-input"
              placeholder="Enter your account ID"
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="landing-input landing-password-input"
              placeholder="Enter your password"
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

      <Button type="submit" className="landing-submit" disabled={pending}>
        {pending ? 'Signing In' : 'Sign In'}
      </Button>

      <p className="landing-secure-note" role={error ? 'alert' : undefined}>
        <ShieldCheck aria-hidden="true" />
        <span>
          {error
            ? 'Sign-in failed. Check your account ID and password.'
            : 'Signed staff access. Use sample or de-identified data only.'}
        </span>
      </p>
    </form>
  );
}
