'use client';

import { useState } from 'react';

import { useMutation } from '@apollo/client/react';

import { useUser } from '@/lib/context/UserContext';
import {
  CREATE_USER_MUTATION,
  LIST_USERS_QUERY,
  type CreateUserMutation,
  type CreateUserMutationVariables,
} from '@/lib/graphql/operations';
import { Modal } from './Modal';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  form?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [createUser, { loading }] = useMutation<
    CreateUserMutation,
    CreateUserMutationVariables
  >(CREATE_USER_MUTATION, {
    refetchQueries: [{ query: LIST_USERS_QUERY, variables: { limit: 10 } }],
  });

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = 'Name must be at least 2 characters.';
    if (!email.trim() || !EMAIL_RE.test(email))
      e.email = 'Enter a valid email address.';
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
    try {
      const result = await createUser({
        variables: { input: { name: name.trim(), email: email.trim() } },
      });
      const created = result.data?.createUser;
      if (created) {
        login({ userId: created.userId, name: created.name, email: created.email });
        handleClose();
      }
    } catch (err: unknown) {
      const gqlErr = (err as { graphQLErrors?: { extensions?: { code?: string }; message?: string }[] })
        ?.graphQLErrors?.[0];
      if (gqlErr?.extensions?.code === 'BAD_USER_INPUT') {
        setErrors({ email: gqlErr.message ?? 'Email already in use.' });
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' });
      }
    }
  }

  function handleClose() {
    setName('');
    setEmail('');
    setErrors({});
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Account">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-text-secondary">
            Name
          </label>
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
          {errors.email && (
            <p className="mt-1 text-xs text-accent-primary">{errors.email}</p>
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
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
