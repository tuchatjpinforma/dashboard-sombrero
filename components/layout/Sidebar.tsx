"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Ban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/conversaciones", label: "Conversaciones", icon: MessageSquare },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/bloqueados", label: "Bloqueados", icon: Ban },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, profile, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("sc_sidebar") === "1");
    } catch {}
  }, []);

  const canSeeAdmin = profile?.role === "admin";
  const canShowLinks = !!user;
  const items = useMemo(
    () =>
      navItems.filter((i) => {
        if (!canShowLinks) return i.href === "/dashboard" || i.href === "/dashboard/configuracion" || i.href === "/dashboard/conversaciones";
        return i.href.includes("/usuarios") || i.href.includes("/bloqueados") ? canSeeAdmin : true;
      }),
    [canSeeAdmin, canShowLinks],
  );

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem("sc_sidebar", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen sticky top-0 flex-col border-r border-border bg-surface",
        collapsed ? "w-16" : "w-[220px]",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link href="/dashboard" className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
          <img
            src="/logo_sombrerito_check.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo.svg";
            }}
            alt="Sombrerito Check"
            className="h-8 w-8 object-contain"
          />
          {!collapsed ? (
            <div className="leading-tight">
              <div className="text-sm font-bold text-primary">Sombrerito Check</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Admin Panel</div>
            </div>
          ) : null}
        </Link>
        <button
          type="button"
          className={cn("rounded-input p-2 text-text-secondary hover:bg-black/5", collapsed ? "hidden" : "")}
          onClick={toggleCollapsed}
          aria-label="Colapsar sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
        <button
          type="button"
          className={cn("rounded-input p-2 text-text-secondary hover:bg-black/5", collapsed ? "" : "hidden")}
          onClick={toggleCollapsed}
          aria-label="Expandir sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-input px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5",
                collapsed ? "justify-center" : "",
                active ? "bg-red-50 text-primary border-l-[3px] border-l-primary" : "text-text-secondary",
              )}
            >
              <Icon size={18} />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace("/login");
            router.refresh();
          }}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-input px-3 py-2 text-sm font-medium text-text-secondary hover:bg-black/5",
            collapsed ? "justify-center" : "",
          )}
        >
          <LogOut size={18} />
          {!collapsed ? <span>Cerrar sesión</span> : null}
        </button>
      </div>
    </aside>
  );
}
