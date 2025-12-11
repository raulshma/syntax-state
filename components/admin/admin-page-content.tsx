'use client';

import { useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSharedHeader } from '@/components/dashboard/shared-header-context';

interface AdminPageContentProps {
  children: React.ReactNode;
}

export function AdminPageContent({ children }: AdminPageContentProps) {
  const { setHeader } = useSharedHeader();

  useEffect(() => {
    setHeader({
      badge: 'Admin',
      badgeIcon: Shield,
      title: 'System Dashboard',
      description: 'Monitor platform health, manage users, and configure AI systems',
      actions: (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Systems Online</span>
          </div>
          <Badge variant="secondary" className="px-3 py-1.5 rounded-full bg-secondary/50  border border-border/50">
            <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
            Admin Mode
          </Badge>
        </div>
      ),
    });
  }, [setHeader]);

  return <>{children}</>;
}
