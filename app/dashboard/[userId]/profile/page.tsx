import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {profile?.full_name}'s Profile
      </h1>

      <p><strong>Full Name:</strong> {profile?.full_name}</p>
      <p><strong>Farm Name:</strong> {profile?.farm_name}</p>
      <p><strong>Farm Size:</strong> {profile?.farm_size}</p>
      <p><strong>Crop Type:</strong> {profile?.crop_type}</p>

      <div className="bg-blue-50 p-4 mt-4 rounded">
        <strong>Farming Goal:</strong>
        <p>{profile?.goal}</p>
      </div>

      <p className="mt-4">
        <strong>Subscription:</strong>{" "}
        {profile?.subscription_status}
      </p>
    </div>
  )
}