import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@pocket-trainer-hub/supabase-client";

// Configuração do Supabase com fallbacks não sensíveis (para evitar quebra no build)
// Em produção, configure as variáveis na Vercel para que os fallbacks não sejam usados.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Cliente para uso no browser (lado cliente)
export const createClientComponentClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Cliente para uso direto (compatibilidade com código existente)
export const supabase = createClientComponentClient();

// Exportar configuração para uso em outros lugares
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};
