"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, resetSupabaseBrowserClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { getMyProfileAction } from "@/app/actions/profile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  signingOut: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabaseBrowserClient> | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user ?? null);

    if (!user?.id) {
      setProfile(null);
      return;
    }

    setSigningOut(false);

    try {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name,role,is_active,created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile((data as any) ?? null);
        return;
      }
    } catch {}

    try {
      const data = await getMyProfileAction();
      setProfile((data as any) ?? null);
    } catch {
      setProfile(null);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setSigningOut(true);
    await supabase.auth.signOut();
    resetSupabaseBrowserClient();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  useEffect(() => {
    setSupabase(getSupabaseBrowserClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    (async () => {
      try {
        await refreshProfile();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      refreshProfile()
        .catch(() => {})
        .finally(() => setLoading(false));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [refreshProfile, supabase]);

  const value: AuthContextValue = {
    loading,
    user,
    profile,
    signingOut,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}
