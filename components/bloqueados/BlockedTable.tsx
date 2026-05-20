"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Button from "@/components/ui/Button";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { retirarBloqueoAction } from "@/app/dashboard/bloqueados/actions";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { formatPhoneMasked } from "@/lib/utils";

export type BlockedRow = {
  id: number;
  whatsapp_id: string | null;
  user_name: string | null;
  user_number: string | null;
  motivo: string | null;
  mensaje_orig: string | null;
  fecha: string | null;
  _index?: number;
};

function reasonBadge(motivo: string | null) {
  if (!motivo) return "bg-gray-100 text-text-secondary";
  if (motivo.toLowerCase().includes("spam")) return "bg-amber-100 text-amber-800";
  if (motivo.toLowerCase().includes("lenguaje")) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-text-secondary";
}

export default function BlockedTable({ rows }: { rows: BlockedRow[] }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<BlockedRow | null>(null);
  const [query, setQuery] = useState("");
  const [limpiarIntentos, setLimpiarIntentos] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const num = String(r.user_number ?? "").toLowerCase();
      const name = String(r.user_name ?? "").toLowerCase();
      return num.includes(q) || name.includes(q);
    });
  }, [query, rows]);

  const columns: DataTableColumn<BlockedRow>[] = [
    {
      header: "#",
      className: "w-[60px]",
      cell: (r) => <span className="text-text-secondary">{r._index ?? ""}</span>,
    },
    {
      header: "NÚMERO DE TELÉFONO",
      cell: (r) => <span className="font-semibold text-text-primary">{formatPhoneMasked(String(r.user_number ?? ""))}</span>,
    },
    {
      header: "MOTIVO",
      cell: (r) => (
        <span className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${reasonBadge(r.motivo)}`}>
          {r.motivo ?? "—"}
        </span>
      ),
    },
    {
      header: "FECHA DE BLOQUEO",
      cell: (r) =>
        r.fecha ? (
          <span className="text-text-secondary">
            {formatDistanceToNow(new Date(r.fecha), { addSuffix: true, locale: es })}
          </span>
        ) : (
          <span className="text-text-secondary">—</span>
        ),
    },
    {
      header: "BLOQUEADO POR",
      cell: () => <span className="text-sm text-text-secondary">Sistema</span>,
    },
    {
      header: "ACCIONES",
      className: "w-[200px]",
      cell: (r) => (
        <Button
          variant="outline"
          className="h-10 px-3 border-primary text-primary hover:bg-red-50"
          disabled={pending}
          onClick={() => setConfirm(r)}
        >
          Retirar bloqueo
        </Button>
      ),
    },
  ];

  const dataWithIndex = filtered.map((r, idx) => ({ ...r, _index: idx + 1 }));

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          className="h-11 w-full max-w-md rounded-input border border-border bg-surface px-4 text-sm text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar número..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={dataWithIndex} rowKey={(r) => String(r.id)} />

      <Modal
        open={!!confirm}
        title="Confirmar acción"
        subtitle={confirm ? "La tabla bloqueados_whatsapp no permite soft delete." : undefined}
        icon={<span className="text-lg">!</span>}
        onClose={() => setConfirm(null)}
        maxWidthClassName="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={pending}
              onClick={() => {
                if (!confirm) return;
                startTransition(async () => {
                  try {
                    await retirarBloqueoAction({
                      id: confirm.id,
                      user_number: String(confirm.user_number ?? ""),
                      limpiarIntentos,
                    });
                    toast.success("Bloqueo retirado correctamente");
                    setConfirm(null);
                    setLimpiarIntentos(true);
                    router.refresh();
                  } catch (e: any) {
                    toast.error(e?.message ?? "No se pudo retirar");
                  }
                });
              }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {confirm ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              ¿Retirar bloqueo a{" "}
              <span className="font-semibold text-text-primary">
                {formatPhoneMasked(String(confirm.user_number ?? ""))}
              </span>
              ? El usuario podrá volver a contactarse con el sistema de inmediato.
            </p>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={limpiarIntentos}
                onChange={(e) => setLimpiarIntentos(e.target.checked)}
              />
              Limpiar intentos relacionados (WhatsApp)
            </label>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

