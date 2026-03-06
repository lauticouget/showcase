'use client';

import { useState } from 'react';

import { useApolloClient } from '@apollo/client/react';

import { useUser } from '@/lib/context/UserContext';
import {
  GET_USER_BY_EMAIL_QUERY,
  type GetUserByEmailQuery,
  type GetUserByEmailQueryVariables,
} from '@/lib/graphql/operations';
import { Modal } from './Modal';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
}

export function LoginModal({ open, onClose, onCreateAccount }: LoginModalProps) {
  const { login } = useUser();
  const apolloClient = useApolloClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apolloClient.query<GetUserByEmailQuery, GetUserByEmailQueryVariables>({
        query: GET_USER_BY_EMAIL_QUERY,
        variables: { email: email.trim() },
        fetchPolicy: 'network-only',
      });
      const user = result.data?.getUserByEmail;
      if (user) {
        login({ userId: user.userId, name: user.name, email: user.email });
        handleClose();
      }
    } catch {
      setError('No account found with that email.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setError('');
    onClose();
  }

  function handleCreateAccount() {
    handleClose();
    onCreateAccount();
  }

  return (
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

        {error && <p className="text-xs text-accent-primary">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="text-xs text-text-tertiary transition-colors hover:text-text-secondary"
          >
            No account? Create one
          </button>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
