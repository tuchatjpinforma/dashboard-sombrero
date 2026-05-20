import { AlertTriangle, Circle, Slash, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { unstable_cache } from "next/cache";
import StatCard from "@/components/ui/StatCard";
import QuestionsPanel from "@/components/dashboard/QuestionsPanel";
import VolumeChart from "@/components/dashboard/VolumeChart";
import ConversationsTable from "@/components/dashboard/ConversationsTable";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function relTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
}

function dayRangeUtc(date: Date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const start = new Date(Date.UTC(y, m, d, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, d, 23, 59, 59));
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function normalizeText(input: unknown) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlaceholderText(text: string) {
  const t = normalizeText(text);
  if (!t) return true;
  if (/^_+$/.test(t)) return true;
  if (/^\[object Object\]$/i.test(t)) return true;
  if (/^(human|ai|user|assistant)$/i.test(t)) return true;
  return false;
}

const getDashboardData = unstable_cache(
  async (dayKey: string) => {
    const supabase = getSupabaseAdminClient();
    const today = new Date(`${dayKey}T12:00:00.000Z`);
    const { startIso: hoyInicio, endIso: hoyFin } = dayRangeUtc(today);

    const extractMessageText = (message: any): string => {
      const preferredKeys = [
        "content",
        "text",
        "body",
        "message",
        "caption",
        "prompt",
        "respuesta",
        "output",
        "input",
      ] as const;

      const walk = (value: any, depth: number): string => {
        if (depth > 6 || value == null) return "";
        if (typeof value === "string") {
          const s = normalizeText(value);
          if (!s || /^_+$/.test(s) || /^\[object Object\]$/i.test(s)) return "";
          if (s.startsWith("{") || s.startsWith("[")) {
            try {
              return walk(JSON.parse(s), depth + 1);
            } catch {
              return s;
            }
          }
          return s;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            const found = walk(item, depth + 1);
            if (found) return found;
          }
          return "";
        }
        if (typeof value === "object") {
          for (const k of preferredKeys) {
            if (k in value) {
              const found = walk((value as any)[k], depth + 1);
              if (found) return found;
            }
          }
          for (const v of Object.values(value)) {
            const found = walk(v, depth + 1);
            if (found) return found;
          }
          return "";
        }
        return "";
      };

      return walk(message, 0);
    };

    const [{ count: totalBloqueados }, { count: intentosWhatsappHoy }, { count: intentosTelegramHoy }] = await Promise.all([
      supabase.from("bloqueados_whatsapp").select("*", { count: "exact", head: true }),
      supabase
        .from("intentos_bloqueados_whatsapp")
        .select("*", { count: "exact", head: true })
        .gte("fecha_intento", hoyInicio),
      supabase.from("intentos_bloqueados").select("*", { count: "exact", head: true }).gte("fecha_intento", hoyInicio),
    ]);

    const { data: bloqueadosIds } = await supabase.from("bloqueados_whatsapp").select("user_number");
    const bloqueadosNumbers = ((bloqueadosIds as any) ?? [])
      .map((b: any) => String(b.user_number ?? ""))
      .filter(Boolean);

    const { data: sesionesUnicasData } = await supabase
      .from("n8n_chatwhatsapp_histories")
      .select("session_id")
      .not("session_id", "is", null);
    const totalConversaciones = new Set(((sesionesUnicasData as any) ?? []).map((r: any) => String(r.session_id))).size;

    const { data: activosHoyData } = await supabase
      .from("n8n_chatwhatsapp_histories")
      .select("session_id")
      .gte("created_at", hoyInicio)
      .lt("created_at", hoyFin);
    const activosHoy = new Set(((activosHoyData as any) ?? []).map((r: any) => String(r.session_id))).size;

    const { data: ultimasRaw } = await supabase
      .from("n8n_chatwhatsapp_histories")
      .select("session_id,message,created_at")
      .order("created_at", { ascending: false })
      .limit(600);

    const latestBySession = new Map<string, { session_id: string; created_at: string | null; preview: string }>();
    const previewBySession = new Map<string, string>();

    ((ultimasRaw as any) ?? []).forEach((row: any) => {
      const sessionId = row?.session_id ? String(row.session_id) : "";
      if (!sessionId) return;
      if (!latestBySession.has(sessionId)) {
        latestBySession.set(sessionId, { session_id: sessionId, created_at: row.created_at ?? null, preview: "" });
      }

      const m = row?.message as any;
      const content = extractMessageText(m);
      if (!previewBySession.has(sessionId) && content && !isPlaceholderText(content)) {
        previewBySession.set(sessionId, content.slice(0, 180));
      }
    });

    for (const [sessionId, value] of latestBySession.entries()) {
      value.preview = previewBySession.get(sessionId) ?? "";
    }

    const latestSessions = Array.from(latestBySession.values())
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
      .slice(0, 60);

    const { data: mensajesHoyRaw } = await supabase
      .from("n8n_chatwhatsapp_histories")
      .select("session_id,created_at")
      .gte("created_at", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })
      .limit(20000);

    const dateKey = (iso: string) => iso.slice(0, 10);
    const daySessions = new Map<string, Set<string>>();
    ((mensajesHoyRaw as any) ?? []).forEach((m: any) => {
      const createdAt = m?.created_at ? String(m.created_at) : "";
      const sessionId = m?.session_id ? String(m.session_id) : "";
      if (!createdAt || !sessionId) return;
      const key = dateKey(createdAt);
      const set = daySessions.get(key) ?? new Set<string>();
      set.add(sessionId);
      daySessions.set(key, set);
    });

    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      last7Days.push(d.toISOString().slice(0, 10));
    }

    const perDay = last7Days.map((k) => ({ day: k, count: daySessions.get(k)?.size ?? 0 }));
    const maxDay = perDay.sort((a, b) => b.count - a.count)[0]?.day ?? "";
    const volumeData = perDay.map((d) => {
      const [y, m, dd] = d.day.split("-");
      return { label: `${dd}/${m}`, value: d.count, highlight: d.day === maxDay };
    });

    const intentosHoy = (intentosWhatsappHoy ?? 0) + (intentosTelegramHoy ?? 0);

    return {
      totalConversaciones,
      activosHoy,
      totalBloqueados: totalBloqueados ?? 0,
      intentosHoy,
      bloqueadosNumbers,
      latestSessions,
      volumeData,
    };
  },
  ["dashboard-data-base-v1"],
  { revalidate: 30 },
);

async function getFaqCategories() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("n8n_chatwhatsapp_histories")
    .select("session_id,message,created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) throw new Error(error.message);

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

  const extractPreguntaLimpia = (content: string) => {
    const m =
      content.match(/\*\*Mensaje.*?:\*\*\s*([\s\S]*?)(?:\n\n---|\n---\n|$)/i) ??
      content.match(/-\s*\*\*Mensaje.*?:\*\*\s*(.*)$/im);
    const raw = m?.[1] ? String(m[1]) : "";
    return normalizeText(raw.replace(/<\/?audio>|\n/g, " ").trim());
  };

  const categorize = (pregunta: string) => {
    const p = pregunta.toLowerCase();
    if (/(cuba|venezuela|nicaragua|bolivia|dictadura|régimen|regimen|chavez|maduro|castrismo)/i.test(p))
      return "Venezuela / Dictadura";
    if (/(expropiar|expropiación|expropiacion|confiscar|quitarme|quitar.*casa|quitar.*auto|quitar.*ahorro|quitarán|quitaran|se van a quedar)/i.test(p))
      return "Expropiaciones";
    if (/(ahorro|banco|dinero|plata|dólar|dolar|sueldo|pensión|pension|afp|ahorros)/i.test(p))
      return "Ahorros / Dinero";
    if (/(comunismo|comunista|socialismo|socialista|marxismo|marxista|izquierda radical)/i.test(p))
      return "Comunismo / Socialismo";
    if (/(propiedad|casa|terreno|inmueble|negocio|empresa|mype)/i.test(p)) return "Propiedad / Negocios";
    if (/(antauro|humala|ollanta|movadef|sendero|terroris|terruco|terruqueo)/i.test(p)) return "Terrorismo / Terruqueo";
    if (/(roberto sánchez|roberto sanchez|candidato|quién es|quien es)/i.test(p)) return "Roberto Sánchez";
    if (/(constitución|constitucion|asamblea|nueva constitución|nueva constitucion|carta magna)/i.test(p))
      return "Nueva Constitución";
    if (/(salud|hospital|essalud|médico|medico|medicamento|seguro)/i.test(p)) return "Salud";
    if (/(educación|educacion|colegio|universidad|escuela|profesor|maestro)/i.test(p)) return "Educación";
    if (/(seguridad|crimen|delincuencia|robo|policia|policía)/i.test(p)) return "Seguridad Ciudadana";
    if (/(votar|voto|viciado|elección|eleccion|elecciones|segunda vuelta)/i.test(p)) return "Elecciones / Voto";
    if (/(keiko|fujimori|señora k|senora k|fujimorismo|naranja|fuerza popular)/i.test(p)) return "Keiko / Fujimorismo";
    if (/(agua|río|rio|minería|mineria|medio ambiente|recursos naturales)/i.test(p)) return "Agua / Recursos";
    return "Otras consultas";
  };

  const byCategoria = new Map<
    string,
    { cantidad: number; ejemplos: Array<{ text: string; createdAt: string }>; ultima_vez: string | null }
  >();

  ((data as any) ?? []).forEach((row: any) => {
    const msg = row?.message as any;
    if (msg?.type !== "human") return;
    const content = typeof msg?.content === "string" ? msg.content : "";
    if (!content || !content.includes("**Mensaje")) return;

    const pregunta = extractPreguntaLimpia(content);
    if (!pregunta) return;
    if (pregunta.includes("<audio>")) return;
    if (pregunta.length <= 8) return;
    if (bannedExact.has(pregunta.toLowerCase().trim())) return;

    const categoria = categorize(pregunta);
    const createdAt = row?.created_at ? String(row.created_at) : "";
    const current = byCategoria.get(categoria) ?? { cantidad: 0, ejemplos: [], ultima_vez: null };
    current.cantidad += 1;
    if (createdAt) {
      if (!current.ultima_vez || createdAt > current.ultima_vez) current.ultima_vez = createdAt;
      current.ejemplos.push({ text: pregunta.slice(0, 80), createdAt });
    } else {
      current.ejemplos.push({ text: pregunta.slice(0, 80), createdAt: "" });
    }
    byCategoria.set(categoria, current);
  });

  const rows = Array.from(byCategoria.entries()).map(([categoria, v]) => ({
    categoria,
    cantidad: v.cantidad,
    ejemplos: v.ejemplos
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .map((e) => e.text)
      .slice(0, 10),
    ultima_vez: v.ultima_vez,
  }));

  const otras = rows.find((r) => r.categoria === "Otras consultas");
  const noOtras = rows.filter((r) => r.categoria !== "Otras consultas");
  noOtras.sort((a, b) => b.cantidad - a.cantidad);
  return otras ? [...noOtras, otras] : noOtras;
}

export default async function DashboardPage() {
  const dayKey = new Date().toISOString().slice(0, 10);
  const data = await getDashboardData(dayKey);
  const faqCategories = await getFaqCategories();
  const bloqueadosSet = new Set<string>((data as any).bloqueadosNumbers ?? []);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Conversaciones"
          value={data.totalConversaciones.toLocaleString("es-PE")}
          subtitle="Total"
          icon={<TrendingUp size={18} />}
          iconColorClassName="text-secondary"
          rightElement={
            <span className="inline-flex items-center gap-1 rounded-pill bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
              <TrendingUp size={14} /> +12%
            </span>
          }
        />
        <StatCard
          label="Activos hoy"
          value={data.activosHoy.toLocaleString("es-PE")}
          subtitle="En línea"
          icon={<Circle size={18} />}
          iconColorClassName="text-secondary"
          rightElement={
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-secondary opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-pill bg-secondary" />
            </span>
          }
        />
        <StatCard
          label="Bloqueados"
          value={data.totalBloqueados.toLocaleString("es-PE")}
          subtitle="Usuarios"
          icon={<Slash size={18} />}
          iconColorClassName="text-primary"
          accentLeft
        />
        <StatCard
          label="Intentos bloqueados"
          value={data.intentosHoy.toLocaleString("es-PE")}
          subtitle="Hoy"
          icon={<AlertTriangle size={18} />}
          iconColorClassName="text-amber-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <QuestionsPanel categories={faqCategories} />
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Conversaciones por día</h3>
            </div>
            <VolumeChart data={data.volumeData} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <ConversationsTable
            rows={data.latestSessions.map((c) => ({
              id: c.session_id,
              session_id: c.session_id,
              preview: c.preview,
              status: bloqueadosSet.has(c.session_id) ? "blocked" : "in_progress",
              relativeTime: relTime(c.created_at),
            }))}
          />
        </div>
      </div>

    </div>
  );
}
