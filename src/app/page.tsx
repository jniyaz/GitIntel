import { fetchRateLimit } from "@/lib/github";
import { SearchBox } from "@/components/search-box";
import { ThemeToggle } from "@/components/theme-toggle";
import { RateLimitBadge } from "@/components/rate-limit-badge";
import { UserCheck, GitFork, BookMarked, Terminal, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rateLimit = await fetchRateLimit();

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-background">
      {/* Ambient background glow & subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Utility Bar (Clean corner controls, no navigation or logos) */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-end gap-3">
        <RateLimitBadge initialData={rateLimit} />
        <ThemeToggle />
      </header>

      {/* Centralized Search Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16 text-center max-w-4xl mx-auto w-full">
        <div className="space-y-4 max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/60 bg-muted/50 text-foreground/80 shadow-2xs">
            <Sparkles className="size-3 text-amber-500" />
            <span>GitHub Profile & Repository Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Explore GitHub Profiles{" "}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Search any developer, analyze language breakdowns, inspect repository READMEs, and view recent commit activity ...
          </p>
        </div>

        {/* Centralized Search Box */}
        <SearchBox autoFocus />

      </main>

      {/* Clean Minimalist Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-muted-foreground/60 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GitHub Profile Finder &copy; {new Date().getFullYear()}</span>
          <span>Built with Next.js 16, TypeScript & shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
