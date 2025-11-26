// middleware.js (Server-side auth check)
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const authRoutes = ["/signin", "/signup"];
  const protectedRoutes = [
    "/dashboard",
    "/transactions",
    "/categories",
    "/budgets",
  ];

  console.log(
    "Middleware - User:",
    user ? "Authenticated" : "Not authenticated"
  );
  console.log("Current path:", pathname);

  // Agar user authenticated hai
  if (user) {
    // Aur auth route par ja raha hai
    if (authRoutes.includes(pathname)) {
      console.log("Redirecting authenticated user to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // Agar user not authenticated hai aur protected route par ja raha hai
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      console.log("Redirecting unauthenticated user to signin");
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/budgets/:path*",
    "/signin",
    "/signup",
  ],
};
