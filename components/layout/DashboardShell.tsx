"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";
import { useEffect } from "react";
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
  notifications?: { newUsersToday: number; topQuestionToday: { text: string; count: number } | null };
}) {
  const pathname = usePathname();
  const title = titleByPath.find((t) => pathname.startsWith(t.prefix))?.title ?? "Dashboard";
  const { refreshProfile } = useAuth();

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, [refreshProfile]);

  return (
    <div className="min-h-screen bg-background text-text-primary md:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} notifications={notifications} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
