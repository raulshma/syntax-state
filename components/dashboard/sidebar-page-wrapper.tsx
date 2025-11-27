'use client';

import type { ReactNode } from 'react';
import { SharedHeader } from './shared-header';

interface SidebarPageWrapperProps {
  children: ReactNode;
}

export function SidebarPageWrapper({ children }: SidebarPageWrapperProps) {
  return (
    <main className="flex-1 relative min-w-0 max-w-full z-10">
      <div className="relative p-4 md:p-6 lg:p-8 overflow-x-hidden w-full max-w-full">
        <SharedHeader />
        {children}
      </div>
    </main>
  );
}
