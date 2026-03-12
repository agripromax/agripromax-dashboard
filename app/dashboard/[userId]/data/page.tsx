import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export default async function DataPage({
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

  const { data } = await supabase
    .from("farm_data")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Farm Data</h1>

      {!data || data.length === 0 ? (
        <p className="text-gray-500">No data submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="border px-4 py-2">Collected Date</th>
                <th className="border px-4 py-2">Submitted</th>
                <th className="border px-4 py-2">Soil</th>
                <th className="border px-4 py-2">Rain</th>
                <th className="border px-4 py-2">Temperature</th>
                <th className="border px-4 py-2">Fertilizer</th>
                <th className="border px-4 py-2">pH</th>
                <th className="border px-4 py-2">Light</th>
                <th className="border px-4 py-2">Chlorophyll</th>
                <th className="border px-4 py-2">Recommendation</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="text-center">
                  <td className="border px-4 py-2">
                    {row.date
                      ? new Date(row.date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.soil_moisture ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.rainfall ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.temperature ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.fertilizer_used ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.pH ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.light_exposure ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.chlorophyll ?? "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {row.recommendation || "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}