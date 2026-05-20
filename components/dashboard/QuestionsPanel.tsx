"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Droplets,
  FileText,
  Flag,
  GraduationCap,
  Heart,
  Home,
  MessageCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  User,
  Vote,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function QuestionsPanel({
  categories,
}: {
  categories: Array<{
    categoria: string;
    cantidad: number;
    ejemplos: string[];
    ultima_vez: string | null;
  }>;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const maxCantidad = useMemo(() => categories.reduce((m, c) => Math.max(m, c.cantidad), 0), [categories]);

  const iconFor = (categoria: string) => {
    const key = categoria.toLowerCase();
    if (key.includes("venezuela") || key.includes("dictadura")) return <AlertTriangle size={16} className="text-red-600" />;
    if (key.includes("expro")) return <Home size={16} className="text-red-600" />;
    if (key.includes("ahorro") || key.includes("dinero")) return <DollarSign size={16} className="text-amber-600" />;
    if (key.includes("comun")) return <Flag size={16} className="text-orange-600" />;
    if (key.includes("propiedad") || key.includes("negocio")) return <Building2 size={16} className="text-blue-600" />;
    if (key.includes("terror")) return <ShieldAlert size={16} className="text-red-600" />;
    if (key.includes("roberto")) return <User size={16} className="text-green-700" />;
    if (key.includes("constit")) return <FileText size={16} className="text-blue-600" />;
    if (key.includes("salud")) return <Heart size={16} className="text-green-700" />;
    if (key.includes("educ")) return <GraduationCap size={16} className="text-blue-600" />;
    if (key.includes("seguridad")) return <Shield size={16} className="text-blue-600" />;
    if (key.includes("eleccion") || key.includes("voto")) return <Vote size={16} className="text-green-700" />;
    if (key.includes("keiko") || key.includes("fuj")) return <XCircle size={16} className="text-orange-600" />;
    if (key.includes("agua") || key.includes("recurso")) return <Droplets size={16} className="text-blue-600" />;
    return <MessageCircle size={16} className="text-text-secondary" />;
  };

  const items = categories.slice(0, 6);
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Preguntas frecuentes</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => {
              startTransition(() => router.refresh());
            }}
            disabled={pending}
          >
            Actualizar
          </button>
          <Link href="/dashboard/conversaciones" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((c) => {
          const isOpen = expanded === c.categoria;
          const percent = maxCantidad > 0 ? Math.round((c.cantidad / maxCantidad) * 100) : 0;
          return (
            <div key={c.categoria} className="space-y-2">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 rounded-input p-2 text-left hover:bg-black/5"
                onClick={() => setExpanded((v) => (v === c.categoria ? null : c.categoria))}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-[2px] shrink-0">{iconFor(c.categoria)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-text-primary">{c.categoria}</div>
                    <div className="mt-2 h-2 w-full rounded-pill bg-gray-100">
                      <div
                        className="h-2 rounded-pill bg-secondary"
                        style={{ width: `${Math.max(6, Math.min(100, percent))}%` }}
                      />
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-pill bg-gray-100 px-2.5 py-1 text-center text-xs font-semibold text-text-secondary tabular-nums",
                    "min-w-[2.25rem]",
                  )}
                >
                  {c.cantidad}
                </span>
              </button>
              {isOpen ? (
                <div className="rounded-input border border-border bg-surface p-3 text-sm text-text-secondary">
                  {c.ejemplos.length === 0 ? (
                    <div>Sin ejemplos.</div>
                  ) : (
                    <ul className="list-disc space-y-1 pl-5">
                      {c.ejemplos.slice(0, 6).map((e, idx) => (
                        <li key={`${c.categoria}-${idx}`}>“{e}”</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
        {items.length === 0 ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">Sin datos todavía.</p>
            <Button
              variant="outline"
              size="sm"
              loading={pending}
              icon={<RefreshCw size={16} />}
              onClick={() => startTransition(() => router.refresh())}
            >
              Actualizar
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
