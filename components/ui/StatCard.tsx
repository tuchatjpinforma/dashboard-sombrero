"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconColorClassName,
  accentLeft,
  rightElement,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColorClassName?: string;
  accentLeft?: boolean;
  rightElement?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-5 shadow-card",
        accentLeft ? "border-l-2 border-l-primary" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary">{value}</p>
            {subtitle ? <p className="text-sm text-text-secondary">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightElement}
          {icon ? <div className={cn("shrink-0", iconColorClassName)}>{icon}</div> : null}
        </div>
      </div>
    </div>
  );
}
