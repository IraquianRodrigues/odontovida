import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkApiRateLimit, checkLoginRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  // Rate limit: login (via auth callback)
  if (pathname.startsWith("/auth")) {
    const allowed = await checkLoginRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 1 minuto." },
        { status: 429 }
      );
    }
  }

  // Rate limit: API routes
  if (pathname.startsWith("/api")) {
    const allowed = await checkApiRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Limite de requisições excedido. Aguarde." },
        { status: 429 }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
