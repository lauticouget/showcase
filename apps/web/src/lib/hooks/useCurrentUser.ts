'use client';

import { useApolloClient, useQuery } from '@apollo/client/react';

import { ME_QUERY, type MeQuery } from '@/lib/graphql/operations';

export function useCurrentUser() {
  const apolloClient = useApolloClient();
  const { data, refetch } = useQuery<MeQuery>(ME_QUERY);

  /** Called after a successful login to refresh Apollo's cache. */
  async function login() {
    await apolloClient.resetStore();
  }

  /** Clears the httpOnly cookie via route handler, then wipes the Apollo cache. */
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await apolloClient.resetStore();
  }

  const user = data?.me ?? null;

  return {
    user,
    userId: user?.userId ?? null,
    login,
    logout,
    refetch,
  };
}
