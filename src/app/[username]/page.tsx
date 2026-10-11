import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchGitHubUser,
  fetchUserRepos,
  fetchUserFollowers,
  fetchUserFollowing,
  GitHubApiError,
} from "@/lib/github";
import { UserProfileView } from "@/components/user-profile-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { RateLimitBadge } from "@/components/rate-limit-badge";
import { ArrowLeft, UserX, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  return {
    title: `@${decodedUsername} - GitHub Profile Finder`,
    description: `Explore ${decodedUsername}'s GitHub profile, repositories, languages, and followers.`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).replace(/^@+/, "").trim();

  let user = null;
  let repos: any[] = [];
  let followers: any[] = [];
  let following: any[] = [];
  let errorState: { message: string; isRateLimit: boolean } | null = null;

  try {
    const [userData, reposData, followersData, followingData] = await Promise.all([
      fetchGitHubUser(decodedUsername),
      fetchUserRepos(decodedUsername).catch(() => []),
      fetchUserFollowers(decodedUsername).catch(() => []),
      fetchUserFollowing(decodedUsername).catch(() => []),
    ]);

    user = userData;
    repos = reposData;
    followers = followersData;
    following = followingData;
  } catch (err) {
    if (err instanceof GitHubApiError) {
      if (err.status === 404) {
        errorState = {
          message: `User "@${decodedUsername}" does not exist on GitHub.`,
          isRateLimit: false,
        };
      } else if (err.status === 403 || err.status === 429) {
        errorState = {
          message: err.message,
          isRateLimit: true,
        };
      } else {
        errorState = {
          message: err.message || "Failed to load GitHub user data.",
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

  if (errorState || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Utility Bar */}
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to search</span>
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
                <UserX className="size-7" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {errorState?.isRateLimit ? "GitHub Rate Limit Exceeded" : "Profile Not Found"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {errorState?.message || `Could not find any user with username "${decodedUsername}".`}
              </p>
              {errorState?.isRateLimit && (
                <p className="text-xs text-muted-foreground/80 pt-2 border-t border-border/40">
                  Tip: Add a <code className="bg-muted px-1.5 py-0.5 rounded font-mono">GITHUB_TOKEN</code> to your{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono">.env.local</code> file to unlock 5,000 requests/hour.
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
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
    <UserProfileView
      user={user}
      repos={repos}
      followers={followers}
      following={following}
    />
  );
}
