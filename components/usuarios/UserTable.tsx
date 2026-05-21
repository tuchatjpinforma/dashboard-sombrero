"use client";

import { useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash2, Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import Toggle from "@/components/ui/Toggle";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { deleteUserAction, setUserActiveAction, updateUserAction } from "@/app/dashboard/usuarios/actions";
import { useRouter } from "next/navigation";

export type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: "admin" | "user";
  created_at: string | null;
  is_active: boolean;
};

const editSchema = z.object({
  fullName: z.string().min(2, "Ingresa un nombre válido"),
  role: z.enum(["user", "admin"]),
  is_active: z.boolean(),
});

type EditValues = z.infer<typeof editSchema>;

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
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { fullName: "", role: "user", is_active: true },
  });

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
              onClick={() => {
                setEditing(u);
                reset({ fullName: u.full_name ?? "", role: u.role, is_active: u.is_active });
              }}
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

      <Modal
        open={!!editing}
        title="Editar usuario"
        subtitle={editing ? editing.email : ""}
        icon={<Pencil size={18} />}
        onClose={() => {
          setEditing(null);
          reset({ fullName: "", role: "user", is_active: true });
        }}
        maxWidthClassName="max-w-lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                reset({ fullName: "", role: "user", is_active: true });
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button variant="success" loading={saving} onClick={handleSubmit(async (values) => {
              if (!editing) return;
              setSaving(true);
              try {
                const isSelf = user?.id === editing.id;
                await updateUserAction({
                  id: editing.id,
                  fullName: values.fullName,
                  role: isSelf ? editing.role : values.role,
                  is_active: isSelf ? editing.is_active : values.is_active,
                });
                toast.success("Usuario actualizado");
                setEditing(null);
                router.refresh();
              } catch (e: any) {
                toast.error(e?.message ?? "No se pudo actualizar");
              } finally {
                setSaving(false);
              }
            })}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input label="NOMBRE COMPLETO" placeholder="Ej: Juan Pérez" error={errors.fullName?.message} {...register("fullName")} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">ROL</label>
            <select
              className="h-12 w-full rounded-input border border-border bg-surface px-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              disabled={saving || user?.id === editing?.id}
              {...register("role")}
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role?.message ? <p className="text-sm text-text-danger">{errors.role.message}</p> : null}
          </div>
          <label className="flex items-center justify-between gap-3 rounded-input border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            <span>Usuario activo</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-60"
              disabled={saving || user?.id === editing?.id}
              checked={watch("is_active")}
              onChange={(e) => setValue("is_active", e.target.checked)}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
