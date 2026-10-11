"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GitHubUser,
  GitHubRepo,
  GitHubFollower,
} from "@/types/github";
import { RepoCard } from "@/components/repo-card";
import { CopyButton } from "@/components/copy-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RateLimitBadge } from "@/components/rate-limit-badge";
import { getLanguageColor } from "@/lib/language-colors";
import {
  ArrowLeft,
  Building,
  MapPin,
  Link as LinkIcon,
  Mail,
  Calendar,
  BookOpen,
  Users,
  UserPlus,
  FileCode2,
  Star,
  GitFork,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserProfileViewProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  followers: GitHubFollower[];
  following: GitHubFollower[];
}

type TabType = "all" | "repositories" | "languages" | "followers" | "following";

export function UserProfileView({
  user,
  repos,
  followers,
  following,
}: UserProfileViewProps) {
  const router = useRouter();
  const [topSearch, setTopSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<TabType>("all");
  const [repoSearch, setRepoSearch] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"stars" | "forks" | "updated" | "name">("updated");

  const handleTopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = topSearch
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .replace(/^@+/, "")
      .replace(/\/.*$/, "")
      .trim();
    if (!clean) return;
    router.push(`/${encodeURIComponent(clean)}`);
    setTopSearch("");
  };

  // Calculate statistics
  const totalStars = React.useMemo(() => {
    return repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  }, [repos]);

  const totalForks = React.useMemo(() => {
    return repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  }, [repos]);

  // Aggregate languages
  const languageStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) {
        counts[r.language] = (counts[r.language] || 0) + 1;
      }
    }
    const totalWithLang = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([lang, count]) => ({
        language: lang,
        count,
        percentage: totalWithLang > 0 ? Math.round((count / totalWithLang) * 100) : 0,
        color: getLanguageColor(lang),
      }))
      .sort((a, b) => b.count - a.count);
  }, [repos]);

  const availableLanguages = React.useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  // Filter and sort repos
  const filteredRepos = React.useMemo(() => {
    return repos
      .filter((r) => {
        const matchesQuery =
          r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase())) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(repoSearch.toLowerCase())));

        const matchesLang =
          selectedLanguage === "all" || r.language === selectedLanguage;

        return matchesQuery && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
        if (sortBy === "forks") return b.forks_count - a.forks_count;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
      });
  }, [repos, repoSearch, selectedLanguage, sortBy]);

  const joinedDate = new Date(user.created_at).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Utility Bar (Clean, no traditional logo/navbar) */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group shrink-0"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Search</span>
          </Link>

          {/* Quick Header Search */}
          <form onSubmit={handleTopSearch} className="flex-1 max-w-xs sm:max-w-md mx-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                placeholder="Search another username (e.g. torvalds)..."
                className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/60 focus:border-primary/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <RateLimitBadge />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        {/* Profile Container */}
        <div className="relative rounded-2xl border border-border/80 bg-card shadow-sm p-6 md:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between">
            {/* Avatar & Core Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="size-24 sm:size-28 md:size-32 rounded-2xl overflow-hidden ring-2 ring-border shadow-md bg-muted">
                  <Image
                    src={user.avatar_url}
                    alt={user.login}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                {user.hireable && (
                  <Badge className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] px-2 shadow-xs">
                    Available for hire
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {user.name || user.login}
                  </h1>
                  <span className="text-muted-foreground font-mono text-sm sm:text-base">
                    @{user.login}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-sm text-foreground/80 max-w-xl leading-relaxed pt-0.5">
                    {user.bio}
                  </p>
                )}

                {/* Metadata Items */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1.5">
                  {user.company && (
                    <span className="flex items-center gap-1.5">
                      <Building className="size-3.5 text-muted-foreground/70" />
                      <span>{user.company}</span>
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground/70" />
                      <span>{user.location}</span>
                    </span>
                  )}
                  {user.blog && (
                    <a
                      href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                      <LinkIcon className="size-3.5 text-muted-foreground/70" />
                      <span className="max-w-[200px] truncate">{user.blog.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                  {user.twitter_username && (
                    <a
                      href={`https://twitter.com/${user.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <svg className="size-3.5 text-muted-foreground/70 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>@{user.twitter_username}</span>
                    </a>
                  )}
                  {user.email && (
                    <a
                      href={`mailto:${user.email}`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Mail className="size-3.5 text-muted-foreground/70" />
                      <span>{user.email}</span>
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground/70" />
                    <span>Joined {joinedDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <CopyButton
                text={typeof window !== "undefined" ? window.location.href : ""}
                label="Share"
                variant="outline"
                size="sm"
                className="gap-1.5 h-9"
              />
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 h-9 shrink-0"
                onClick={() => window.open(user.html_url, "_blank")}
              >
                <span>GitHub Profile</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Clickable Quick Metrics Cards inside profile container */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-6 mt-6 border-t border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab("repositories")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "repositories"
                  ? "bg-primary/10 border-primary/50 shadow-xs"
                  : "bg-muted/30 border-border/40 hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <BookOpen className="size-3.5 text-primary" />
                <span>Repositories</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {user.public_repos.toLocaleString()}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "followers"
                  ? "bg-blue-500/10 border-blue-500/50 shadow-xs"
                  : "bg-muted/30 border-border/40 hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Users className="size-3.5 text-blue-500" />
                <span>Followers</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {user.followers.toLocaleString()}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("following")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "following"
                  ? "bg-indigo-500/10 border-indigo-500/50 shadow-xs"
                  : "bg-muted/30 border-border/40 hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <UserPlus className="size-3.5 text-indigo-500" />
                <span>Following</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {user.following.toLocaleString()}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("repositories");
                setSortBy("stars");
              }}
              className="p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Star className="size-3.5 text-amber-500" />
                <span>Total Stars</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {totalStars.toLocaleString()}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("languages")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                activeTab === "languages"
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs"
                  : "bg-muted/30 border-border/40 hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <FileCode2 className="size-3.5 text-emerald-500" />
                <span>Languages</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {languageStats.length}
              </div>
            </button>
          </div>
        </div>

        {/* Tabs Bar Moved Directly Below Profile Container */}
        <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-md pt-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <Layers className="size-4" />
              <span>All Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("repositories")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "repositories"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <BookOpen className="size-4" />
              <span>Repositories</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === "repositories"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80 text-foreground"
                }`}
              >
                {repos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("languages")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "languages"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <FileCode2 className="size-4" />
              <span>Languages</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === "languages"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80 text-foreground"
                }`}
              >
                {languageStats.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "followers"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <Users className="size-4" />
              <span>Followers</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === "followers"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80 text-foreground"
                }`}
              >
                {user.followers}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("following")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "following"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <UserPlus className="size-4" />
              <span>Following</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === "following"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80 text-foreground"
                }`}
              >
                {user.following}
              </span>
            </button>
          </div>
        </div>

        {/* Content Below Tabs */}
        <div className="space-y-8 pt-2">
          {/* SECTION: LANGUAGES (shown on 'all' or 'languages' tab) */}
          {(activeTab === "all" || activeTab === "languages") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <FileCode2 className="size-5 text-emerald-500" />
                  <span>Languages Breakdown</span>
                </h2>
                {activeTab === "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("languages")}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    View Details →
                  </button>
                )}
              </div>

              <Card>
                <CardContent className="p-5 md:p-6 space-y-5">
                  {languageStats.length > 0 ? (
                    <>
                      {/* Segment Bar */}
                      <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted shadow-2xs">
                        {languageStats.map((item) => (
                          <div
                            key={item.language}
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                            className="h-full transition-all duration-300"
                            title={`${item.language}: ${item.percentage}% (${item.count} repos)`}
                          />
                        ))}
                      </div>

                      {/* Language Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        {languageStats.map((item) => (
                          <button
                            key={item.language}
                            type="button"
                            onClick={() => {
                              setSelectedLanguage(item.language);
                              setActiveTab("repositories");
                            }}
                            className="p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-primary/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                            title={`Filter repos by ${item.language}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {item.language}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-medium text-muted-foreground shrink-0 pl-1">
                              {item.percentage}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">
                      No language statistics available for this user's repositories.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* SECTION: REPOSITORIES (shown on 'all' or 'repositories' tab) */}
          {(activeTab === "all" || activeTab === "repositories") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  <span>Repositories</span>
                  <span className="text-xs font-normal text-muted-foreground font-mono">
                    ({filteredRepos.length}{filteredRepos.length !== repos.length ? ` of ${repos.length}` : ""})
                  </span>
                </h2>
                {activeTab === "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("repositories")}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    View All {repos.length} Repos →
                  </button>
                )}
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Filter repositories by name or topic..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Language Filter */}
                  <div className="flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs">
                    <Filter className="size-3.5 text-muted-foreground" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-transparent text-foreground outline-none cursor-pointer text-xs font-medium"
                      aria-label="Filter by language"
                    >
                      <option value="all">All Languages</option>
                      {availableLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs">
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-foreground outline-none cursor-pointer text-xs font-medium"
                      aria-label="Sort repositories"
                    >
                      <option value="updated">Recently Updated</option>
                      <option value="stars">Most Stars</option>
                      <option value="forks">Most Forks</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Repos Grid */}
              {filteredRepos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeTab === "all" ? filteredRepos.slice(0, 10) : filteredRepos).map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 p-12 text-center space-y-3 bg-card/40">
                  <BookOpen className="size-8 mx-auto text-muted-foreground/60" />
                  <h3 className="font-medium text-foreground">No repositories found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {repoSearch || selectedLanguage !== "all"
                      ? "No repositories match your active search or language filters. Try clearing the filters."
                      : "This user does not have any public repositories yet."}
                  </p>
                  {(repoSearch || selectedLanguage !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRepoSearch("");
                        setSelectedLanguage("all");
                      }}
                    >
                      Reset filters
                    </Button>
                  )}
                </div>
              )}

              {activeTab === "all" && filteredRepos.length > 10 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("repositories")}
                    className="text-xs"
                  >
                    View all {filteredRepos.length} repositories →
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* SECTION: FOLLOWERS & FOLLOWING (shown on 'all', 'followers', or 'following' tab) */}
          {(activeTab === "all" || activeTab === "followers") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="size-5 text-blue-500" />
                  <span>Followers</span>
                  <span className="text-xs font-normal text-muted-foreground font-mono">
                    ({user.followers.toLocaleString()})
                  </span>
                </h2>
                {activeTab === "all" && user.followers > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("followers")}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    View All Followers →
                  </button>
                )}
              </div>

              {followers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(activeTab === "all" ? followers.slice(0, 6) : followers).map((f) => (
                    <Link
                      key={f.id}
                      href={`/${f.login}`}
                      className="p-3.5 rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/40 transition-all flex items-center gap-3 group shadow-2xs"
                    >
                      <Image
                        src={f.avatar_url}
                        alt={f.login}
                        width={40}
                        height={40}
                        className="size-10 rounded-full bg-muted object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          @{f.login}
                        </p>
                        <span className="text-xs text-muted-foreground">View profile →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-muted-foreground text-xs bg-card/40">
                  No followers found for this user.
                </div>
              )}
            </section>
          )}

          {(activeTab === "all" || activeTab === "following") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="size-5 text-indigo-500" />
                  <span>Following</span>
                  <span className="text-xs font-normal text-muted-foreground font-mono">
                    ({user.following.toLocaleString()})
                  </span>
                </h2>
                {activeTab === "all" && user.following > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("following")}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    View All Following →
                  </button>
                )}
              </div>

              {following.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(activeTab === "all" ? following.slice(0, 6) : following).map((f) => (
                    <Link
                      key={f.id}
                      href={`/${f.login}`}
                      className="p-3.5 rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/40 transition-all flex items-center gap-3 group shadow-2xs"
                    >
                      <Image
                        src={f.avatar_url}
                        alt={f.login}
                        width={40}
                        height={40}
                        className="size-10 rounded-full bg-muted object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          @{f.login}
                        </p>
                        <span className="text-xs text-muted-foreground">View profile →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-muted-foreground text-xs bg-card/40">
                  This user is not following anyone yet.
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
