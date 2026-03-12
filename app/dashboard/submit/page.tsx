"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SubmitPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    date: "",
    soil_moisture: "",
    rainfall: "",
    temperature: "",
    fertilizer_used: "",
    pH: "",
    light_exposure: "",
    chlorophyll: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { error } = await supabase.from("farm_data").insert({
      user_id: user.id,
      date: form.date, // farmer-selected date
      soil_moisture: Number(form.soil_moisture),
      rainfall: Number(form.rainfall),
      temperature: Number(form.temperature),
      fertilizer_used: Number(form.fertilizer_used),
      pH: Number(form.pH),
      light_exposure: Number(form.light_exposure),
      chlorophyll: Number(form.chlorophyll),
    })

    if (error) {
      console.error(error)
      setMessage("Error submitting data.")
    } else {
      setMessage("✅ Data submitted successfully!")
      setForm({
        date: "",
        soil_moisture: "",
        rainfall: "",
        temperature: "",
        fertilizer_used: "",
        pH: "",
        light_exposure: "",
        chlorophyll: "",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6">Submit Farm Data</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input type="number" step="any" name="soil_moisture" placeholder="Soil Moisture"
            value={form.soil_moisture} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <input type="number" step="any" name="rainfall" placeholder="Rainfall"
            value={form.rainfall} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <input type="number" step="any" name="temperature" placeholder="Temperature"
            value={form.temperature} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <input type="number" step="any" name="fertilizer_used" placeholder="Fertilizer Used"
            value={form.fertilizer_used} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <input type="number" step="any" name="pH" placeholder="pH"
            value={form.pH} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <input type="number" step="any" name="light_exposure" placeholder="Light Exposure"
            value={form.light_exposure} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <input type="number" step="any" name="chlorophyll" placeholder="Chlorophyll"
            value={form.chlorophyll} onChange={handleChange} required
            className="w-full border p-2 rounded" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded"
          >
            {loading ? "Submitting..." : "Submit Data"}
          </button>

          {message && (
            <p className="text-center mt-2 text-sm">{message}</p>
          )}
        </form>
      </div>
    </div>
  )
}