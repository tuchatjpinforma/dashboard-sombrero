"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle, Circle, Save } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function hasUppercase(v: string) {
  return /[A-Z]/.test(v);
}

function hasNumber(v: string) {
  return /\d/.test(v);
}

function hasSpecial(v: string) {
  return /[!@#]/.test(v);
}

export default function PasswordForm() {
  const toast = useToast();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const newPassword = watch("newPassword") ?? "";
  const checks = [
    { ok: newPassword.length >= 8, label: "Mínimo 8 caracteres" },
    { ok: hasNumber(newPassword), label: "Incluye un número" },
    { ok: hasUppercase(newPassword), label: "Al menos una mayúscula" },
    { ok: hasSpecial(newPassword), label: "Carácter especial (!@#) — opcional", optional: true },
  ];

  const onSubmit = async (values: FormValues) => {
    if (!profile?.email) return;
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: values.currentPassword,
      });
      if (reauthError) {
        toast.error("Contraseña actual incorrecta");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Contraseña actualizada correctamente");
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div>
        <h3 className="text-xl font-bold text-text-primary">Actualizar Contraseña</h3>
        <p className="mt-1 text-sm text-text-secondary">Actualiza tu contraseña para mantener tu cuenta segura.</p>
      </div>

      <div className="my-5 h-px bg-border" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Contraseña actual"
          type="password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nueva contraseña" type="password" error={errors.newPassword?.message} {...register("newPassword")} />
          <Input
            label="Confirmar contraseña"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <div className="rounded-input bg-black/5 p-4">
          <div className="mb-3 text-sm font-semibold text-text-primary">Requisitos de seguridad</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                {c.ok ? (
                  <CheckCircle size={16} className="text-secondary" />
                ) : (
                  <Circle size={16} className={c.optional ? "text-text-secondary" : "text-text-secondary"} />
                )}
                <span className={c.ok ? "text-text-primary" : "text-text-secondary"}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" loading={submitting} icon={<Save size={18} />} iconPosition="left">
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
