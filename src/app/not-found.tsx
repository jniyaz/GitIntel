import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <SearchX className="size-8" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The requested page or resource could not be found.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home Search</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
