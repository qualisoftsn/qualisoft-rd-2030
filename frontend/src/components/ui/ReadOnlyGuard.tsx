/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { Lock, Eye } from 'lucide-react';

interface ReadOnlyGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ReadOnlyGuard({ children, fallback }: ReadOnlyGuardProps) {
  const { isReadOnly } = useTrialStatus();

  if (isReadOnly) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center rounded-lg">
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
            <Lock size={24} />
            <div>
              <p className="font-bold">Mode Lecture Seule</p>
              <p className="text-sm opacity-90">Période d&apos;essai terminée</p>
            </div>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}