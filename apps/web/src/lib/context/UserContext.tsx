'use client';

import { createContext, useContext } from 'react';

import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

type UserContextValue = ReturnType<typeof useCurrentUser>;

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: React.PropsWithChildren) {
  const value = useCurrentUser();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
