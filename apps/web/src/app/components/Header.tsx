'use client';

import { useEffect, useRef, useState } from 'react';

import { useUser } from '@/lib/context/UserContext';
import ApiStatus from './ApiStatus';
import { LoginModal } from './LoginModal';
import { CreateUserModal } from './CreateUserModal';
import { SettingsModal } from './SettingsModal';

export function Header() {
  const { user, logout } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-sm">
        <div className="mx-auto grid h-14 max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-6">
          <span className="font-mono text-sm font-semibold tracking-widest text-text-secondary uppercase">
            showcase
          </span>

          <div className="flex justify-center px-6">
            <ApiStatus />
          </div>

          <div className="flex items-center justify-end gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full border border-border bg-bg-tertiary px-3 py-1 transition-colors hover:border-accent-primary"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-text-primary">{user.name}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 rounded-md border border-border bg-bg-secondary py-1 shadow-lg">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-md p-1.5 text-text-tertiary transition-colors hover:text-text-primary"
                  aria-label="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="rounded-md px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onCreateAccount={() => setSignupOpen(true)}
      />
      <CreateUserModal open={signupOpen} onClose={() => setSignupOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
