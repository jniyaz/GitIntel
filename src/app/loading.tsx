import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar Skeleton */}
      <div className="border-b border-border/50 h-14 px-4 flex items-center justify-between max-w-6xl mx-auto">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Hero Card Skeleton */}
        <div className="p-8 rounded-2xl border border-border/70 bg-card space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <Skeleton className="size-28 rounded-2xl shrink-0" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-48 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Repos Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
