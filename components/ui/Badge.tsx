"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "ok" | "progress" | "blocked" | "admin" | "user";

const variantClasses: Record<BadgeVariant, string> = {
  ok: "bg-green-100 text-green-800",
  progress: "bg-amber-100 text-amber-800",
  blocked: "bg-red-100 text-red-800",
  admin: "bg-red-50 text-primary",
  user: "bg-gray-100 text-text-secondary",
};

export default function Badge({
  variant,
  className,
  children,
}: {
  variant: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
