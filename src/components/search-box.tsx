"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, History, Sparkles, ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const POPULAR_PROFILES = [
  { username: "shadcn", label: "shadcn" },
  { username: "torvalds", label: "Linus Torvalds" },
  { username: "taylorotwell", label: "Taylor Otwell" },
  { username: "yyx990803", label: "Evan You" },
  { username: "antfu", label: "Anthony Fu" },
  { username: "leerob", label: "Lee Robinson" },
  { username: "vercel", label: "Vercel" }
];

const STORAGE_KEY = "gh_finder_recents";

function cleanUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@+/, "")
    .replace(/\/.*$/, "")
    .trim();
}

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [recents, setRecents] = React.useState<string[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecents(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveRecent = (username: string) => {
    try {
      const trimmed = username.toLowerCase();
      const updated = [trimmed, ...recents.filter((r) => r.toLowerCase() !== trimmed)].slice(0, 6);
      setRecents(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecents = () => {
    try {
      setRecents([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const executeSearch = (targetInput: string) => {
    const sanitized = cleanUsername(targetInput);
    if (!sanitized) return;

    saveRecent(sanitized);
    startTransition(() => {
      router.push(`/${encodeURIComponent(sanitized)}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-2xl blur-md opacity-40 group-focus-within:opacity-100 transition duration-300" />

        <div className="relative flex items-center bg-card rounded-xl border border-border/80 shadow-lg shadow-black/5 dark:shadow-black/20 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5 md:p-2">
          <div className="pl-3.5 pr-2 text-muted-foreground">
            {isPending ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : (
              <Search className="size-5 transition-colors group-focus-within:text-primary" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GitHub username (e.g. torvalds, shadcn)..."
            aria-label="GitHub username"
            className="w-full bg-transparent px-2 py-2.5 text-base md:text-lg text-foreground placeholder:text-muted-foreground/60 outline-none font-medium"
          />

          {query && !isPending && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors mr-1 cursor-pointer"
              aria-label="Clear input"
            >
              <X className="size-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 mr-2 text-[11px] font-mono font-medium text-muted-foreground/70 bg-muted/60 border border-border/60 px-1.5 py-0.5 rounded select-none">
            <CornerDownLeft className="size-3" />
            <span>Enter</span>
          </div>

          <Button
            type="submit"
            disabled={!query.trim() || isPending}
            size="lg"
            className="gap-2 shrink-0 font-medium rounded-lg px-4 md:px-5 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Explore</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Recent Searches */}
      {recents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <History className="size-3.5" />
              Recent searches
            </span>
            <button
              type="button"
              onClick={clearRecents}
              className="text-xs hover:text-foreground hover:underline transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recents.map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => executeSearch(user)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-all hover:border-primary/40 cursor-pointer disabled:opacity-50"
              >
                <span>@{user}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Profiles */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1 font-medium">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Popular profiles to explore:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_PROFILES.map((profile) => (
            <button
              key={profile.username}
              type="button"
              onClick={() => executeSearch(profile.username)}
              disabled={isPending}
              className="group inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/50 bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              <span className="text-foreground/90 font-medium">@{profile.username}</span>
              <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
                ({profile.label})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
