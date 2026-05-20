"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { getWhatsAppHistoryAction } from "@/app/dashboard/conversaciones/actions";
import { extractNumber, formatPhoneMasked } from "@/lib/utils";

type SessionRow = {
  session_id: string;
  last_at: string | null;
  preview: string;
  blocked: boolean;
};

type HistoryRow = {
  id: number;
  created_at: string | null;
  message: any;
};

export default function ConversationsExplorer({ sessions }: { sessions: SessionRow[] }) {
  const [selected, setSelected] = useState<SessionRow | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "progress" | "blocked">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.replace(/\D/g, "");
    return sessions.filter((s) => {
      if (status === "blocked" && !s.blocked) return false;
      if (status === "progress" && s.blocked) return false;
      if (!q) return true;
      const cleanId = s.session_id.includes("@") ? extractNumber(s.session_id) : s.session_id;
      return cleanId.includes(q);
    });
  }, [query, sessions, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(filtered.length, safePage * pageSize);

  const columns: DataTableColumn<SessionRow>[] = [
    {
      header: "Sesión",
      cell: (r) => {
        const cleanId = r.session_id.includes("@") ? extractNumber(r.session_id) : r.session_id;
        return (
          <div>
            <div className="font-semibold text-text-primary">{formatPhoneMasked(cleanId)}</div>
            <div className="text-xs text-text-secondary">ID: {cleanId}</div>
          </div>
        );
      },
    },
    {
      header: "Último mensaje",
      cell: (r) => <span className="block max-w-[420px] truncate italic text-text-secondary">“{r.preview || "—"}”</span>,
    },
    {
      header: "Estado",
      cell: (r) => (r.blocked ? <Badge variant="blocked">Bloqueado</Badge> : <Badge variant="progress">En curso</Badge>),
    },
    {
      header: "Hora",
      cell: (r) =>
        r.last_at ? (
          <span className="text-text-secondary">
            {formatDistanceToNow(new Date(r.last_at), { addSuffix: true, locale: es })}
          </span>
        ) : (
          <span className="text-text-secondary">—</span>
        ),
    },
    {
      header: "",
      className: "w-[140px]",
      cell: (r) => (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => {
            setSelected(r);
            startTransition(async () => {
              const data = await getWhatsAppHistoryAction({ sessionId: r.session_id });
              setHistory(data);
            });
          }}
        >
          Ver chat
        </Button>
      ),
    },
  ];

  const bubbles = useMemo(() => {
    return history.map((h) => {
      const m = h.message;
      const type = m?.type === "ai" ? "ai" : m?.type === "human" ? "human" : "unknown";
      const content = typeof m?.content === "string" ? m.content : "";
      return { id: h.id, type, content, created_at: h.created_at };
    });
  }, [history]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[360px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por número o ID..."
            className="h-10 w-full rounded-input border border-border bg-white pl-9 pr-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPage(1);
            }}
            className="h-10 rounded-input border border-border bg-white px-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos</option>
            <option value="progress">En curso</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={visible}
        rowKey={(r) => r.session_id}
        footer={
          <div className="flex items-center justify-between gap-3 px-5 py-3">
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
        }
      />

      <Modal
        open={!!selected}
        title={
          selected
            ? `Sesión ${formatPhoneMasked(selected.session_id.includes("@") ? extractNumber(selected.session_id) : selected.session_id)}`
            : "Sesión"
        }
        subtitle="Historial de WhatsApp (n8n)"
        icon={<span className="text-lg">💬</span>}
        onClose={() => {
          setSelected(null);
          setHistory([]);
        }}
        maxWidthClassName="max-w-2xl"
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setSelected(null);
              setHistory([]);
            }}
          >
            Cerrar
          </Button>
        }
      >
        <div className="max-h-[60vh] space-y-3 overflow-auto">
          {pending ? (
            <div className="text-sm text-text-secondary">Cargando historial...</div>
          ) : bubbles.length === 0 ? (
            <div className="text-sm text-text-secondary">Sin mensajes para esta sesión.</div>
          ) : (
            bubbles.map((b) => (
              <div key={b.id} className={`flex ${b.type === "human" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-card px-4 py-3 text-sm ${
                    b.type === "human" ? "bg-gray-100 text-text-primary" : "bg-red-50 text-text-primary"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{b.content || "—"}</div>
                  {b.created_at ? (
                    <div className="mt-2 text-[11px] text-text-secondary">
                      {new Date(b.created_at).toLocaleString("es-PE")}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}
