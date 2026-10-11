"use client";

import * as React from "react";
import { GitHubRateLimit } from "@/types/github";
import { ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RateLimitBadgeProps {
  initialData?: GitHubRateLimit;
}

export function RateLimitBadge({ initialData }: RateLimitBadgeProps) {
  const [data, setData] = React.useState<GitHubRateLimit | null>(initialData || null);
  const [loading, setLoading] = React.useState(!initialData);

  React.useEffect(() => {
    async function loadRateLimit() {
      try {
        const res = await fetch("/api/rate-limit");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadRateLimit();
  }, []);

  if (loading || !data) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground rounded-full border border-border/40 bg-muted/30">
        <span className="size-2 rounded-full bg-muted-foreground/40 animate-pulse" />
        <span>Rate Limit: Checking...</span>
      </div>
    );
  }

  const isLow = data.remaining < 10;
  const resetMinutes = Math.max(
    0,
    Math.round((data.reset * 1000 - Date.now()) / 60000)
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-colors cursor-help ${
              isLow
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}
          >
            {data.hasToken ? (
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            ) : isLow ? (
              <ShieldAlert className="size-3.5 text-amber-500 shrink-0" />
            ) : (
              <Zap className="size-3.5 text-primary/70 shrink-0" />
            )}
            <span className="font-mono font-medium">
              {data.remaining}/{data.limit} API reqs
            </span>
            {data.hasToken && (
              <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded">
                PAT
              </span>
            )}
          </div>
        }
      />
      <TooltipContent className="max-w-xs text-xs p-3 space-y-1.5 shadow-lg">
        <p className="font-medium text-foreground">
          {data.hasToken
            ? "Authenticated with Personal Access Token"
            : "Public Unauthenticated Rate Limit"}
        </p>
        <p className="text-muted-foreground">
          {data.remaining} requests remaining out of {data.limit}. Resets in{" "}
          <strong className="text-foreground">{resetMinutes} mins</strong>.
        </p>
        {!data.hasToken && (
          <p className="text-[11px] text-primary/80 pt-1 border-t border-border/40">
            💡 Add <code className="bg-muted px-1 py-0.5 rounded">GITHUB_TOKEN</code> to{" "}
            <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> to get 5,000 requests/hour.
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
