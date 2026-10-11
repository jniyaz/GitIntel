"use client";

import * as React from "react";
import Link from "next/link";
import { GitHubRepo } from "@/types/github";
import { getLanguageColor } from "@/lib/language-colors";
import { Star, GitFork, ExternalLink, ArrowRight, CircleDot, GitPullRequest } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RepoCard({ repo }: { repo: GitHubRepo }) {
  const languageColor = getLanguageColor(repo.language);
  const updatedDate = new Date(repo.pushed_at || repo.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Link
                href={`/${repo.owner.login}/${repo.name}`}
                className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 break-all"
              >
                <span>{repo.name}</span>
                <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary shrink-0" />
              </Link>

              <div className="flex flex-wrap items-center gap-1.5">
                {repo.fork && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground">
                    Forked
                  </Badge>
                )}
                {repo.archived && (
                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">
                    Archived
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground">
                  Public
                </Badge>
              </div>
            </div>

            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors shrink-0"
              title="Open directly on GitHub"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
            {repo.description || "No description provided."}
          </p>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {repo.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="text-[10px] font-mono bg-primary/10 text-primary dark:text-primary-foreground px-2 py-0.5 rounded-md"
                >
                  #{topic}
                </span>
              ))}
              {repo.topics.length > 4 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{repo.topics.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            {repo.language && (
              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                <span
                  className="size-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: languageColor }}
                />
                <span>{repo.language}</span>
              </span>
            )}

            <span className="flex items-center gap-1" title={`${repo.stargazers_count} stars`}>
              <Star className="size-3.5 text-amber-500 fill-amber-500/20" />
              <span>{repo.stargazers_count.toLocaleString()}</span>
            </span>

            <span className="flex items-center gap-1" title={`${repo.forks_count} forks`}>
              <GitFork className="size-3.5" />
              <span>{repo.forks_count.toLocaleString()}</span>
            </span>

            {repo.open_issues_count > 0 && (
              <span className="flex items-center gap-1 hidden sm:flex" title={`${repo.open_issues_count} open issues`}>
                <CircleDot className="size-3.5 text-muted-foreground" />
                <span>{repo.open_issues_count}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/70">
              Updated {updatedDate}
            </span>
            <Link
              href={`/${repo.owner.login}/${repo.name}`}
              className={buttonVariants({ variant: "secondary", size: "xs" })}
            >
              Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
