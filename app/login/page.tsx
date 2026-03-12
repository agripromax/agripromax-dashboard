"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md">

        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Agripromax Logo"
            width={90}
            height={90}
            className="mb-3"
          />

          <h1 className="text-2xl font-bold text-green-700">
            Agripromax
          </h1>

          <p className="text-gray-500 text-sm text-center">
            Smart Agricultural Data & Advisory Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Agripromax
        </p>

      </div>
    </div>
  )
}