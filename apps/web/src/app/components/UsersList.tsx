'use client';

import { useQuery } from '@apollo/client/react';

import {
  LIST_USERS_QUERY,
  type ListUsersQuery,
  type ListUsersQueryVariables,
} from '@/lib/graphql/operations';

function daysAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-sm font-semibold text-text-secondary border border-border">
      {letters}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-secondary p-4 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-bg-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-bg-tertiary" />
        <div className="h-3 w-1/2 rounded bg-bg-tertiary" />
      </div>
    </div>
  );
}

export function UsersList() {
  const { data, loading, fetchMore, refetch } = useQuery<
    ListUsersQuery,
    ListUsersQueryVariables
  >(LIST_USERS_QUERY, {
    variables: { limit: 10, cursor: null },
  });

  const users = data?.listUsers?.items ?? [];
  const nextCursor = data?.listUsers?.nextCursor ?? null;

  function loadMore() {
    fetchMore({
      variables: { limit: 10, cursor: nextCursor ?? null },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          listUsers: {
            items: [
              ...prev.listUsers.items,
              ...fetchMoreResult.listUsers.items,
            ],
            nextCursor: fetchMoreResult.listUsers.nextCursor,
          },
        };
      },
    });
  }

  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Community</h2>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="rounded-md p-1.5 text-text-tertiary transition-colors hover:text-text-primary disabled:opacity-40"
          aria-label="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {loading && users.length === 0 ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          No users yet. Be the first to create an account.
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-4 rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:border-border-accent/40"
            >
              <Initials name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user.name}
                </p>
                <p className="truncate text-xs text-text-tertiary">
                  {user.email}
                </p>
              </div>
              <span className="shrink-0 text-xs text-text-tertiary">
                Joined {daysAgo(user.createdAt)}
              </span>
            </div>
          ))}

          {nextCursor && (
            <div className="pt-2 text-center">
              <button
                onClick={loadMore}
                className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent-tertiary hover:text-text-primary"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
