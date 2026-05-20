"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, error, icon, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 w-full rounded-input border border-border bg-surface px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/30",
            icon ? "pl-12" : "",
            error ? "border-primary focus:border-primary focus:ring-primary/40" : "",
            className,
          )}
          {...props}
        />
      </div>
      {error ? <p className="text-sm text-text-danger">{error}</p> : null}
    </div>
  );
});

export default Input;
