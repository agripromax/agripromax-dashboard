"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProfileForm({ profile }: any) {
  const router = useRouter()

  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [address, setAddress] = useState(profile?.address || "")
  const [goal, setGoal] = useState(profile?.goal || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
        address: address,
        goal: goal, // ✅ NOW IT SAVES
      })
      .eq("id", profile.id)

    setLoading(false)
    router.push("/dashboard/profile")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            className="w-full border p-2 rounded"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div>
            <label className="block mb-1 font-semibold">
              Farming Goal
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Example: Big premium fruit, High yield, Organic quality..."
              className="w-full border p-3 rounded"
            />
          </div>

          <div className="bg-gray-100 p-4 rounded text-sm text-gray-600">
            Farm details are part of your subscription agreement.
            To request changes, please contact Agripromax support.
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  )
}