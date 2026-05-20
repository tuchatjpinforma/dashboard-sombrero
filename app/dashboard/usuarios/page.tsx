import { redirect } from "next/navigation";
import { UserPlus, Users, Shield, Activity, CalendarPlus } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import CreateUserModalClient from "@/components/usuarios/CreateUserModalClient";
import UserTable from "@/components/usuarios/UserTable";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getUsersPageData = unstable_cache(
  async () => {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,email,role,created_at,is_active")
      .order("created_at", { ascending: false });

    const rows = (data as any) ?? [];
    const total = rows.length;
    const admins = rows.filter((u: any) => u.role === "admin").length;
    const activos = rows.filter((u: any) => u.is_active).length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const nuevos = rows.filter((u: any) => (u.created_at ? new Date(u.created_at).getTime() >= monthStart : false)).length;

    return { rows, total, admins, activos, nuevos };
  },
  ["users-page-data"],
  { revalidate: 30 },
);

export default async function UsuariosPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { rows, total, admins, activos, nuevos } = await getUsersPageData();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Usuarios del sistema</h2>
          <p className="mt-1 text-sm text-text-secondary">Gestiona accesos, roles y estado de usuarios.</p>
        </div>
        <CreateUserModalClient
          trigger={
            <Button variant="primary" icon={<UserPlus size={18} />}>
              Crear usuario
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total usuarios" value={total.toLocaleString("es-PE")} icon={<Users size={18} />} iconColorClassName="text-text-secondary" />
        <StatCard label="Administradores" value={admins.toLocaleString("es-PE")} icon={<Shield size={18} />} iconColorClassName="text-primary" />
        <StatCard label="Activos ahora" value={activos.toLocaleString("es-PE")} icon={<Activity size={18} />} iconColorClassName="text-secondary" />
        <StatCard label="Nuevos este mes" value={nuevos.toLocaleString("es-PE")} icon={<CalendarPlus size={18} />} iconColorClassName="text-text-secondary" />
      </div>

      <UserTable rows={rows} />
    </div>
  );
}
