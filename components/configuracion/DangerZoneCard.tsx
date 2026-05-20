"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deleteAccountAction } from "@/app/dashboard/configuracion/actions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function DangerZoneCard() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [pending, startTransition] = useTransition();

  const userId = user?.id;

  return (
    <>
      <div className="rounded-card border border-dashed border-red-300 bg-surface p-5 shadow-card">
        <h3 className="text-lg font-bold text-primary">Zona de peligro</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Eliminar tu cuenta es permanente. Perderás el acceso al panel.
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-red-50"
            onClick={() => setStep(1)}
            disabled={!userId || pending}
          >
            Eliminar cuenta permanentemente
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={step === 1}
        title="Confirmar acción"
        message="¿Eliminar cuenta permanentemente? Esta acción no se puede deshacer."
        highlightedText="Eliminar cuenta permanentemente"
        onCancel={() => setStep(0)}
        onConfirm={() => setStep(2)}
        confirmText="Continuar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        open={step === 2}
        title="Confirmar acción"
        message="Última confirmación: ¿deseas eliminar tu cuenta ahora?"
        highlightedText="eliminar tu cuenta"
        onCancel={() => setStep(0)}
        onConfirm={() => {
          if (!userId) return;
          startTransition(async () => {
            try {
              await deleteAccountAction({ id: userId });
              toast.success("Cuenta eliminada");
              await signOut();
              router.replace("/login");
            } catch (e: any) {
              toast.error(e?.message ?? "No se pudo eliminar");
            } finally {
              setStep(0);
            }
          });
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
