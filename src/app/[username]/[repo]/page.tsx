import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchRepoDetails,
  fetchRepoLanguages,
  fetchRepoReadme,
  fetchRepoCommits,
  GitHubApiError,
} from "@/lib/github";
import { RepoDetailView } from "@/components/repo-detail-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { RateLimitBadge } from "@/components/rate-limit-badge";
import { ArrowLeft, FolderX, ShieldAlert } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string; repo: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, repo } = await params;
  const decodedUser = decodeURIComponent(username);
  const decodedRepo = decodeURIComponent(repo);
  return {
    title: `${decodedUser}/${decodedRepo} - Repository Details`,
    description: `Inspect ${decodedUser}/${decodedRepo} on GitHub: languages, commits, README, and metrics.`,
  };
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { username, repo } = await params;
  const decodedUser = decodeURIComponent(username);
  const decodedRepo = decodeURIComponent(repo);

  let repoData = null;
  let languages: Record<string, number> = {};
  let readme: string | null = null;
  let commits: any[] = [];
  let errorState: { message: string; isRateLimit: boolean } | null = null;

  try {
    const [fetchedRepo, fetchedLanguages, fetchedReadme, fetchedCommits] = await Promise.all([
      fetchRepoDetails(decodedUser, decodedRepo),
      fetchRepoLanguages(decodedUser, decodedRepo).catch(() => ({})),
      fetchRepoReadme(decodedUser, decodedRepo).catch(() => null),
      fetchRepoCommits(decodedUser, decodedRepo, 6).catch(() => []),
    ]);

    repoData = fetchedRepo;
    languages = fetchedLanguages;
    readme = fetchedReadme;
    commits = fetchedCommits;
  } catch (err) {
    if (err instanceof GitHubApiError) {
      if (err.status === 404) {
        errorState = {
          message: `Repository "${decodedUser}/${decodedRepo}" does not exist or is private.`,
          isRateLimit: false,
        };
      } else if (err.status === 403 || err.status === 429) {
        errorState = {
          message: err.message,
          isRateLimit: true,
        };
      } else {
        errorState = {
          message: err.message || "Failed to load repository details.",
          isRateLimit: false,
        };
      }
    } else {
      errorState = {
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
        isRateLimit: false,
      };
    }
  }

  if (errorState || !repoData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Utility Bar */}
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link
              href={`/${decodedUser}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to @{decodedUser}</span>
            </Link>

            <div className="flex items-center gap-3">
              <RateLimitBadge />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Error Card */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl border border-border/80 bg-card text-center space-y-4 shadow-sm">
            <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              {errorState?.isRateLimit ? (
                <ShieldAlert className="size-7" />
              ) : (
                <FolderX className="size-7" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {errorState?.isRateLimit ? "Rate Limit Exceeded" : "Repository Not Found"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {errorState?.message || `Could not find repository "${decodedUser}/${decodedRepo}".`}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href={`/${decodedUser}`}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <span>Back to profile</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <span>Search another profile</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <RepoDetailView
      repo={repoData}
      languages={languages}
      readme={readme}
      commits={commits}
    />
  );
}
