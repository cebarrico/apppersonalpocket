import { createServerClient } from "@supabase/ssr";
import { Database } from "@pocket-trainer-hub/supabase-client";
import { cookies } from "next/headers";

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para uso no servidor (Server Components, Server Actions, etc.)
export const createServerComponentClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

// Cliente para uso em Route Handlers (API Routes)
export const createRouteHandlerClient = (request: Request) => {
  const response = new Response();

  return {
    supabase: createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return (
            request.headers
              .get("cookie")
              ?.split("; ")
              .map((cookie) => {
                const [name, value] = cookie.split("=");
                return { name, value };
              }) || []
          );
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append(
              "Set-Cookie",
              `${name}=${value}; ${Object.entries(options || {})
                .map(([key, val]) => `${key}=${val}`)
                .join("; ")}`
            );
          });
        },
      },
    }),
    response,
  };
};
