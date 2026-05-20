"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ban, LayoutDashboard, MessageSquare, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/conversaciones", label: "Chats", icon: MessageSquare },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/dashboard/bloqueados", label: "Bloq.", icon: Ban, adminOnly: true },
  { href: "/dashboard/configuracion", label: "Ajustes", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
        {items
          .filter((i) => (!i.adminOnly ? true : isAdmin))
          .map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 rounded-input py-2 text-xs font-medium",
                  active ? "text-primary" : "text-text-secondary",
                )}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
      </div>
    </nav>
  );
}

