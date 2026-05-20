"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import Toggle from "@/components/ui/Toggle";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { deleteUserAction, setUserActiveAction } from "@/app/dashboard/usuarios/actions";
import { useRouter } from "next/navigation";

export type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: "admin" | "user";
  created_at: string | null;
  is_active: boolean;
};

const dateFormatterLima = new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima" });

function formatDateLima(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatterLima.format(d);
}

function initialsFrom(user: Pick<UserRow, "full_name" | "email">) {
  const base = (user.full_name ?? user.email).trim();
  const parts = base.split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return letters || base.slice(0, 2).toUpperCase();
}

function avatarColor(id: string) {
  const colors = ["bg-red-100 text-primary", "bg-green-100 text-green-700", "bg-amber-100 text-amber-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700"];
  const idx = Math.abs(
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
  ) % colors.length;
  return colors[idx];
}

export default function UserTable({ rows }: { rows: UserRow[] }) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);

  const columns: DataTableColumn<UserRow>[] = [
    {
      header: "",
      className: "w-[64px]",
      cell: (u) => (
        <div className={`h-9 w-9 rounded-pill flex items-center justify-center text-xs font-bold ${avatarColor(u.id)}`}>
          {initialsFrom(u)}
        </div>
      ),
    },
    { header: "Nombre", cell: (u) => <span className="font-semibold text-text-primary">{u.full_name ?? "—"}</span> },
    { header: "Email", cell: (u) => <span className="text-text-secondary">{u.email}</span> },
    {
      header: "Rol",
      cell: (u) => <Badge variant={u.role === "admin" ? "admin" : "user"}>{u.role === "admin" ? "Admin" : "Usuario"}</Badge>,
    },
    {
      header: "Fecha creación",
      cell: (u) => <span className="text-text-secondary">{formatDateLima(u.created_at)}</span>,
    },
    {
      header: "Estado",
      cell: (u) => {
        const isSelf = user?.id === u.id;
        return (
          <Toggle
            checked={u.is_active}
            disabled={isSelf || pending}
            onChange={(checked) => {
              startTransition(async () => {
                try {
                  await setUserActiveAction({ id: u.id, is_active: checked });
                  toast.success("Estado actualizado");
                  router.refresh();
                } catch (e: any) {
                  toast.error(e?.message ?? "No se pudo actualizar");
                }
              });
            }}
          />
        );
      },
    },
    {
      header: "Acciones",
      className: "w-[120px]",
      cell: (u) => {
        const isSelf = user?.id === u.id;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-input p-2 text-text-secondary hover:bg-black/5"
              aria-label="Editar"
              disabled={pending}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className="rounded-input p-2 text-text-secondary hover:bg-black/5 disabled:opacity-50"
              aria-label="Eliminar"
              disabled={isSelf || pending}
              onClick={() => setConfirmDelete(u)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const startItem = Math.min(total, (page - 1) * pageSize + 1);
  const endItem = Math.min(total, page * pageSize);

  return (
    <>
      <DataTable
        columns={columns}
        data={pageRows}
        rowKey={(r) => r.id}
        footer={
          <>
            <span className="text-sm text-text-secondary">
              Mostrando {startItem}-{endItem} de {total}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </>
        }
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Confirmar acción"
        message={
          confirmDelete ? `¿Eliminar al usuario ${confirmDelete.email}? Esta acción no se puede deshacer.` : ""
        }
        highlightedText={confirmDelete?.email}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          startTransition(async () => {
            try {
              await deleteUserAction({ id: confirmDelete.id });
              toast.success("Usuario eliminado");
              setConfirmDelete(null);
              router.refresh();
            } catch (e: any) {
              toast.error(e?.message ?? "No se pudo eliminar");
            }
          });
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
