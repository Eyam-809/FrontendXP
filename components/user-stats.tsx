"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApiUrl } from "@/lib/config"
import { 
  TrendingUp, 
  Package, 
  ShoppingCart,
  Users,
  Star,
  DollarSign
} from "lucide-react"

interface UserStatsProps {
  totalProducts: number
  totalSales: number
  rating: number
  followers: number
  following: number
  activeProducts: number
  soldProducts: number
}

export default function UserStats({
  totalProducts,
  totalSales,
  rating,
  followers,
  following,
  activeProducts,
  soldProducts
}: UserStatsProps) {

  const [soldCount, setSoldCount] = useState<number>(soldProducts ?? 0)
  const [activeCount, setActiveCount] = useState<number | null>(null)

  useEffect(() => {
    // Si el prop viene y es mayor a 0 → úsalo
    if (soldProducts > 0) {
      setSoldCount(soldProducts)
      return
    }

    const fetchSoldCount = async () => {
      try {
        const stored =
          localStorage.getItem("userData") ||
          localStorage.getItem("user") ||
          localStorage.getItem("userInfo")
        const user = stored ? JSON.parse(stored) : null
        const userId = user?.id
        if (!userId) return

        const token = localStorage.getItem("token")
        const tryUrls = [
          `${ApiUrl}/api/products/user/${userId}/sold-count`,
          `${ApiUrl}/products/user/${userId}/sold-count`
        ]

        let success = false
        for (const url of tryUrls) {
          try {
            const res = await fetch(url, {
              headers: {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            })
            if (!res.ok) continue

            const data = await res.json()
            // aceptar { sold_count } u otras variantes
            let value = 0
            if (typeof data === "number") value = data
            else if (data && typeof data === "object")
              value = Number(data.sold_count ?? data.count ?? data.sold ?? data.total ?? data.data?.count ?? 0)
            else value = Number(data ?? 0)
            if (Number.isNaN(value)) value = 0

            setSoldCount(value)
            success = true
            break
          } catch (e) {
            console.warn("fetch sold-count intento fallido:", url, e)
            continue
          }
        }

        if (!success) console.warn("No se pudo obtener sold-count desde la API")

      } catch (err) {
        console.error("Error obteniendo sold count:", err)
      }
    }

    fetchSoldCount()

    // También obtener la cuenta de productos activos desde la nueva API
    const fetchActiveCount = async () => {
      try {
        const stored =
          localStorage.getItem("userData") ||
          localStorage.getItem("user") ||
          localStorage.getItem("userInfo")
        const user = stored ? JSON.parse(stored) : null
        const userId = user?.id
        if (!userId) return

        const token = localStorage.getItem("token")
        const tryUrls = [
          `${ApiUrl}/api/products/active/${userId}/count`,
          `${ApiUrl}/products/active/${userId}/count`,
          `${ApiUrl}/api/products/user/${userId}/active-count`
        ]

        for (const url of tryUrls) {
          try {
            const res = await fetch(url, {
              headers: {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            })
            if (!res.ok) continue
            const data = await res.json()
            let value = 0
            if (typeof data === "number") value = data
            else if (data && typeof data === "object")
              value = Number(data.sold_count_active ?? data.count ?? data.total ?? data.data?.count ?? 0)
            else value = Number(data ?? 0)
            if (Number.isNaN(value)) value = 0
            setActiveCount(value)
            break
          } catch (e) {
            console.warn("fetch active-count intento fallido:", url, e)
            continue
          }
        }
      } catch (err) {
        console.error("Error obteniendo active count:", err)
      }
    }

    fetchActiveCount()
  }, [soldProducts])

  // mostrar Productos activos como prop + valor obtenido desde API (si existe)
  const displayedActive = (activeProducts ?? 0) + (activeCount ?? 0)

  const stats = [
    {
      title: "Productos activos",
      value: displayedActive,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Productos vendidos",
      value: soldCount,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ]

  const socialStats = [
    {
      title: "Seguidores",
      value: followers,
      icon: Users,
      color: "text-indigo-600"
    },
    {
      title: "Siguiendo",
      value: following,
      icon: Users,
      color: "text-indigo-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Estadísticas de ventas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{(stat.value ?? 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      

      {/* Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Rendimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Total de ventas</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                {(soldCount ?? totalSales).toLocaleString()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total de productos</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                {totalProducts}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
