# GitIntel

A responsive GitHub developer & repository intelligence application built with **Next.js**.

---

## ✨ Features

- **Centralized Hero Search**:
  - Distraction-free, centered search console.
  - Keyboard shortcuts (`/` or `Cmd+K` / `Ctrl+K`) to focus anywhere.
  - Recent searches persisted locally with quick-recall pills.
  - Popular developer suggestions (e.g., `@shadcn`, `@torvalds`, `@leerob`, `@gaearon`, `@yyx990803`).
- **No Cluttered Navigation or Logos**:
  - Removed top logos and traditional navigation headers for a modern, focused workflow.
  - Unobtrusive corner controls: live GitHub rate-limit status pill & dark/light theme toggle.
- **Deep Developer Profile Pages (`/[username]`)**:
  - Comprehensive user metrics: public repos, followers, following, gists, and total stars earned across public repositories.
  - Interactive tabs:
    - **Repositories**: Real-time name/topic search filter, language dropdown filter, sort by stars / forks / updated / name.
    - **Language Breakdown**: Distribution bar and percentage cards for all programming languages used.
    - **Followers & Following**: Quick-nav user cards with avatars.
  - Bio, company, location, clickable website/blog, X/Twitter, email, hireable indicator, and joined date.
- **Repository Details Deep-Dive (`/[username]/[repo]`)**:
  - Rendered **Markdown README** with GitHub-flavored markdown styling (headings, code blocks, tables, badges).
  - Language byte breakdown with color indicators and percentage bars.
  - Recent commit activity (latest 5 commits with commit messages, dates, authors, and short SHAs).
  - One-click clone helpers (HTTPS & SSH commands with copy feedback).
  - Direct links to GitHub repository and homepage.
- **Protected Credentials & High Rate Limits**:
  - Legacy hardcoded client credentials removed from client-side JavaScript.
  - All GitHub API queries executed server-side with zero token leakage.
  - Supports GitHub Personal Access Tokens (`GITHUB_TOKEN`) in `.env.local` to unlock **5,000 requests/hour** (up from 60 req/hr unauthenticated).
- **Responsive & Modern UX**:
  - Full mobile, tablet, and desktop responsiveness.
  - Dark mode and light mode with system theme sync via `next-themes`.
  - Accessible shadcn/ui components with loading skeletons and friendly error states.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20+ or v24+
- **pnpm** (recommended)

### 2. Installation

Clone or open the repository, then install dependencies:

```bash
pnpm install
```

### 3. Environment Variables (Optional but Recommended)

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your GitHub Personal Access Token (classic or fine-grained):

```env
# Increases rate limit from 60 to 5,000 requests/hour:
GITHUB_TOKEN=ghp_your_github_token_here
```

> **Note**: The application will work without a token for up to 60 requests/hour per IP, but adding a token avoids rate-limiting when exploring multiple profiles.

### 4. Development Server

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

Build and start the optimized production application:

```bash
pnpm build
pnpm start
```

---

## 📁 Project Structure

```
├── .env.example            # Environment variables template
├── .env.local              # Local credentials (git-ignored)
├── src/
│   ├── app/
│   │   ├── [username]/
│   │   │   ├── [repo]/
│   │   │   │   └── page.tsx      # Repository details page (README, commits, languages)
│   │   │   └── page.tsx          # User profile overview page
│   │   ├── api/
│   │   │   └── rate-limit/       # Rate limit status API route
│   │   ├── globals.css           # Tailwind CSS v4 & theme variables
│   │   ├── layout.tsx            # Root layout with ThemeProvider
│   │   ├── loading.tsx           # Page transition skeletons
│   │   ├── not-found.tsx         # 404 handler
│   │   └── page.tsx              # Centralized home search page
│   ├── components/
│   │   ├── ui/                   # shadcn / Base UI components (Button, Card, Badge, etc.)
│   │   ├── copy-button.tsx       # 1-click clipboard copy with status
│   │   ├── rate-limit-badge.tsx  # Live rate limit status pill
│   │   ├── repo-card.tsx         # Interactive repository card
│   │   ├── repo-detail-view.tsx  # Full repo viewer with README & commits
│   │   ├── search-box.tsx        # Centralized search console with recents
│   │   ├── theme-provider.tsx    # Theme provider
│   │   ├── theme-toggle.tsx      # Smooth dark/light toggle
│   │   └── user-profile-view.tsx # Comprehensive profile viewer
│   ├── lib/
│   │   ├── github.ts             # GitHub API fetchers & server caching
│   │   ├── language-colors.ts    # Canonical GitHub language color mapping
│   │   └── utils.ts              # Class name utilities
│   └── types/
│       └── github.ts             # TypeScript definitions
├── package.json
└── tsconfig.json
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Components**: shadcn/ui, Tailwind CSS v4, Lucide React
- **Language**: TypeScript
- **State & Theming**: React 19, next-themes
- **Markdown Rendering**: react-markdown, remark-gfm
- **Package Manager**: pnpm

---

## 📄 License

MIT
