import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function DashboardPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get profile (for role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Welcome to Your Farm Overview
      </h1>

      <p className="text-gray-600 mb-4">
        Logged in as: {user?.email}
      </p>

      {/* ✅ Admin Button Only Visible To Admin */}
      {profile?.role === "admin" && (
        <div className="mb-6">
          <Link
            href="/admin"
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Soil Health</h2>
          <p className="text-gray-500">No data yet</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Weather Trends</h2>
          <p className="text-gray-500">No data yet</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">Recommendations</h2>
          <p className="text-gray-500">No insights yet</p>
        </div>
      </div>
    </div>
  )
}