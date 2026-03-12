import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage({
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: currentUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = currentUser?.role === "admin"

  if (!isAdmin && user.id !== userId) {
    redirect(`/dashboard/${user.id}`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  const { data: submissions } = await supabase
    .from("farm_data")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (
    <div>
      {isAdmin && (
        <Link href="/admin" className="text-blue-600 underline">
          ← Back to Admin
        </Link>
      )}

      <h1 className="text-3xl font-bold mt-6">
        {profile?.full_name}'s Dashboard
      </h1>

      <div className="bg-blue-50 p-4 rounded mt-4 mb-6">
        <strong>Farming Goal:</strong>
        <p>{profile?.goal || "Not defined"}</p>
      </div>

      <p className="font-semibold mb-6">
        Total Submissions: {submissions?.length || 0}
      </p>

      {submissions?.map((row) => (
        <div key={row.id} className="border p-4 mb-4 rounded">
          <p><strong>Collected:</strong> {new Date(row.date).toLocaleDateString()}</p>
          <p><strong>Submitted:</strong> {new Date(row.created_at).toLocaleDateString()}</p>
          <p>Soil: {row.soil_moisture}</p>
          <p>Rain: {row.rainfall}</p>
          <p>Temperature: {row.temperature}</p>
          <p>Fertilizer: {row.fertilizer_used}</p>
          <p>pH: {row.pH}</p>
          <p>Light: {row.light_exposure}</p>
          <p>Chlorophyll: {row.chlorophyll}</p>
          <p><strong>Recommendation:</strong> {row.recommendation || "None"}</p>
        </div>
      ))}
    </div>
  )
}