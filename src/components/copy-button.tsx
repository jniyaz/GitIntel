"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "xs" | "icon" | "icon-sm";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function CopyButton({
  text,
  label,
  className,
  size = "icon-sm",
  variant = "ghost",
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      title={copied ? "Copied!" : label || "Copy to clipboard"}
      aria-label={copied ? "Copied" : label || "Copy"}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
      {label && <span className="text-xs">{copied ? "Copied!" : label}</span>}
    </Button>
  );
}
