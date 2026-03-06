'use client';

import { useEffect, useState } from 'react';

import { useMutation } from '@apollo/client/react';

import { useUser } from '@/lib/context/UserContext';
import {
  DELETE_USER_MUTATION,
  LIST_USERS_QUERY,
  UPDATE_USER_MUTATION,
  type DeleteUserMutation,
  type DeleteUserMutationVariables,
  type UpdateUserMutation,
  type UpdateUserMutationVariables,
} from '@/lib/graphql/operations';
import { Modal } from './Modal';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user, userId, logout, refetch } = useUser();
  const [name, setName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const [updateUser, { loading: updating }] = useMutation<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >(UPDATE_USER_MUTATION, {
    refetchQueries: [{ query: LIST_USERS_QUERY, variables: { limit: 10 } }],
  });

  const [deleteUser, { loading: deleting }] = useMutation<
    DeleteUserMutation,
    DeleteUserMutationVariables
  >(DELETE_USER_MUTATION, {
    refetchQueries: [{ query: LIST_USERS_QUERY, variables: { limit: 10 } }],
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !name.trim() || name.trim() === user?.name) return;
    try {
      await updateUser({ variables: { userId, input: { name: name.trim() } } });
      await refetch();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }

  async function handleDelete() {
    if (!userId) return;
    try {
      await deleteUser({ variables: { userId } });
      logout();
      onClose();
    } catch {
      setConfirmDelete(false);
    }
  }

  function handleClose() {
    setConfirmDelete(false);
    setSaveStatus('idle');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Account Settings">
      <div className="space-y-6">
        {/* Update section */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-tertiary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full cursor-not-allowed rounded border border-border bg-bg-primary px-3 py-2 text-sm text-text-tertiary outline-none"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Email cannot be changed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saveStatus === 'saved' && (
              <span className="text-xs text-code-text">Saved!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-accent-primary">
                Failed to save.
              </span>
            )}
            <button
              type="submit"
              disabled={updating || !name.trim() || name.trim() === user?.name}
              className="rounded-md bg-bg-tertiary border border-border px-4 py-2 text-sm text-text-primary transition-colors hover:border-accent-tertiary disabled:opacity-40"
            >
              {updating ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger zone */}
        <div className="rounded-md border border-accent-primary/30 bg-accent-primary/5 p-4">
          <p className="mb-3 text-xs font-medium text-accent-primary">
            Danger Zone
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded border border-accent-primary px-3 py-1.5 text-xs text-accent-primary transition-colors hover:bg-accent-primary hover:text-white"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-text-secondary">
                This is irreversible. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded bg-accent-primary px-3 py-1.5 text-xs text-white transition-opacity disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
