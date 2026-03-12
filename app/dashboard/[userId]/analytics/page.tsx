"use client"

import { useParams } from "next/navigation"
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
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"

import * as htmlToImage from "html-to-image"
import jsPDF from "jspdf"

export default function AnalyticsPage() {
  const { userId } = useParams()

  const [data, setData] = useState<any[]>([])
  const [farmName, setFarmName] = useState<string>("")
  const [chartType, setChartType] = useState("line")
  const [primaryVar, setPrimaryVar] = useState("chlorophyll")
  const [compareVar, setCompareVar] = useState("")
  const chartRef = useRef<HTMLDivElement>(null)

  const variables = [
    { key: "soil_moisture", label: "Soil Moisture" },
    { key: "rainfall", label: "Rainfall" },
    { key: "temperature", label: "Temperature" },
    { key: "fertilizer_used", label: "Fertilizer Used" },
    { key: "pH", label: "pH Level" },
    { key: "light_exposure", label: "Light Exposure" },
    { key: "chlorophyll", label: "Chlorophyll" },
  ]

  useEffect(() => {
    const load = async () => {
      // Load farm data
      const { data: farmData } = await supabase
        .from("farm_data")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true })

      setData(farmData || [])

      // Load farm name
      const { data: profile } = await supabase
        .from("profiles") // change if your table name is different
        .select("farm_name")
        .eq("id", userId)
        .single()

      if (profile?.farm_name) {
        setFarmName(profile.farm_name)
      }
    }

    if (userId) load()
  }, [userId])

  if (!data.length)
    return <p className="text-gray-500 p-6">No data available.</p>

  const getStats = (key: string) => {
    const values = data.map(d => Number(d[key])).filter(v => !isNaN(v))
    const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { avg, min, max }
  }

  const stats = getStats(primaryVar)

  const renderChart = () => {
    const common = (
      <>
        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <ReferenceLine
          y={stats.avg}
          stroke="#EF4444"
          strokeDasharray="4 4"
          label="Average"
        />
      </>
    )

    if (chartType === "bar") {
      return (
        <BarChart data={data}>
          {common}
          <Bar dataKey={primaryVar} fill="#2E7D32" />
          {compareVar && <Bar dataKey={compareVar} fill="#1565C0" />}
        </BarChart>
      )
    }

    if (chartType === "area") {
      return (
        <AreaChart data={data}>
          {common}
          <Area
            type="monotone"
            dataKey={primaryVar}
            stroke="#2E7D32"
            fill="#A5D6A7"
          />
          {compareVar && (
            <Area
              type="monotone"
              dataKey={compareVar}
              stroke="#1565C0"
              fill="#90CAF9"
            />
          )}
        </AreaChart>
      )
    }

    return (
      <LineChart data={data}>
        {common}
        <Line
          type="monotone"
          dataKey={primaryVar}
          stroke="#2E7D32"
          strokeWidth={3}
        />
        {compareVar && (
          <Line
            type="monotone"
            dataKey={compareVar}
            stroke="#1565C0"
            strokeWidth={3}
          />
        )}
      </LineChart>
    )
  }

  const exportPNG = async () => {
    if (!chartRef.current) return

    const dataUrl = await htmlToImage.toPng(chartRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    })

    const link = document.createElement("a")
    link.download = "agripromax-analytics.png"
    link.href = dataUrl
    link.click()
  }

  const exportPDF = async () => {
    if (!chartRef.current) return

    const chartImage = await htmlToImage.toPng(chartRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    })

    const pdf = new jsPDF("landscape", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Load logo from public folder
    const logo = new Image()
    logo.src = "/logo.png"

    await new Promise((resolve) => {
      logo.onload = resolve
    })

    // Very light header background
    pdf.setFillColor(249, 250, 251)
    pdf.rect(0, 0, pageWidth, 28, "F")

    // Logo
    pdf.addImage(logo, "PNG", 10, 6, 18, 18)

    // Title
    pdf.setFontSize(18)
    pdf.setTextColor(34, 64, 45)
    pdf.text("AGRIPROMAX ANALYTICS REPORT", pageWidth / 2, 16, {
      align: "center",
    })

    // Farm name (FIXED)
    pdf.setFontSize(11)
    pdf.setTextColor(100)
    pdf.text(
      `Farm: ${farmName || "Unknown Farm"}`,
      pageWidth / 2,
      23,
      { align: "center" }
    )

    // Info
    pdf.setFontSize(11)
    pdf.setTextColor(0)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38)
    pdf.text(`Primary Variable: ${primaryVar}`, 14, 45)

    // Chart
    pdf.addImage(chartImage, "PNG", 10, 55, 270, 120)

    pdf.save("agripromax-analytics-report.pdf")
  }

  const exportCSV = () => {
    const headers = Object.keys(data[0]).join(",")
    const rows = data
      .map(row =>
        Object.values(row)
          .map(val => `"${val}"`)
          .join(",")
      )
      .join("\n")

    const csvContent = headers + "\n" + rows
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "agripromax-analytics-data.csv"
    link.click()
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>

      <div className="bg-white shadow rounded-xl p-6 flex flex-wrap gap-4 items-center">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="area">Area</option>
        </select>

        <select
          value={primaryVar}
          onChange={(e) => setPrimaryVar(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {variables.map(v => (
            <option key={v.key} value={v.key}>{v.label}</option>
          ))}
        </select>

        <select
          value={compareVar}
          onChange={(e) => setCompareVar(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">None</option>
          {variables
            .filter(v => v.key !== primaryVar)
            .map(v => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
        </select>

        <button
          onClick={exportPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>

        <button
          onClick={exportPNG}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Export PNG
        </button>

        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      <div ref={chartRef} className="bg-white shadow rounded-xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-gray-500 text-sm">Average</p>
            <p className="text-lg font-semibold">{stats.avg.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Minimum</p>
            <p className="text-lg font-semibold">{stats.min}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Maximum</p>
            <p className="text-lg font-semibold">{stats.max}</p>
          </div>
        </div>
      </div>
    </div>
  )
}