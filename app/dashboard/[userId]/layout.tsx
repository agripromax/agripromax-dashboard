import Link from "next/link"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  return (
    <div style={{ display: "flex" }}>
      <aside
        style={{
          width: "220px",
          background: "#14532d",
          color: "white",
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        <h2>🌱 Agripromax</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <Link href={`/dashboard/${userId}`}>Overview</Link>
          <Link href={`/dashboard/${userId}/submit`}>Submit Data</Link>
          <Link href={`/dashboard/${userId}/data`}>My Data</Link>
          <Link href={`/dashboard/${userId}/analytics`}>Analytics</Link>
          <Link href={`/dashboard/${userId}/profile`}>Profile</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "40px" }}>{children}</main>
    </div>
  )
}