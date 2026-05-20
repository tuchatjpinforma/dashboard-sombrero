"use client";

import { cn } from "@/lib/utils";

export default function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-4", disabled ? "opacity-60" : "")}>
      {label ? <span className="text-sm text-text-primary">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-pill border border-border transition-colors",
          checked ? "bg-secondary" : "bg-gray-200",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
    </label>
  );
}

