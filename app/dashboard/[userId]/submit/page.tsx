"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SubmitPage() {
  const { userId } = useParams()

  const [form, setForm] = useState({
    date: "",
    chlorophyll: "",
  })

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    await supabase.from("farm_data").insert({
      user_id: userId,
      date: form.date,
      chlorophyll: Number(form.chlorophyll),
    })

    alert("Submitted!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        required
        onChange={(e) =>
          setForm({ ...form, date: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Chlorophyll"
        required
        onChange={(e) =>
          setForm({ ...form, chlorophyll: e.target.value })
        }
      />
      <button type="submit">Submit</button>
    </form>
  )
}