import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  // 🔐 1. Require authentication for protected routes
  if (!user) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return res
  }

  // 🔎 2. Fetch profile once
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription_status")
    .eq("id", user.id)
    .single()

  // Safety fallback
  if (!profile) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 🔒 3. Admin protection
  if (pathname.startsWith("/admin")) {
    if (profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // 💳 4. Subscription protection (clients only)
  if (pathname.startsWith("/dashboard")) {
    if (
      profile.role === "client" &&
      profile.subscription_status !== "active"
    ) {
      return NextResponse.redirect(new URL("/inactive", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}