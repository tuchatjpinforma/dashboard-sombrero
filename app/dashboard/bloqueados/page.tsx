import { redirect } from "next/navigation";
import { Ban } from "lucide-react";
import Button from "@/components/ui/Button";
import CreateBlockModalClient from "@/components/bloqueados/CreateBlockModalClient";
import BlockedTable from "@/components/bloqueados/BlockedTable";
import { getProfile } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getBlockedPageData = unstable_cache(
  async () => {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("bloqueados_whatsapp")
      .select("id,whatsapp_id,user_name,user_number,motivo,mensaje_orig,fecha")
      .order("fecha", { ascending: false });

    const rows = ((data as any) ?? []).map((r: any) => ({
      id: r.id,
      whatsapp_id: r.whatsapp_id,
      user_name: r.user_name,
      user_number: r.user_number,
      motivo: r.motivo,
      mensaje_orig: r.mensaje_orig,
      fecha: r.fecha,
    }));

    return rows;
  },
  ["blocked-page-data"],
  { revalidate: 30 },
);

export default async function BloqueadosPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const rows = await getBlockedPageData();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Números bloqueados</h2>
            <p className="mt-1 text-sm text-text-secondary">Gestiona bloqueos activos y sus motivos.</p>
          </div>
          <span className="inline-flex items-center rounded-pill bg-red-50 px-2.5 py-1 text-xs font-semibold text-primary">
            {rows.length}
          </span>
        </div>
        <CreateBlockModalClient
          trigger={
            <Button variant="primary" icon={<Ban size={18} />}>
              + Nuevo bloqueo
            </Button>
          }
        />
      </div>

      <BlockedTable rows={rows} />
    </div>
  );
}
