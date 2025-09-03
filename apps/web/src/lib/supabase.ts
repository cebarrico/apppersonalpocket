import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@pocket-trainer-hub/supabase-client";

// Configuração do Supabase (sem fallbacks para produção)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ajuda no dev: falha explicitamente se variáveis não estiverem configuradas
  throw new Error(
    "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Crie .env.local com essas chaves."
  );
}

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
