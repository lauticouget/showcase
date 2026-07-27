'use client';

import { useState } from 'react';

import { Modal } from './Modal';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = 'Name must be at least 2 characters.';
    if (!email.trim() || !EMAIL_RE.test(email))
      e.email = 'Enter a valid email address.';
    if (password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const json = (await res.json()) as {
        requiresConfirmation?: boolean;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 409)
          setErrors({ email: json.error ?? 'Email already in use.' });
        else setErrors({ form: json.error ?? 'Sign up failed.' });
        return;
      }
      setConfirmed(true);
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});
    setConfirmed(false);
    onClose();
  }

  if (confirmed) {
    return (
      <Modal open={open} onClose={handleClose} title="Check your email">
        <p className="text-sm text-text-secondary">
          We sent a confirmation link to{' '}
          <span className="font-medium text-text-primary">{email}</span>. Click
          it to activate your account, then log in.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Account">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-accent-primary">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-secondary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-accent-primary">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-secondary">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-accent-primary">{errors.password}</p>
          )}
        </div>

        {errors.form && (
          <p className="text-xs text-accent-primary">{errors.form}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {loading && (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
