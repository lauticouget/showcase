'use client';

import { useState } from 'react';

import { useApolloClient } from '@apollo/client/react';

import {
  GET_USER_QUERY,
  type GetUserQuery,
  type GetUserQueryVariables,
} from '@/lib/graphql/operations';

const STORAGE_KEY = 'showcase_user';

export type StoredUser = { userId: string; name: string; email: string };

function readStorage(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const apolloClient = useApolloClient();
  const [user, setUser] = useState<StoredUser | null>(readStorage);

  function login(u: StoredUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  async function refetch() {
    if (!user?.userId) return;
    try {
      const result = await apolloClient.query<GetUserQuery, GetUserQueryVariables>({
        query: GET_USER_QUERY,
        variables: { userId: user.userId },
        fetchPolicy: 'network-only',
      });
      const fresh = result.data?.getUser;
      if (fresh) login({ userId: fresh.userId, name: fresh.name, email: fresh.email });
    } catch {
      // silently ignore — stale data is acceptable
    }
  }

  return {
    user,
    userId: user?.userId ?? null,
    login,
    logout,
    refetch,
  };
}
