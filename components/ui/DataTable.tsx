"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export default function DataTable<T>({
  columns,
  data,
  loading,
  rowKey,
  footer,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey: (row: T) => string;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-surface shadow-card">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c, idx) => (
                <th key={idx} className={cn("px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-secondary", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-black/5">
                    {columns.map((__, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-black/10" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-black/5 last:border-b-0">
                    {columns.map((c, idx) => (
                      <td key={idx} className={cn("px-5 py-4 align-middle", c.className)}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-text-secondary">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {footer ? <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">{footer}</div> : null}
    </div>
  );
}
