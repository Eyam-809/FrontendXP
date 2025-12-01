"use client"

import React, { useEffect, useState, useRef } from "react"
import Navbar from "@/components/navbar"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CheckoutModal from "@/components/checkout-modal"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import { SupersetUrl, ApiUrl } from "@/lib/config"
import { Buffer } from "buffer"
import "@/styles/admin-view.css"

// Polyfill para Buffer, necesario para Superset en algunos entornos Next.js
if (typeof window !== "undefined") {
  ;(window as any).Buffer = (window as any).Buffer || Buffer
}

export default function AdminView() {
  const supersetContainerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supersetError, setSupersetError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchGuestToken = async () => {
      // Función para obtener el token de autenticación de invitado desde tu API
      const res = await fetch(`${ApiUrl}/api/superset/guest-token`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("No se pudo obtener guest token")

      const data = await res.json()
      return data.token
    }

    const doEmbed = async () => {
      try {
        setError(null)
        setSupersetError(null)

        if (!supersetContainerRef.current) return

        // Incrusta el dashboard de Superset
        await embedDashboard({
          id: "f8416863-b8d0-4013-bf37-92d66d027b01", // ID de tu dashboard
          supersetDomain: SupersetUrl,
          mountPoint: supersetContainerRef.current,
          fetchGuestToken,
          dashboardUiConfig: {
            hideTitle: true, // Ocultar el título
            hideTab: true, // Ocultar pestañas
            hideChartControls: true, // Ocultar controles de cada gráfico
            filters: { // Ocultar el panel lateral de filtros nativos
              visible: false,
              expanded: false,
            },
          },
          iframeSandboxExtras: [
            "allow-same-origin",
            "allow-forms",
            "allow-scripts",
            "allow-popups",
          ],
        })

        if (!cancelled) setLoading(false)
      } catch (e: any) {
        if (!cancelled) {
          console.error(e)
          setSupersetError(e.message || "Error cargando Superset")
          setLoading(false)
        }
      }
    }

    doEmbed()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    // Se eliminó flex-col y min-h-screen
    <div className="bg-[#F9F3EF]"> 
      <Navbar />
      <CartSidebar />
      <FavoritesSidebar />
      <CheckoutModal onClose={() => {}} />

      {/* Contenedor principal: Se eliminó flex-1 y flex-col, se dejó centrado y con padding */}
      <main className="w-full max-w-7xl mx-auto px-6 py-8">
        
        {/* Header descriptivo */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1B3C53]">
              Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Visualiza el rendimiento financiero y el comportamiento de tus ventas
              en tiempo real, conectado directamente con Superset.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#1B3C53] px-3 py-1 text-xs font-medium text-white shadow-sm">
              Analytics
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700">
              Superset embed
            </span>
          </div>
        </header>

        {/* Mensajes de error */}
        {error && (
          <div className="p-4 mb-4 rounded-lg bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        {supersetError && (
          <div className="p-4 mb-4 rounded-lg bg-red-100 text-red-700 text-sm">
            {supersetError}
          </div>
        )}

        {/* Contenedor del Dashboard con clase para CSS */}
        <div className="superset-card relative mt-4">
           {/* Overlay de loading */}
           {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B3C53] border-t-transparent mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Cargando dashboard de Superset...
              </p>
            </div>
          )}

          {/* Contenedor del iframe: w-full h-full para llenar el div de 1250x850px */}
          <div
            ref={supersetContainerRef}
            className="superset-frame"
          />
         </div>
      </main>
    </div>
  )
}