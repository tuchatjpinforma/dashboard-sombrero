"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  maxWidthClassName = "max-w-lg",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
}) {
  const portalTarget = useMemo(() => (typeof document !== "undefined" ? document.body : null), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "relative w-full rounded-card bg-surface shadow-modal border border-border",
          maxWidthClassName,
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 p-8">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-primary">
                {icon}
              </div>
            ) : null}
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
            </div>
          </div>
          <button
            aria-label="Cerrar"
            className="rounded-input p-2 text-text-secondary hover:bg-black/5"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-8 pb-8">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-3 border-t border-border px-8 py-5">{footer}</div> : null}
      </div>
    </div>,
    portalTarget,
  );
}
