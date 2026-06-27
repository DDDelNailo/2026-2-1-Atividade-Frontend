import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Rotas que exigem autenticação
const protectedRoutes = ["/dashboard"];

// Rotas acessíveis apenas sem autenticação
const authRoutes = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // O token é salvo no localStorage (client-side), então usamos um cookie
  // que setaremos no lado cliente após o login.
  // O middleware verifica o cookie "accessToken".
  const token = request.cookies.get("accessToken")?.value;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
