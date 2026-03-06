'use client';

import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const keyDownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', keyDownListener);
    return () => document.removeEventListener('keydown', keyDownListener);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-bg-secondary p-6 shadow-xl">
        <h2 className="mb-6 text-lg font-semibold text-text-primary">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
