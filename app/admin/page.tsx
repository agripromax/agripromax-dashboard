import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import Image from "next/image"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ farmer?: string; search?: string }>
}) {
  const cookieStore = await cookies()
  const params = await searchParams

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

  // =========================================
  // SEARCH CLIENTS (FARMERS)
  // =========================================
  let farmersList: any[] = []

  if (params?.search && params.search.trim() !== "") {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "client")
      .ilike("full_name", `%${params.search.trim()}%`)
      .order("full_name")

    farmersList = data || []
  }

  // =========================================
  // SHOW SEARCH PAGE ONLY
  // =========================================
  if (!params?.farmer) {
    return (
      <div className="p-10">
        {/* ✅ Logo Added */}
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="Agripromax Logo"
            width={180}
            height={60}
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-8">
          Admin Dashboard
        </h1>

        <form method="GET" className="mb-6">
          <input
            type="text"
            name="search"
            placeholder="Search farmer by name..."
            defaultValue={params?.search || ""}
            className="border p-3 rounded w-80"
          />
          <button
            type="submit"
            className="ml-3 bg-black text-white px-4 py-3 rounded"
          >
            Search
          </button>
        </form>

        {params?.search && (
          <div className="flex flex-wrap gap-3 mt-4">
            {farmersList.length > 0 ? (
              farmersList.map((f) => (
                <Link
                  key={f.id}
                  href={`/admin?farmer=${f.id}`}
                  className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200"
                >
                  {f.full_name}
                </Link>
              ))
            ) : (
              <p>No farmers found.</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // =========================================
  // FETCH SELECTED CLIENT DATA
  // =========================================
  const { data: submissions } = await supabase
    .from("farm_data")
    .select(`
      id,
      user_id,
      date,
      created_at,
      soil_moisture,
      rainfall,
      temperature,
      fertilizer_used,
      pH,
      light_exposure,
      chlorophyll,
      recommendation,
      profiles!farm_data_user_id_fkey (
        id,
        full_name,
        goal
      )
    `)
    .eq("user_id", params.farmer)
    .order("date", { ascending: false })

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-10">
        {/* ✅ Logo Added */}
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="Agripromax Logo"
            width={180}
            height={60}
            priority
          />
        </div>

        <Link href="/admin" className="text-blue-600 underline">
          ← Back to Search
        </Link>

        <p className="mt-6">No data found for this farmer.</p>
      </div>
    )
  }

  const farmerProfile: any = submissions[0].profiles

  async function saveRecommendation(formData: FormData) {
    "use server"

    const id = formData.get("id") as string
    const recommendation = formData.get("recommendation") as string

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

    await supabase
      .from("farm_data")
      .update({ recommendation })
      .eq("id", id)

    revalidatePath(`/admin?farmer=${params.farmer}`)
  }

  const score = (
    submissions.reduce(
      (sum: number, e: any) =>
        sum + Number(e.chlorophyll || 0),
      0
    ) / submissions.length
  ).toFixed(2)

  return (
    <div className="p-10">
      {/* ✅ Logo Added */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Agripromax Logo"
          width={180}
          height={60}
          priority
        />
      </div>

      <Link href="/admin" className="text-blue-600 underline">
        ← Back to Search
      </Link>

      <h1 className="text-3xl font-bold mt-6">
        {farmerProfile?.full_name}
      </h1>

      <Link
        href={`/dashboard/${params.farmer}`}
        className="inline-block mt-4 mb-6 bg-black text-white px-4 py-2 rounded"
      >
        Open Farmer Dashboard
      </Link>

      <div className="bg-blue-50 p-4 rounded mb-6">
        <strong>Farmer Goal:</strong>
        <p>{farmerProfile?.goal || "Not defined"}</p>
      </div>

      <p className="text-green-600 font-semibold mb-6">
        Performance Score: {score}
      </p>

      {submissions.map((entry: any) => (
        <div key={entry.id} className="border-t pt-6 mt-6">
          <div className="text-sm text-gray-500 mb-3">
            Collected: {new Date(entry.date).toLocaleDateString()}
            {" | "}
            Submitted: {new Date(entry.created_at).toLocaleDateString()}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>Soil Moisture: {entry.soil_moisture}</div>
            <div>Rainfall: {entry.rainfall}</div>
            <div>Temperature: {entry.temperature}</div>
            <div>Fertilizer Used: {entry.fertilizer_used}</div>
            <div>pH Level: {entry.pH}</div>
            <div>Light Exposure: {entry.light_exposure}</div>
            <div>Chlorophyll: {entry.chlorophyll}</div>
          </div>

          <form action={saveRecommendation}>
            <input type="hidden" name="id" value={entry.id} />

            <textarea
              name="recommendation"
              defaultValue={entry.recommendation || ""}
              className="w-full border p-3 rounded mb-3"
            />

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Recommendation
            </button>
          </form>
        </div>
      ))}
    </div>
  )
}