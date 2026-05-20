"use client";

import { useAuth } from "@/hooks/useAuth";

export function useRole() {
  const { profile } = useAuth();
  return profile?.role ?? null;
}

