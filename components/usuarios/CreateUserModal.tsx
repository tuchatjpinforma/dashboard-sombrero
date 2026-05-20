"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createUserAction } from "@/app/dashboard/usuarios/actions";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

const schema = z.object({
  fullName: z.string().min(2, "Ingresa un nombre válido"),
  email: z.string().email("Ingresa un correo válido"),
  role: z.enum(["user", "admin"]),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  sendEmail: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", role: "user", password: "", sendEmail: true },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await createUserAction({
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        password: values.password,
        sendEmail: values.sendEmail,
      });
      toast.success("Usuario creado correctamente");
      close();
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo crear el usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Crear nuevo usuario"
      subtitle="Agrega un usuario al panel con rol y contraseña temporal."
      icon={<UserPlus size={18} />}
      onClose={close}
      maxWidthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSubmit(onSubmit)} loading={submitting}>
            Crear usuario
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="NOMBRE COMPLETO"
          placeholder="Ej: Juan Pérez"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="CORREO ELECTRÓNICO"
          placeholder="ejemplo@sombrerito.com"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">ROL</label>
            <select
              className="h-12 w-full rounded-input border border-border bg-surface px-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              {...register("role")}
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role?.message ? <p className="text-sm text-text-danger">{errors.role.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">CONTRASEÑA TEMPORAL</label>
            <div className="relative">
              <input
                className="h-12 w-full rounded-input border border-border bg-surface px-4 pr-12 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-input p-1 text-text-secondary hover:bg-black/5"
                aria-label="Mostrar contraseña"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password?.message ? <p className="text-sm text-text-danger">{errors.password.message}</p> : null}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" {...register("sendEmail")} />
          Enviar credenciales por correo electrónico
        </label>
      </div>
    </Modal>
  );
}

