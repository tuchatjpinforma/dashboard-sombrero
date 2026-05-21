"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Topbar({
  title,
  onMenu,
  notifications,
}: {
  title: string;
  onMenu?: () => void;
  notifications?: {
    newUsersToday: number;
    topFaqToday: { categoria: string; cantidad: number } | null;
  };
}) {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpenUserMenu(false);
    };
    if (openUserMenu) {
      window.addEventListener("mousedown", onDown);
    }
    return () => window.removeEventListener("mousedown", onDown);
  }, [openUserMenu]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = notifRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpenNotif(false);
    };
    if (openNotif) {
      window.addEventListener("mousedown", onDown);
    }
    return () => window.removeEventListener("mousedown", onDown);
  }, [openNotif]);

  const newUsersToday = notifications?.newUsersToday ?? 0;
  const topFaq = notifications?.topFaqToday ?? null;
  const hasNotif = newUsersToday > 0 || !!topFaq;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        {onMenu ? (
          <button
            type="button"
            className="md:hidden rounded-pill p-2 text-text-secondary hover:bg-black/5"
            aria-label="Abrir menú"
            onClick={onMenu}
          >
            <Menu size={20} />
          </button>
        ) : null}
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className="relative rounded-pill p-2 text-text-secondary hover:bg-black/5"
            aria-label="Notificaciones"
            onClick={() => setOpenNotif((v) => !v)}
          >
            <Bell size={18} />
            {hasNotif ? <span className="absolute right-2 top-2 h-2 w-2 rounded-pill bg-primary" /> : null}
          </button>
          {openNotif ? (
            <div className="absolute right-0 top-11 z-50 w-72 rounded-card border border-border bg-surface p-3 shadow-card">
              <div className="text-sm font-semibold text-text-primary">Resumen</div>
              <div className="mt-2 space-y-2 text-sm text-text-secondary">
                <div className="flex items-center justify-between gap-3">
                  <span>Nuevos usuarios hoy</span>
                  <span className="tabular-nums font-semibold text-text-primary">{newUsersToday}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <span>Pregunta más repetida</span>
                    <span className="tabular-nums font-semibold text-text-primary">{topFaq?.cantidad ?? 0}</span>
                  </div>
                  <div className="text-xs text-text-secondary">{topFaq?.categoria ? topFaq.categoria : "—"}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="h-9 w-9 overflow-hidden rounded-pill border border-border bg-surface flex items-center justify-center hover:bg-black/5"
            aria-label="Menú de usuario"
            onClick={() => setOpenUserMenu((v) => !v)}
          >
            <span className="text-xs font-bold text-text-secondary">{initials}</span>
          </button>
          {openUserMenu ? (
            <div className="absolute right-0 top-11 z-50 w-52 rounded-card border border-border bg-surface p-2 shadow-card">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-input px-3 py-2 text-sm font-medium text-text-secondary hover:bg-black/5"
                onClick={async () => {
                  setOpenUserMenu(false);
                  await signOut();
                  router.replace("/login");
                  router.refresh();
                }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
