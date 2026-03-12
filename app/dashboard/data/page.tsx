import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"

export default async function MyDataPage() {
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

  if (!user) redirect("/login")

  const { data, error } = await supabase
    .from("farm_data")
    .select(`
      id,
      date,
      created_at,
      soil_moisture,
      rainfall,
      temperature,
      fertilizer_used,
      pH,
      light_exposure,
      chlorophyll,
      recommendation
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) console.error(error)

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6">My Farm Data</h1>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Collected Date</th>
                <th className="p-2">Submitted Date</th>
                <th className="p-2">Soil</th>
                <th className="p-2">Rain</th>
                <th className="p-2">Temp</th>
                <th className="p-2">Fertilizer</th>
                <th className="p-2">pH</th>
                <th className="p-2">Light</th>
                <th className="p-2">Chlorophyll</th>
                <th className="p-2">Recommendation</th>
              </tr>
            </thead>

            <tbody>
              {data?.map((row) => (
                <tr key={row.id} className="border-t text-center">
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td>{row.soil_moisture}</td>
                  <td>{row.rainfall}</td>
                  <td>{row.temperature}</td>
                  <td>{row.fertilizer_used}</td>
                  <td>{row.pH}</td>
                  <td>{row.light_exposure}</td>
                  <td>{row.chlorophyll}</td>
                  <td className="text-left p-2">
                    {row.recommendation || (
                      <span className="text-gray-400">
                        No recommendation yet
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.length === 0 && (
            <p className="text-gray-500 mt-4">
              No data submitted yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}