"use client"

import React, { useEffect, useState, useRef } from "react"
import Navbar from "@/components/navbar"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CheckoutModal from "@/components/checkout-modal"
import "../styles/admin-view.css"


import { ApiUrl } from "@/lib/config"
import { embedDashboard } from "@superset-ui/embedded-sdk"

const DASHBOARD_ID = "5ce05b5b-db97-45fe-8166-c190312f555b"

// Define este en .env.local para prod si quieres:
// NEXT_PUBLIC_SUPERSET_DOMAIN=https://6c152ecc.us1a.app.preset.io
const SUPERSET_DOMAIN =
  process.env.NEXT_PUBLIC_SUPERSET_DOMAIN || "https://6c152ecc.us1a.app.preset.io"

export default function AdminView() {
  const presetContainerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [embedError, setEmbedError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const apiBase = ApiUrl.replace(/\/$/, "")

    const fetchGuestToken = async (dashboardId: string) => {
      const res = await fetch(`${ApiUrl}/api/preset/guest-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // si usas cookies / Sanctum
        body: JSON.stringify({ dashboard_id: dashboardId }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          json?.error || json?.message || `Error ${res.status} obteniendo token`
        )
      }

      if (!json?.token) {
        throw new Error("No se obtuvo token desde el backend")
      }

      return json.token as string
    }

    const doEmbed = async () => {
      try {
        setError(null)
        setEmbedError(null)
        setLoading(true)

        if (!presetContainerRef.current) {
          throw new Error("Contenedor no inicializado")
        }

        await embedDashboard({
          id: DASHBOARD_ID,
          supersetDomain: SUPERSET_DOMAIN,
          mountPoint: presetContainerRef.current,
          fetchGuestToken: async () => fetchGuestToken(DASHBOARD_ID),
          dashboardUiConfig: {
            hideChartControls: true,
            hideFilters: false,
            hideTitle: false,
            hideTab: false,
          },
        })

        if (!cancelled) setLoading(false)
      } catch (e: any) {
        if (!cancelled) {
          setEmbedError(e?.message || String(e))
          setLoading(false)
        }
      }
    }

    doEmbed()

    return () => {
      cancelled = true
      try {
        if (presetContainerRef.current) {
          presetContainerRef.current.innerHTML = ""
        }
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <div className="bg-[#F9F3EF] min-h-screen">
      <Navbar />
      <CartSidebar />
      <FavoritesSidebar />
      <CheckoutModal onClose={() => {}} />

      <main className="w-full max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#1B3C53]">Admin Dashboard</h1>
            <p className="text-slate-700 text-sm mt-1">Analítica integrada con Preset.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#1B3C53] px-3 py-1 text-xs font-medium text-white">
              Analytics
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700">
              Preset Embed
            </span>
          </div>
        </header>

                {error && (
          <div className="p-4 mb-4 text-sm bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {embedError && (
          <div className="p-4 mb-4 text-sm bg-red-100 text-red-800 rounded-md">
            {embedError}
          </div>
        )}

        {/* CONTENEDOR ESTILIZADO DEL DASHBOARD */}
        <div className="superset-wrapper">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B3C53] border-t-transparent mb-2" />
              <p className="text-xs font-medium text-slate-700">Cargando dashboard...</p>
            </div>
          )}

          <div className="superset-card">
            <div ref={presetContainerRef} className="superset-frame" />
          </div>
        </div>

      </main>
    </div>
  )
}
