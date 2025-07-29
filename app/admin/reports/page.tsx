"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from "@/components/footer"

export default function AdminReports() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedYear, setSelectedYear] = useState("2024")

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/")
        return
      }
      setUser(parsedUser)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  const yearlyData = {
    "2024": {
      totalRevenue: 892000,
      totalProfit: 267600,
      profitMargin: 30,
      growth: 12.5,
      quarters: [
        { quarter: "Q1", revenue: 198000, profit: 59400, margin: 30 },
        { quarter: "Q2", revenue: 215000, profit: 64500, margin: 30 },
        { quarter: "Q3", revenue: 234000, profit: 70200, margin: 30 },
        { quarter: "Q4", revenue: 245000, profit: 73500, margin: 30 },
      ],
    },
    "2023": {
      totalRevenue: 794000,
      totalProfit: 238200,
      profitMargin: 30,
      growth: 8.2,
      quarters: [
        { quarter: "Q1", revenue: 185000, profit: 55500, margin: 30 },
        { quarter: "Q2", revenue: 192000, profit: 57600, margin: 30 },
        { quarter: "Q3", revenue: 205000, profit: 61500, margin: 30 },
        { quarter: "Q4", revenue: 212000, profit: 63600, margin: 30 },
      ],
    },
  }

  const currentData = yearlyData[selectedYear as keyof typeof yearlyData]

  const monthlyBreakdown = [
    { month: "Enero", revenue: 65000, profit: 19500, expenses: 45500 },
    { month: "Febrero", revenue: 68000, profit: 20400, expenses: 47600 },
    { month: "Marzo", revenue: 65000, profit: 19500, expenses: 45500 },
    { month: "Abril", revenue: 72000, profit: 21600, expenses: 50400 },
    { month: "Mayo", revenue: 71000, profit: 21300, expenses: 49700 },
    { month: "Junio", revenue: 72000, profit: 21600, expenses: 50400 },
    { month: "Julio", revenue: 78000, profit: 23400, expenses: 54600 },
    { month: "Agosto", revenue: 76000, profit: 22800, expenses: 53200 },
    { month: "Septiembre", revenue: 80000, profit: 24000, expenses: 56000 },
    { month: "Octubre", revenue: 82000, profit: 24600, expenses: 57400 },
    { month: "Noviembre", revenue: 81000, profit: 24300, expenses: 56700 },
    { month: "Diciembre", revenue: 82000, profit: 24600, expenses: 57400 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes de Ganancias</h1>
              <p className="text-gray-600">Análisis financiero detallado por año</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+{currentData.growth}% vs año anterior
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancias Netas</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentData.totalProfit.toLocaleString()}</div>
                <p className="text-xs text-blue-600">Margen: {currentData.profitMargin}%</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(currentData.totalRevenue / 12).toLocaleString()}</div>
                <p className="text-xs text-purple-600">Ingresos por mes</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mejor Trimestre</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Q4</div>
                <p className="text-xs text-orange-600">${currentData.quarters[3].revenue.toLocaleString()} ingresos</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quarterly Performance */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Trimestral {selectedYear}</CardTitle>
                <CardDescription>Ingresos y ganancias por trimestre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentData.quarters.map((quarter, index) => (
                    <div key={quarter.quarter} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{quarter.quarter}</span>
                        <span className="text-sm text-gray-600">{quarter.margin}% margen</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Ingresos:</span>
                          <span className="font-medium">${quarter.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ganancias:</span>
                          <span className="font-medium text-green-600">${quarter.profit.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(quarter.revenue / 250000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Breakdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Desglose Mensual {selectedYear}</CardTitle>
                <CardDescription>Ingresos, gastos y ganancias mensuales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {monthlyBreakdown.map((month, index) => (
                    <div key={month.month} className="border-b pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{month.month}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round((month.profit / month.revenue) * 100)}% margen
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Ingresos:</span>
                          <div className="font-medium">${month.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Gastos:</span>
                          <div className="font-medium text-red-600">${month.expenses.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Ganancia:</span>
                          <div className="font-medium text-green-600">${month.profit.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Profit Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rentabilidad</CardTitle>
              <CardDescription>Métricas clave de rentabilidad para {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{currentData.profitMargin}%</div>
                  <div className="text-sm text-gray-600">Margen de Ganancia</div>
                  <div className="text-xs text-gray-500 mt-1">Consistente durante todo el año</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${Math.round(currentData.totalProfit / 12).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Ganancia Mensual Promedio</div>
                  <div className="text-xs text-gray-500 mt-1">Basado en {selectedYear}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">+{currentData.growth}%</div>
                  <div className="text-sm text-gray-600">Crecimiento Anual</div>
                  <div className="text-xs text-gray-500 mt-1">Comparado con año anterior</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
