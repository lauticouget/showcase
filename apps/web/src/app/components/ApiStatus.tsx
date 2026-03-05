'use client';

import { useQuery } from '@apollo/client/react';
import { HEALTH_QUERY, type HealthQuery } from '@/lib/graphql/operations';

export default function ApiStatus() {
  const { data, loading, error } = useQuery<HealthQuery>(HEALTH_QUERY);

  const isConnected = !loading && !error && data?.health === 'OK';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full transition-colors duration-500 ${
          loading
            ? 'bg-text-tertiary animate-pulse'
            : isConnected
              ? 'bg-code-text'
              : 'bg-accent-primary'
        }`}
      />
      <span className="text-xs text-text-secondary">
        API:{' '}
        {loading ? 'Checking...' : isConnected ? 'Connected' : 'Unreachable'}
      </span>
    </div>
  );
}
