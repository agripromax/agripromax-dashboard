"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "Submit Data", href: "/dashboard/submit" },
    { name: "My Data", href: "/dashboard/data" },
    { name: "Analytics", href: "/dashboard/analytics" },
    { name: "Profile", href: "/dashboard/profile" },
  ]

  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar */}
      <aside className="w-64 flex flex-col">
        
        {/* Logo Section (Same BG as page) */}
        <div className="bg-gray-100 p-6 flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Agripromax Logo"
            width={140}
            height={50}
            priority
          />
        </div>

        {/* Navigation Section */}
        <div className="flex-1 bg-green-900 text-white p-6">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded transition ${
                  pathname === item.href
                    ? "bg-green-700"
                    : "hover:bg-green-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>

    </div>
  )
}