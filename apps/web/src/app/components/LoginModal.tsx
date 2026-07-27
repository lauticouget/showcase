'use client';

import { useState } from 'react';

import { useUser } from '@/lib/context/UserContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { Modal } from './Modal';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
}

export function LoginModal({ open, onClose, onCreateAccount }: LoginModalProps) {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Invalid email or password.');
        return;
      }
      await login();
      handleClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  }

  function handleCreateAccount() {
    handleClose();
    onCreateAccount();
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Log In">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-tertiary"
            />
          </div>

          {error && <p className="text-xs text-accent-primary">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleCreateAccount}
                className="text-left text-xs text-text-tertiary transition-colors hover:text-text-secondary"
              >
                No account? Create one
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setForgotOpen(true);
                }}
                className="text-left text-xs text-text-tertiary transition-colors hover:text-text-secondary"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            >
              {loading && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </div>
        </form>
      </Modal>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
