"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  GitHubRepo,
  GitHubCommit,
} from "@/types/github";
import { CopyButton } from "@/components/copy-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RateLimitBadge } from "@/components/rate-limit-badge";
import { getLanguageColor } from "@/lib/language-colors";
import {
  ArrowLeft,
  Star,
  GitFork,
  Eye,
  CircleDot,
  ExternalLink,
  GitCommit,
  GitBranch,
  ShieldCheck,
  Scale,
  Calendar,
  HardDrive,
  Terminal,
  Globe,
  FileText,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RepoDetailViewProps {
  repo: GitHubRepo;
  languages: Record<string, number>;
  readme: string | null;
  commits: GitHubCommit[];
}

export function RepoDetailView({
  repo,
  languages,
  readme,
  commits,
}: RepoDetailViewProps) {
  // Format dates
  const createdDate = new Date(repo.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const updatedDate = new Date(repo.pushed_at || repo.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate languages breakdown
  const languageStats = React.useMemo(() => {
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) return [];
    return Object.entries(languages)
      .map(([lang, bytes]) => ({
        name: lang,
        bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(1),
        color: getLanguageColor(lang),
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }, [languages]);

  // Size helper
  const formattedSize = React.useMemo(() => {
    if (repo.size > 1024) {
      return `${(repo.size / 1024).toFixed(1)} MB`;
    }
    return `${repo.size} KB`;
  }, [repo.size]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Utility Bar */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
            <Link
              href={`/${repo.owner.login}`}
              className="inline-flex items-center gap-1.5 font-medium hover:text-foreground transition-colors group shrink-0"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>@{repo.owner.login}</span>
            </Link>
            <span className="text-border">/</span>
            <span className="font-semibold text-foreground truncate">{repo.name}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <RateLimitBadge />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Repository Header Hero */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${repo.owner.login}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Image
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    width={24}
                    height={24}
                    className="size-6 rounded-full bg-muted"
                  />
                  <span className="text-sm font-medium font-mono">@{repo.owner.login}</span>
                </Link>
                <span className="text-muted-foreground/60">/</span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-all">
                  {repo.name}
                </h1>

                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {repo.private ? "Private" : "Public"}
                  </Badge>
                  {repo.fork && (
                    <Badge variant="secondary" className="text-xs">
                      Fork
                    </Badge>
                  )}
                  {repo.archived && (
                    <Badge variant="destructive" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>

              {repo.description && (
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl">
                  {repo.description}
                </p>
              )}

              {/* Homepage Link */}
              {repo.homepage && (
                <div className="flex items-center gap-1.5 text-xs text-primary pt-1">
                  <Globe className="size-3.5" />
                  <a
                    href={repo.homepage.startsWith("http") ? repo.homepage : `https://${repo.homepage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary/80 transition-colors max-w-md truncate"
                  >
                    {repo.homepage}
                  </a>
                </div>
              )}

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs font-mono bg-primary/10 text-primary dark:text-primary-foreground px-2.5 py-0.5 rounded-md"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="default"
                size="sm"
                className="gap-2 h-9"
                onClick={() => window.open(repo.html_url, "_blank")}
              >
                <span>GitHub</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/50">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
              <Star className="size-4 text-amber-500 fill-amber-500/20 shrink-0" />
              <div>
                <span className="text-[11px] text-muted-foreground font-medium block">Stars</span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {repo.stargazers_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
              <GitFork className="size-4 text-blue-500 shrink-0" />
              <div>
                <span className="text-[11px] text-muted-foreground font-medium block">Forks</span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {repo.forks_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
              <Eye className="size-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[11px] text-muted-foreground font-medium block">Watchers</span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {repo.watchers_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
              <CircleDot className="size-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-[11px] text-muted-foreground font-medium block">Open Issues</span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {repo.open_issues_count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Clone Snippets */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Terminal className="size-4 text-primary" />
              <span>Clone this repository</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border border-border/70 font-mono">
                <span className="text-muted-foreground select-none shrink-0 font-medium">HTTPS</span>
                <span className="truncate text-foreground/90 select-all">{repo.clone_url}</span>
                <CopyButton text={`git clone ${repo.clone_url}`} />
              </div>

              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border border-border/70 font-mono">
                <span className="text-muted-foreground select-none shrink-0 font-medium">SSH</span>
                <span className="truncate text-foreground/90 select-all">{repo.ssh_url}</span>
                <CopyButton text={`git clone ${repo.ssh_url}`} />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column: README Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">README.md</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {repo.default_branch}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {readme ? (
                  <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-xl prose-img:rounded-lg overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {readme}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <FileText className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">No README file provided</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      This repository has not published a README.md file in its default branch.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Languages, Commits & Facts */}
          <div className="space-y-6">
            {/* Languages breakdown */}
            <Card>
              <CardHeader className="py-4 px-5 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Languages</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {languageStats.length > 0 ? (
                  <>
                    <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-muted">
                      {languageStats.map((item) => (
                        <div
                          key={item.name}
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                          className="h-full"
                          title={`${item.name}: ${item.percentage}%`}
                        />
                      ))}
                    </div>

                    <div className="space-y-2">
                      {languageStats.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-foreground">{item.name}</span>
                          </div>
                          <span className="font-mono text-muted-foreground">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No language breakdown detected.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Commits */}
            <Card>
              <CardHeader className="py-4 px-5 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GitCommit className="size-4 text-primary" />
                  <span>Recent Commits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {commits.length > 0 ? (
                  <div className="space-y-3">
                    {commits.map((c) => {
                      const commitDate = new Date(c.commit.author.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <div
                          key={c.sha}
                          className="p-3 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/40 transition-colors space-y-1.5"
                        >
                          <a
                            href={c.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-foreground hover:text-primary transition-colors line-clamp-2 block"
                          >
                            {c.commit.message}
                          </a>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                            <span className="truncate max-w-[120px]">{c.commit.author.name}</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span>{commitDate}</span>
                              <span className="text-primary font-semibold">
                                {c.sha.slice(0, 7)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No commit history available.</p>
                )}
              </CardContent>
            </Card>

            {/* Repository Info Cards */}
            <Card>
              <CardHeader className="py-4 px-5 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Repository Details</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <GitBranch className="size-3.5" />
                    <span>Default Branch</span>
                  </span>
                  <span className="font-mono font-medium text-foreground">{repo.default_branch}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Scale className="size-3.5" />
                    <span>License</span>
                  </span>
                  <span className="font-medium text-foreground">
                    {repo.license ? repo.license.name : "None specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <HardDrive className="size-3.5" />
                    <span>Size</span>
                  </span>
                  <span className="font-mono font-medium text-foreground">{formattedSize}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>Created</span>
                  </span>
                  <span className="text-foreground">{createdDate}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>Last Updated</span>
                  </span>
                  <span className="text-foreground">{updatedDate}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
