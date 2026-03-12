"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts"

import { toPng } from "html-to-image"
import jsPDF from "jspdf"

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState("line")
  const [primaryVar, setPrimaryVar] = useState("soil_moisture")
  const [compareVar, setCompareVar] = useState("")
  const [farmName, setFarmName] = useState("My Farm")
  const chartRef = useRef<HTMLDivElement>(null)

  const variables = [
    { key: "soil_moisture", label: "Soil Moisture", color: "#2E86C1" },
    { key: "rainfall", label: "Rainfall", color: "#1ABC9C" },
    { key: "temperature", label: "Temperature", color: "#E67E22" },
    { key: "fertilizer_used", label: "Fertilizer Used", color: "#8E44AD" },
    { key: "pH", label: "pH Level", color: "#C0392B" },
    { key: "light_exposure", label: "Light Exposure", color: "#F1C40F" },
    { key: "chlorophyll", label: "Chlorophyll", color: "#27AE60" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Example: fetch farm name if you have a profile table
      const { data: profile } = await supabase
        .from("profiles")
        .select("farm_name")
        .eq("id", user.id)
        .single()

      if (profile?.farm_name) {
        setFarmName(profile.farm_name)
      }

      const { data } = await supabase
        .from("farm_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })

      if (data) {
        setData(
          data.map((item) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(),
          }))
        )
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <p className="p-6">Loading analytics...</p>
  if (!data.length) return <p className="p-6">No data available yet.</p>

  const calculateStats = (key: string) => {
    const values = data.map((d) => Number(d[key] || 0))
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  const primaryStats = calculateStats(primaryVar)

  // ✅ PNG EXPORT
  const exportPNG = async () => {
    if (!chartRef.current) return

    const dataUrl = await toPng(chartRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    })

    const link = document.createElement("a")
    link.download = "agripromax-analytics.png"
    link.href = dataUrl
    link.click()
  }

  // ✅ CSV EXPORT
  const exportCSV = () => {
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) =>
      Object.values(row).map((val) => `"${val}"`).join(",")
    )

    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "agripromax-data.csv"
    link.click()
  }

  // ✅ PROFESSIONAL PDF WITH LOGO + FARM NAME
  const exportPDF = async () => {
  if (!chartRef.current) return

  const imgData = await toPng(chartRef.current, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  })

  const pdf = new jsPDF("p", "mm", "a4")

  // ===== HEADER BACKGROUND (Light Gray) =====
  pdf.setFillColor(243, 244, 246) // #F3F4F6
  pdf.rect(0, 0, 210, 30, "F")

  // ===== LOAD LOGO =====
  const logo = new Image()
  logo.src = "/logo.png"

  await new Promise((resolve) => {
    logo.onload = resolve
  })

  // Add logo (transparent background preserved)
  pdf.addImage(logo, "PNG", 14, 6, 22, 18)

  // ===== HEADER TEXT =====
  pdf.setTextColor(34, 139, 34) // Agripromax green
  pdf.setFontSize(16)
  pdf.text("AGRIPROMAX ANALYTICS REPORT", 105, 15, { align: "center" })

  pdf.setFontSize(11)
  pdf.setTextColor(80, 80, 80)
  pdf.text(`Farm: ${farmName}`, 105, 23, { align: "center" })

  // ===== BODY CONTENT =====
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(12)

  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42)
  pdf.text(`Primary Variable: ${primaryVar}`, 14, 50)

  pdf.text(`Average: ${primaryStats.avg.toFixed(2)}`, 14, 58)
  pdf.text(`Min: ${primaryStats.min}`, 14, 64)
  pdf.text(`Max: ${primaryStats.max}`, 14, 70)

  // ===== CHART IMAGE =====
  pdf.addImage(imgData, "PNG", 15, 78, 180, 100)

  // ===== FOOTER =====
  pdf.setFontSize(10)
  pdf.setTextColor(120)
  pdf.text(
    "Agripromax © 2026 - Sustainable Data Driven Agriculture",
    105,
    285,
    { align: "center" }
  )

  pdf.save(`${farmName}-Agripromax-Report.pdf`)
}
  const ChartComponent =
    chartType === "bar"
      ? BarChart
      : chartType === "area"
      ? AreaChart
      : LineChart

  return (
    <div className="p-8 bg-white space-y-6">
      <h1 className="text-3xl font-bold">Farm Analytics</h1>

      <div className="flex flex-wrap gap-4">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="area">Area</option>
        </select>

        <select
          value={primaryVar}
          onChange={(e) => setPrimaryVar(e.target.value)}
          className="border p-2 rounded"
        >
          {variables.map((v) => (
            <option key={v.key} value={v.key}>{v.label}</option>
          ))}
        </select>

        <select
          value={compareVar}
          onChange={(e) => setCompareVar(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">No Comparison</option>
          {variables
            .filter((v) => v.key !== primaryVar)
            .map((v) => (
              <option key={v.key} value={v.key}>
                Compare with {v.label}
              </option>
            ))}
        </select>

        <button onClick={exportPDF} className="bg-green-700 text-white px-4 py-2 rounded">
          Export PDF
        </button>

        <button onClick={exportPNG} className="bg-green-700 text-white px-4 py-2 rounded">
          Export PNG
        </button>

        <button onClick={exportCSV} className="bg-green-700 text-white px-4 py-2 rounded">
          Export CSV
        </button>
      </div>

      <div ref={chartRef} className="bg-white p-6 rounded shadow">
        <ResponsiveContainer width="100%" height={400}>
          <ChartComponent data={data}>
            <CartesianGrid stroke="#cccccc" strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine y={primaryStats.avg} stroke="#000000" strokeDasharray="5 5" />

            {chartType === "line" && (
              <>
                <Line type="monotone" dataKey={primaryVar}
                  stroke={variables.find(v => v.key === primaryVar)?.color}
                  strokeWidth={3}
                />
                {compareVar && (
                  <Line type="monotone" dataKey={compareVar}
                    stroke={variables.find(v => v.key === compareVar)?.color}
                    strokeWidth={3}
                  />
                )}
              </>
            )}

            {chartType === "bar" && (
              <>
                <Bar dataKey={primaryVar}
                  fill={variables.find(v => v.key === primaryVar)?.color}
                />
                {compareVar && (
                  <Bar dataKey={compareVar}
                    fill={variables.find(v => v.key === compareVar)?.color}
                  />
                )}
              </>
            )}

            {chartType === "area" && (
              <>
                <Area type="monotone" dataKey={primaryVar}
                  stroke={variables.find(v => v.key === primaryVar)?.color}
                  fill={variables.find(v => v.key === primaryVar)?.color}
                />
                {compareVar && (
                  <Area type="monotone" dataKey={compareVar}
                    stroke={variables.find(v => v.key === compareVar)?.color}
                    fill={variables.find(v => v.key === compareVar)?.color}
                  />
                )}
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  )
}