"use client";

import Link from "next/link";
import { Infinity } from "lucide-react";

interface SidebarUsageProps {
  count: number;
  limit: number;
  plan: string;
  isByok: boolean;
}

export function SidebarUsage({
  count,
  limit,
  plan,
  isByok,
}: SidebarUsageProps) {
  const percentage = limit > 0 ? Math.min((count / limit) * 100, 100) : 0;
  const isAtLimit = count >= limit && !isByok;
  const remaining = Math.max(0, limit - count);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">Iterations</p>
        {isByok ? (
          <span className="text-xs font-mono text-foreground flex items-center gap-1">
            <Infinity className="w-3 h-3" />
            Unlimited
          </span>
        ) : (
          <span
            className={`text-xs font-mono ${
              isAtLimit ? "text-red-400" : "text-foreground"
            }`}
          >
            {count}/{limit}
          </span>
        )}
      </div>

      {!isByok && (
        <>
          <div className="h-2 bg-muted">
            <div
              className={`h-full ${isAtLimit ? "bg-red-500" : "bg-foreground"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {isAtLimit ? (
            <p className="text-xs text-red-400 mt-1">
              Limit reached -{" "}
              <Link href="/pricing" className="underline hover:text-red-300">
                upgrade for more
              </Link>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              {remaining} remaining • {plan} plan
            </p>
          )}
        </>
      )}

      {isByok && (
        <p className="text-xs text-muted-foreground mt-1">
          BYOK enabled • {plan} plan
        </p>
      )}
    </div>
  );
}
