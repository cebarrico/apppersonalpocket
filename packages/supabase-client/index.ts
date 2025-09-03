import { createClient } from "@supabase/supabase-js";
import { Database } from "./Database";

// Valores hardcoded para eliminar problemas de variáveis de ambiente

// Exportar uma instância padrão do Supabase (sem fallbacks)
const pkgSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pkgSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!pkgSupabaseUrl || !pkgSupabaseAnonKey) {
  throw new Error(
    "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas para @pocket-trainer-hub/supabase-client."
  );
}

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
