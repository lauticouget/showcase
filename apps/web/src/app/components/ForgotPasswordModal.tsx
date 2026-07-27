'use client';

import { useState } from 'react';

import { Modal } from './Modal';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({
  open,
  onClose,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always advance — never leak whether the email exists
      setStep('reset');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || newPassword.length < 8) {
      setError('Enter the code and a password of at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Reset failed. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setError('');
    setDone(false);
    onClose();
  }

  if (done) {
    return (
      <Modal open={open} onClose={handleClose} title="Password reset">
        <p className="text-sm text-text-secondary">
          Your password has been reset. You can now log in with your new
          password.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Log in
          </button>
        </div>
      </Modal>
    );
  }

  if (step === 'email') {
    return (
      <Modal open={open} onClose={handleClose} title="Reset password">
        <form onSubmit={handleRequestCode} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Enter your email and we&apos;ll send a reset code.
          </p>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
            />
          </div>
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
              disabled={loading || !email.trim()}
              className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Enter reset code">
      <form onSubmit={handleResetPassword} className="space-y-4">
        <p className="text-sm text-text-secondary">
          Check your email for the code.
        </p>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-secondary">
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
          />
        </div>
        {error && <p className="text-xs text-accent-primary">{error}</p>}
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
            className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
