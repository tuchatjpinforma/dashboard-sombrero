import DashboardShell from "@/components/layout/DashboardShell";
import { unstable_cache } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function getLimaDayParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return { y, m, d };
}

function limaDayRangeUtcIso(now: Date) {
  const { y, m, d } = getLimaDayParts(now);
  const start = new Date(`${y}-${m}-${d}T05:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

const getTopbarNotifications = unstable_cache(
  async () => {
    const supabase = getSupabaseAdminClient();
    const { startIso, endIso } = limaDayRangeUtcIso(new Date());

    const [{ count: newUsersToday }, { data: todayMessages }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startIso).lt("created_at", endIso),
      supabase
        .from("n8n_chatwhatsapp_histories")
        .select("message,created_at")
        .gte("created_at", startIso)
        .lt("created_at", endIso)
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    const bannedExact = new Set(
      [
        "hola",
        "buenos días",
        "buenas",
        "gracias",
        "ok",
        "si",
        "no",
        "sí",
        "buenas tardes",
        "buenas noches",
        "1",
        "2",
        "3",
        "4",
        "5",
        "perfecto",
        "entendido",
        "hasta luego",
      ].map((s) => s.toLowerCase().trim()),
    );

    const normalizeText = (input: unknown) => String(input ?? "").replace(/\s+/g, " ").trim();

    const extractPreguntaLimpia = (content: string) => {
      const m =
        content.match(/\*\*Mensaje.*?:\*\*\s*([\s\S]*?)(?:\n\n---|\n---\n|$)/i) ??
        content.match(/-\s*\*\*Mensaje.*?:\*\*\s*(.*)$/im);
      const raw = m?.[1] ? String(m[1]) : "";
      return normalizeText(raw.replace(/<\/?audio>|\n/g, " ").trim());
    };

    const normKey = (text: string) =>
      normalizeText(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);

    const freq = new Map<string, { text: string; count: number }>();
    ((todayMessages as any) ?? []).forEach((row: any) => {
      const msg = row?.message as any;
      if (msg?.type !== "human") return;
      const content = typeof msg?.content === "string" ? msg.content : "";
      if (!content || !content.includes("**Mensaje")) return;
      const pregunta = extractPreguntaLimpia(content);
      if (!pregunta) return;
      if (pregunta.includes("<audio>")) return;
      if (pregunta.length <= 8) return;
      if (bannedExact.has(pregunta.toLowerCase().trim())) return;
      const key = normKey(pregunta);
      if (!key) return;
      const cur = freq.get(key) ?? { text: pregunta.slice(0, 80), count: 0 };
      cur.count += 1;
      if (!cur.text) cur.text = pregunta.slice(0, 80);
      freq.set(key, cur);
    });

    let topQuestionToday: { text: string; count: number } | null = null;
    for (const v of freq.values()) {
      if (!topQuestionToday || v.count > topQuestionToday.count) topQuestionToday = { text: v.text, count: v.count };
    }

    return { newUsersToday: newUsersToday ?? 0, topQuestionToday };
  },
  ["topbar-notifications-v1"],
  { revalidate: 30 },
);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const notifications = await getTopbarNotifications();
  return <DashboardShell notifications={notifications}>{children}</DashboardShell>;
}
