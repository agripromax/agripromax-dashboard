import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import LogoutButton from "../logout-button"

export default async function ProfilePage() {
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

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
  <div className="min-h-screen bg-gray-100 p-10">
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="space-y-3 text-gray-700">
        <p><strong>Full Name:</strong> {profile?.full_name || "Not set"}</p>
        <p><strong>Farm Name:</strong> {profile?.farm_name || "Not set"}</p>
        <p><strong>Farm Size:</strong> {profile?.farm_size || "Not set"}</p>
        <p><strong>Crop Type:</strong> {profile?.crop_type || "Not set"}</p>

        <div className="bg-blue-50 p-4 rounded">
          <p className="font-semibold">Farming Goal:</p>
          <p>{profile?.goal || "No goal defined yet."}</p>
        </div>

        <p>
          <strong>Subscription:</strong>{" "}
          <span
            className={
              profile?.subscription_status === "active"
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {profile?.subscription_status}
          </span>
        </p>

        <a
          href="/dashboard/profile/edit"
          className="inline-block mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit Profile
        </a>
      </div>

      <LogoutButton />
    </div>
  </div>
)
}