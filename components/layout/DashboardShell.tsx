"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const titleByPath: Array<{ prefix: string; title: string }> = [
  { prefix: "/dashboard/usuarios", title: "Usuarios" },
  { prefix: "/dashboard/bloqueados", title: "Bloqueados" },
  { prefix: "/dashboard/configuracion", title: "Configuración" },
  { prefix: "/dashboard/conversaciones", title: "Conversaciones" },
  { prefix: "/dashboard", title: "Dashboard" },
];

export default function DashboardShell({
  children,
  notifications,
}: {
  children: ReactNode;
  notifications?: { newUsersToday: number; topFaqToday: { categoria: string; cantidad: number } | null };
}) {
  const pathname = usePathname();
  const title = titleByPath.find((t) => pathname.startsWith(t.prefix))?.title ?? "Dashboard";
  const { refreshProfile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("sc_sidebar") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, [refreshProfile]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem("sc_sidebar", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const collapseButtonLeft = useMemo(() => (collapsed ? 64 : 220), [collapsed]);

  return (
    <div className="min-h-screen bg-background text-text-primary md:flex relative">
      <Sidebar collapsed={collapsed} />
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        className="hidden md:flex fixed top-8 -translate-y-1/2 -translate-x-1/2 z-50 h-8 w-8 items-center justify-center rounded-pill border border-border bg-surface text-text-secondary shadow-card hover:bg-black/5"
        style={{ left: collapseButtonLeft }}
      >
        <span className="text-sm font-semibold">{collapsed ? ">" : "<"}</span>
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} notifications={notifications} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
