"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Ban } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createBlockAction } from "@/app/dashboard/bloqueados/actions";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

const schema = z.object({
  user_number: z.string().min(6, "Ingresa un número válido"),
  motivo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateBlockModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { user_number: "", motivo: "Sistema Automático" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createBlockAction({
        user_number: values.user_number,
        motivo: values.motivo ?? null,
      });
      toast.success("Número bloqueado");
      close();
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo bloquear");
    }
  };

  return (
    <Modal
      open={open}
      title="Nuevo bloqueo"
      subtitle="Bloquea un número para evitar que se contacte con el sistema."
      icon={<Ban size={18} />}
      onClose={close}
      maxWidthClassName="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Bloquear
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="NÚMERO DE TELÉFONO"
          placeholder="51950134814"
          error={errors.user_number?.message}
          {...register("user_number")}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">MOTIVO</label>
          <select
            className="h-12 w-full rounded-input border border-border bg-surface px-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            {...register("motivo")}
          >
            <option value="Spam">Spam</option>
            <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
            <option value="Sistema Automático">Sistema Automático</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
