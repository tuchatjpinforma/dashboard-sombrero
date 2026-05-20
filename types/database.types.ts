export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "user";
          is_active: boolean;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "user";
          is_active?: boolean;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      intentos_bloqueados_whatsapp: {
        Row: {
          id: number;
          whatsapp_id: string | null;
          user_name: string | null;
          user_number: string | null;
          mensaje: string | null;
          fecha_intento: string | null;
        };
        Insert: {
          id?: number;
          whatsapp_id?: string | null;
          user_name?: string | null;
          user_number?: string | null;
          mensaje?: string | null;
          fecha_intento?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["intentos_bloqueados_whatsapp"]["Insert"]>;
        Relationships: [];
      };
      bloqueados_whatsapp: {
        Row: {
          id: number;
          whatsapp_id: string | null;
          user_name: string | null;
          user_number: string | null;
          motivo: string | null;
          mensaje_orig: string | null;
          fecha: string | null;
        };
        Insert: {
          id?: number;
          whatsapp_id?: string | null;
          user_name?: string | null;
          user_number?: string | null;
          motivo?: string | null;
          mensaje_orig?: string | null;
          fecha?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bloqueados_whatsapp"]["Insert"]>;
        Relationships: [];
      };
      intentos_bloqueados: {
        Row: {
          id: number;
          telegram_id: string | null;
          user_name: string | null;
          mensaje: string | null;
          fecha_intento: string | null;
        };
        Insert: {
          id?: number;
          telegram_id?: string | null;
          user_name?: string | null;
          mensaje?: string | null;
          fecha_intento?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["intentos_bloqueados"]["Insert"]>;
        Relationships: [];
      };
      n8n_chatwhatsapp_histories: {
        Row: {
          id: number;
          session_id: string | null;
          message: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          session_id?: string | null;
          message?: Json | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["n8n_chatwhatsapp_histories"]["Insert"]>;
        Relationships: [];
      };
      n8n_chat_histories: {
        Row: {
          id: number;
          session_id: string | null;
          message: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          session_id?: string | null;
          message?: Json | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["n8n_chat_histories"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export interface IntentoBloqueadoWhatsapp {
  id: number;
  whatsapp_id: string | null;
  user_name: string | null;
  user_number: string | null;
  mensaje: string | null;
  fecha_intento: string | null;
}

export interface BloqueadoWhatsapp {
  id: number;
  whatsapp_id: string | null;
  user_name: string | null;
  user_number: string | null;
  motivo: string | null;
  mensaje_orig: string | null;
  fecha: string | null;
}

export interface IntentoBloqueadoTelegram {
  id: number;
  telegram_id: string | null;
  user_name: string | null;
  mensaje: string | null;
  fecha_intento: string | null;
}

export interface N8nChatWhatsappHistory {
  id: number;
  session_id: string | null;
  message: { type: "human" | "ai"; content: string } | any;
  created_at: string | null;
}

export interface N8nChatHistory {
  id: number;
  session_id: string | null;
  message: { type: "human" | "ai"; content: string } | any;
  created_at: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string | null;
}

export const formatPhone = (num: string): string => {
  const s = String(num ?? "").replace(/\D/g, "");
  if (s.length < 6) return num;
  return `+${s.slice(0, 2)} ${s[2]}XX XXX X${s.slice(-2)}`;
};

export const extractNumberFromWhatsappId = (whatsappId: string): string =>
  String(whatsappId ?? "").replace("@s.whatsapp.net", "");
