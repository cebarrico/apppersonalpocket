import { createClient } from "@supabase/supabase-js";
import { Database } from "./Database";

// Valores hardcoded para eliminar problemas de variáveis de ambiente

// Exportar uma instância padrão do Supabase com fallbacks não sensíveis
// Em produção, configure as variáveis no ambiente para não usar estes fallbacks
const pkgSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co";
const pkgSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient<Database>(
  pkgSupabaseUrl,
  pkgSupabaseAnonKey
);
// Criar cliente Supabase tipado
export const createSupabaseClient = (url: string, anonKey: string) => {
  return createClient<Database>(url, anonKey);
};

// Exportar tipos e services para uso na aplicação
export * from "./types";
export * from "./Database";
export * from "./services";
