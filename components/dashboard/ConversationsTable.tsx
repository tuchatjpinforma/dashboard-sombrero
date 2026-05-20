"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { extractNumber, formatPhoneMasked } from "@/lib/utils";

type Status = "completed" | "in_progress" | "blocked";

function statusVariant(status: Status) {
  if (status === "blocked") return { variant: "blocked" as const, label: "Bloqueado" };
  return { variant: "progress" as const, label: "En curso" };
}

export default function ConversationsTable({
  rows,
}: {
  rows: Array<{
    id: string;
    session_id: string;
    preview: string;
    status: Exclude<Status, "completed">;
    relativeTime: string;
  }>;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "in_progress" | "blocked">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.replace(/\D/g, "");
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      const cleanId = r.session_id.includes("@") ? extractNumber(r.session_id) : r.session_id;
      return cleanId.includes(q);
    });
  }, [query, rows, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(filtered.length, safePage * pageSize);

  return (
    <div className="rounded-card border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between p-5">
        <h3 className="text-sm font-semibold text-text-primary">Últimas conversaciones</h3>
        <button
          type="button"
          className="rounded-input p-2 text-text-secondary hover:bg-black/5"
          aria-label="Filtrar"
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter size={18} />
        </button>
      </div>
      {showFilters ? (
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por número o ID..."
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Estado</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              className="h-12 w-full rounded-input border border-border bg-surface px-4 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">Todos</option>
              <option value="in_progress">En curso</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
        </div>
      ) : null}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[680px] table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-[220px] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Usuario</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Mensaje</th>
              <th className="w-[140px] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Estado</th>
              <th className="w-[140px] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Hora</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const s = statusVariant(r.status);
              const cleanId = r.session_id.includes("@") ? extractNumber(r.session_id) : r.session_id;
              return (
                <tr key={r.id} className="border-b border-[#F3F4F5] last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-text-primary">{formatPhoneMasked(cleanId)}</div>
                    <div className="text-xs text-text-secondary">ID: {cleanId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="block max-w-[360px] truncate italic text-text-secondary">
                      “{r.preview || "—"}”
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </td>
                  <td className="px-5 py-4 text-text-secondary">{r.relativeTime}</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-text-secondary">
                  No hay conversaciones recientes.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="text-sm text-text-secondary">
          Mostrando {showingFrom}–{showingTo} de {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
