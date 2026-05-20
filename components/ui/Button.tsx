"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-12 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark hover:shadow-button-hover disabled:bg-primary/60",
  secondary: "bg-surface text-text-primary border border-border hover:bg-black/5",
  success: "bg-secondary text-white hover:bg-green-600 disabled:bg-secondary/60",
  danger: "bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60",
  outline:
    "bg-surface text-text-primary border border-border hover:bg-black/5 disabled:text-text-secondary",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, icon, iconPosition = "left", children, ...props },
  ref,
) {
  const disabled = props.disabled || loading;
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-input font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : icon && iconPosition === "left" ? (
        icon
      ) : null}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" ? icon : null}
    </button>
  );
});

export default Button;
