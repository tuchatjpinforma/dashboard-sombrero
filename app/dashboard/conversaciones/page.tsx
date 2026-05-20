import ConversationsExplorer from "@/components/dashboard/ConversationsExplorer";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getConversationsData = unstable_cache(
  async () => {
    const supabase = getSupabaseAdminClient();

    const { data: bloqueadosIds } = await supabase.from("bloqueados_whatsapp").select("user_number");
    const bloqueadosSet = new Set(((bloqueadosIds as any) ?? []).map((b: any) => String(b.user_number ?? "")));

    const { data: ultimas } = await supabase
      .from("n8n_chatwhatsapp_histories")
      .select("session_id,message,created_at")
      .order("created_at", { ascending: false })
      .limit(320);

    const bySession = new Map<string, { session_id: string; last_at: string | null; preview: string }>();
    const previewBySession = new Map<string, string>();

    const normalizeText = (input: unknown) =>
      String(input ?? "")
        .replace(/\s+/g, " ")
        .trim();

    ((ultimas as any) ?? []).forEach((row: any) => {
      const sessionId = row?.session_id ? String(row.session_id) : "";
      if (!sessionId) return;
      if (!bySession.has(sessionId)) {
        bySession.set(sessionId, { session_id: sessionId, last_at: row.created_at ?? null, preview: "" });
      }
      const m = row?.message;
      const content = normalizeText(m?.content);
      if (!previewBySession.has(sessionId) && m?.type === "human" && content) {
        previewBySession.set(sessionId, content.slice(0, 180));
      }
    });

    for (const [sessionId, v] of bySession.entries()) {
      v.preview = previewBySession.get(sessionId) ?? "";
    }

    const sessions = Array.from(bySession.values())
      .sort((a, b) => (b.last_at ?? "").localeCompare(a.last_at ?? ""))
      .map((s) => ({ ...s, blocked: bloqueadosSet.has(s.session_id) }));

    return sessions;
  },
  ["conversations-data"],
  { revalidate: 30 },
);

export default async function ConversacionesPage() {
  const sessions = await getConversationsData();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Conversaciones</h2>
        <p className="mt-1 text-sm text-text-secondary">Sesiones únicas de WhatsApp ordenadas por última actividad.</p>
      </div>
      <ConversationsExplorer sessions={sessions} />
    </div>
  );
}
