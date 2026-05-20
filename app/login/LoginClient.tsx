"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Mail, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getSupabaseBrowserClient, resetSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = useMemo<FormValues>(
    () => ({
      email: "",
      password: "",
      remember: true,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const remember = watch("remember");

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      window.localStorage.setItem("sc_remember", values.remember ? "1" : "0");
      resetSupabaseBrowserClient();
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("password")) {
          setError("password", { message: "Contraseña incorrecta" });
        } else if (error.message.toLowerCase().includes("email")) {
          setError("email", { message: "Correo no encontrado" });
        } else {
          toast.error(error.message);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      }

      router.replace(nextPath);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <main className="w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <img
            src="/logo_sombrerito_check.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo.svg";
            }}
            alt="Sombrerito Check"
            className="h-16 w-auto object-contain"
          />
          <h1 className="mt-4 text-[28px] font-bold text-text-primary">Sombrerito Check</h1>
          <p className="mt-1 text-sm text-text-secondary">Admin Panel</p>
        </div>

        <div className="rounded-card border border-border bg-surface p-8 shadow-card">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Correo electrónico"
              placeholder="ejemplo@sombrerito.com"
              type="email"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              type="password"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  {...register("remember")}
                />
                Recordarme
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                Olvidé mi contraseña
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={submitting}
              icon={<LogIn size={18} />}
              iconPosition="right"
            >
              Iniciar sesión →
            </Button>
          </form>
        </div>

        <div className="mt-5 text-center text-sm text-text-secondary">
          ¿Necesitas ayuda?{" "}
          <a className="font-medium text-primary hover:underline" href="#">
            Contactar soporte
          </a>
        </div>

        <footer className="mt-10 flex items-center justify-center gap-3 text-xs text-[#9CA3AF]">
          <span>© 2026 Sombrerito Check</span>
        </footer>

        <div className="mt-4 text-center text-xs text-text-secondary/70">
          {remember ? "Sesión persistente activada" : "La sesión se cerrará al cerrar el navegador"}
        </div>
      </main>
    </div>
  );
}
