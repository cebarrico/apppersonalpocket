import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // Verificar se há um usuário autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

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
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
