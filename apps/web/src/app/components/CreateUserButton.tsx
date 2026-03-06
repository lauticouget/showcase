'use client';

import { useState } from 'react';

import { useUser } from '@/lib/context/UserContext';
import { CreateUserModal } from './CreateUserModal';
import { LoginModal } from './LoginModal';

export function CreateUserButton() {
  const { user } = useUser();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <section className="mx-auto max-w-5xl px-6 py-8 text-center">
      {user ? (
        <p className="text-sm text-text-secondary">
          Welcome back,{' '}
          <span className="font-medium text-text-primary">{user.name}</span>.
        </p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Try the API
          </h2>
          <p className="text-sm text-text-secondary">
            Create a profile to interact with the live GraphQL backend.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSignupOpen(true)}
              className="rounded-md bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Create Account
            </button>
            <button
              onClick={() => setLoginOpen(true)}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Log in
            </button>
          </div>
        </div>
      )}

      <CreateUserModal open={signupOpen} onClose={() => setSignupOpen(false)} />
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onCreateAccount={() => { setLoginOpen(false); setSignupOpen(true); }}
      />
    </section>
  );
}
