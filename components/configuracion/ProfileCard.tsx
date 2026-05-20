"use client";

import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileCard() {
  const { profile, user } = useAuth();
  const name = profile?.full_name ?? "—";
  const email = profile?.email ?? user?.email ?? "—";
  const role = profile?.role ?? "user";
  const initials = (name !== "—" ? name : email)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-pill border border-border bg-black/5 overflow-hidden flex items-center justify-center">
          <span className="text-lg font-bold text-text-secondary">{initials || "SC"}</span>
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-text-primary">{name}</div>
          <div className="mt-1 text-sm text-text-secondary truncate">{email}</div>
          <div className="mt-3">
            <Badge variant={role === "admin" ? "ok" : "user"}>{role === "admin" ? "Admin" : "Usuario"}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
