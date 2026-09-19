import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_PUBLICAS = ["/login", "/auth"];

function redirigir(request: NextRequest, ruta: string, supabaseResponse: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = ruta;
  url.search = "";
  const response = NextResponse.redirect(url);
  // Conserva las cookies de sesión refrescadas.
  supabaseResponse.cookies.getAll().forEach((c) => response.cookies.set(c));
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() valida el token contra Supabase (getSession() no lo hace).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esPublica = RUTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!user && !esPublica) return redirigir(request, "/login", supabaseResponse);
  if (user && pathname === "/login") return redirigir(request, "/test", supabaseResponse);

  return supabaseResponse;
}
