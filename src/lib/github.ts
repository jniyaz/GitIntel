import {
  GitHubUser,
  GitHubRepo,
  GitHubCommit,
  GitHubFollower,
  GitHubRateLimit,
} from "@/types/github";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(tokenOverride?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GitHub-Profile-Finder-App",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = tokenOverride !== undefined ? tokenOverride : process.env.GITHUB_TOKEN;

  if (token && token.trim()) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }

  return headers;
}

export class GitHubApiError extends Error {
  status: number;
  resetTime?: number;

  constructor(message: string, status: number, resetTime?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.resetTime = resetTime;
  }
}

export function sanitizeUsername(username: string): string {
  return username
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@+/, "")
    .replace(/\/.*$/, "")
    .trim();
}

async function githubFetch<T>(endpoint: string, revalidateSecs = 60): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  let response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: revalidateSecs },
  });

  // If provided GITHUB_TOKEN failed with 401 Bad credentials, retry without token automatically
  if (response.status === 401 && process.env.GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN returned 401. Retrying unauthenticated request...");
    response = await fetch(url, {
      headers: getHeaders(""),
      next: { revalidate: revalidateSecs },
    });
  }

  if (!response.ok) {
    const resetHeader = response.headers.get("x-ratelimit-reset");
    const remainingHeader = response.headers.get("x-ratelimit-remaining");
    const resetTime = resetHeader ? parseInt(resetHeader, 10) * 1000 : undefined;

    if (response.status === 404) {
      throw new GitHubApiError("Resource not found", 404);
    }

    if (response.status === 403 || response.status === 429) {
      if (remainingHeader === "0") {
        throw new GitHubApiError(
          "GitHub API rate limit reached. Add a personal access token (GITHUB_TOKEN) in .env.local for 5,000 requests/hour.",
          403,
          resetTime
        );
      }
      throw new GitHubApiError(
        "Access forbidden by GitHub API. You may have exceeded the rate limit.",
        403,
        resetTime
      );
    }

    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || "";
    } catch {
      // ignore
    }

    throw new GitHubApiError(
      errorDetail || `GitHub API error: ${response.statusText} (${response.status})`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const clean = sanitizeUsername(username);
  if (!clean) throw new GitHubApiError("Invalid username", 400);
  return githubFetch<GitHubUser>(`/users/${encodeURIComponent(clean)}`);
}

export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  const clean = sanitizeUsername(username);
  if (!clean) return [];
  return githubFetch<GitHubRepo[]>(
    `/users/${encodeURIComponent(clean)}/repos?per_page=100&sort=updated`
  );
}

export async function fetchUserFollowers(username: string): Promise<GitHubFollower[]> {
  const clean = sanitizeUsername(username);
  if (!clean) return [];
  return githubFetch<GitHubFollower[]>(
    `/users/${encodeURIComponent(clean)}/followers?per_page=30`
  );
}

export async function fetchUserFollowing(username: string): Promise<GitHubFollower[]> {
  const clean = sanitizeUsername(username);
  if (!clean) return [];
  return githubFetch<GitHubFollower[]>(
    `/users/${encodeURIComponent(clean)}/following?per_page=30`
  );
}

export async function fetchRepoDetails(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const cleanOwner = sanitizeUsername(owner);
  const cleanRepo = repo.trim();
  return githubFetch<GitHubRepo>(
    `/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`
  );
}

export async function fetchRepoLanguages(
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const cleanOwner = sanitizeUsername(owner);
  const cleanRepo = repo.trim();
  return githubFetch<Record<string, number>>(
    `/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/languages`
  );
}

export async function fetchRepoReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  const cleanOwner = sanitizeUsername(owner);
  const cleanRepo = repo.trim();
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/readme`;

  try {
    let response = await fetch(url, {
      headers: {
        ...getHeaders(),
        Accept: "application/vnd.github.raw+json",
      },
      next: { revalidate: 300 },
    });

    if (response.status === 401 && process.env.GITHUB_TOKEN) {
      response = await fetch(url, {
        headers: {
          ...getHeaders(""),
          Accept: "application/vnd.github.raw+json",
        },
        next: { revalidate: 300 },
      });
    }

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

export async function fetchRepoCommits(
  owner: string,
  repo: string,
  perPage = 6
): Promise<GitHubCommit[]> {
  const cleanOwner = sanitizeUsername(owner);
  const cleanRepo = repo.trim();
  try {
    return await githubFetch<GitHubCommit[]>(
      `/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/commits?per_page=${perPage}`
    );
  } catch {
    return [];
  }
}

export async function fetchRateLimit(): Promise<GitHubRateLimit> {
  try {
    const res = await githubFetch<{
      rate: { limit: number; remaining: number; reset: number; used: number };
    }>("/rate_limit", 10);
    const hasToken = Boolean(process.env.GITHUB_TOKEN?.trim());
    return {
      limit: res.rate.limit,
      remaining: res.rate.remaining,
      reset: res.rate.reset,
      used: res.rate.used,
      hasToken,
    };
  } catch {
    return {
      limit: 60,
      remaining: 60,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0,
      hasToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
    };
  }
}
