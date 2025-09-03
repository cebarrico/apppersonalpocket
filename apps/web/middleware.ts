import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Verificar se as variáveis de ambiente estão disponíveis
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Variáveis de ambiente do Supabase não configuradas no middleware"
    );
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Verificar se há um usuário autenticado (com try/catch para produção)
  let session = null;
  try {
    const {
      data: { session: userSession },
    } = await supabase.auth.getSession();
    session = userSession;
  } catch (error) {
    console.error("Erro ao verificar sessão no middleware:", error);
    return NextResponse.next();
  }

  // Rotas que requerem autenticação
  const protectedRoutes = ["/student-dashboard", "/teacher-dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Rotas que são apenas para usuários não autenticados
  const publicOnlyRoutes = ["/login"];
  const isPublicOnlyRoute = publicOnlyRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirecionar usuários não autenticados para login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirecionar usuários autenticados para dashboard
  if (isPublicOnlyRoute && session) {
    try {
      // Buscar o perfil do usuário para determinar o dashboard correto
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const dashboardUrl =
        userProfile?.role === "teacher"
          ? "/teacher-dashboard"
          : "/student-dashboard";

      const redirectUrl = new URL(dashboardUrl, request.url);
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário no middleware:", error);
      // Em caso de erro, redirecionar para dashboard padrão
      const redirectUrl = new URL("/student-dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match specific paths that need authentication
     */
    "/login",
    "/student-dashboard/:path*",
    "/teacher-dashboard/:path*",
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
