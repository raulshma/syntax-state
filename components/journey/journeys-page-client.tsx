'use client';

import { useEffect, type ReactNode } from 'react';
import { useSharedHeader } from '@/components/dashboard/shared-header-context';
import { JourneyCommandMenu } from './journey-command-menu';

interface JourneysPageClientProps {
  children: ReactNode;
}

export function JourneysPageClient({ children }: JourneysPageClientProps) {
  const { hideHeader } = useSharedHeader();

  useEffect(() => {
    hideHeader();
  }, [hideHeader]);

  return (
    <>
      {children}
      <JourneyCommandMenu />
    </>
  );
}
