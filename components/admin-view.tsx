"use client"

import React, { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CheckoutModal from "@/components/checkout-modal"
import { ApiUrl } from "@/lib/config"
import Superset from "@/components/Superset"

interface AdminStats {
  total_users?: number
  total_sales?: number
  total_products?: number
  pending_orders?: number
  [key: string]: any
}

export default function AdminView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const stored =
      localStorage.getItem("userData") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userInfo")
    const user = stored ? JSON.parse(stored) : null
    const id = user?.id ? Number(user.id) : null
    setUserId(id)

    // Requerimos que exista usuario
    if (!id) {
      setError("No se encontró usuario en localStorage.")
      setLoading(false)
      return
    }

    // Check: el permiso ahora se basa en plan_id === 3
    const planIdFromUser = user?.plan_id ?? user?.plan ?? null
    const planIdFromStorage = localStorage.getItem("plan_id") || localStorage.getItem("selected_plan_id")
    const planId = planIdFromUser ?? (planIdFromStorage ? Number(planIdFromStorage) : null)

    if (Number(planId) !== 3) {
      setError("No tienes permisos para ver el dashboard de admin (se requiere plan_id = 3).")
      setLoading(false)
      return
    }

    const fetchAdmin = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        const tryUrls = [
          `${ApiUrl}/api/admin/dashboard/${id}`,
          `${ApiUrl}/api/admin/stats/${id}`,
          `${ApiUrl}/api/admin/stats`,
        ]

        let data: any = null
        for (const url of tryUrls) {
          try {
            const res = await fetch(url, {
              headers: {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            })
            if (!res.ok) continue
            data = await res.json()
            console.log("Admin data from", url, data)
            break
          } catch (e) {
            console.warn("Intento admin fetch fallido:", url, e)
            continue
          }
        }

        if (!data) {
          setError("No se obtuvo información del dashboard desde la API.")
        } else {
          // Normalizar respuesta simple a adminStats
          const stats: AdminStats = {
            total_users: data.total_users ?? data.users ?? data.users_count ?? data.totalUsers,
            total_sales: data.total_sales ?? data.sales ?? data.totalSales,
            total_products: data.total_products ?? data.products ?? data.totalProducts,
            pending_orders: data.pending_orders ?? data.orders_pending ?? data.pendingOrders,
            ...data,
          }
          setAdminStats(stats)
        }
      } catch (err: any) {
        console.error("Error obteniendo admin stats:", err)
        setError(err?.message || "Error inesperado al obtener dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchAdmin()
  }, [])

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <CartSidebar />
      <FavoritesSidebar />
      <CheckoutModal onClose={() => {}} />

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

        {loading && <div>Cargando dashboard...</div>}

        {!loading && error && (
          <div className="p-4 bg-yellow-100 text-[#1B3C53] rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && adminStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow">
                <div className="text-sm text-muted-foreground">Usuarios</div>
                <div className="text-2xl font-bold">{(adminStats.total_users ?? 0).toLocaleString()}</div>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <div className="text-sm text-muted-foreground">Ventas Totales</div>
                <div className="text-2xl font-bold">{(adminStats.total_sales ?? 0).toLocaleString()}</div>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <div className="text-sm text-muted-foreground">Productos</div>
                <div className="text-2xl font-bold">{(adminStats.total_products ?? 0).toLocaleString()}</div>
              </div>

              <div className="p-4 bg-white rounded shadow col-span-1 md:col-span-3">
                <div className="text-sm text-muted-foreground">Pedidos pendientes</div>
                <div className="text-2xl font-bold">{(adminStats.pending_orders ?? 0).toLocaleString()}</div>
              </div>

              {/* mostrar cualquier otra clave útil */}
              {Object.keys(adminStats).map((k) => (
                ["total_users","total_sales","total_products","pending_orders"].includes(k) ? null : (
                  <div key={k} className="p-3 bg-card rounded">
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-medium">{String(adminStats[k])}</div>
                  </div>
                )
              ))}
            </div>

            {/* Iframe de Superset */}
            <Superset dashboardId="f8416863-b8d0-4013-bf37-92d66d027b01" />

          </>
         )}
      </main>
    </div>
  )
}

