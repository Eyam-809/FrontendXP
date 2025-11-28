"use client"

import React, { useEffect, useRef, useState } from "react"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import { ApiUrl, SupersetUrl } from "@/lib/config"
import { Buffer } from "buffer"

if (typeof window !== "undefined") {
  ;(window as any).Buffer = (window as any).Buffer || Buffer
}

interface SupersetProps {
  dashboardId: string
  height?: number
}

const Superset: React.FC<SupersetProps> = ({ dashboardId, height = 800 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchGuestToken = async (): Promise<string> => {
      const res = await fetch(`${ApiUrl}/api/superset/guest-token`, {
        credentials: "include",
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Error desde Laravel al pedir guest_token:", text)
        throw new Error(text || "No se pudo obtener el guest token")
      }

      const data = await res.json()
      return data.token
    }

    const doEmbed = async () => {
      if (!containerRef.current) return

      setLoading(true)
      setError(null)

      try {
        await embedDashboard({
          id: dashboardId,
          supersetDomain: SupersetUrl,   // 👈 ya usamos la constante
          mountPoint: containerRef.current,
          fetchGuestToken,
          dashboardUiConfig: {
            hideTitle: false,
            hideTab: false,
            hideChartControls: true,
          },
          iframeSandboxExtras: [
            "allow-same-origin",
            "allow-forms",
            "allow-scripts",
            "allow-popups",
          ],
        })
      } catch (err: any) {
        if (cancelled) return
        console.error("Error embebiendo dashboard de Superset:", err)
        setError(err?.message || "Error al cargar el dashboard de Superset")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    doEmbed()

    return () => {
      cancelled = true
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [dashboardId])

  return (
    <div className="mt-8">
      {loading && <div>Cargando dashboard de Superset...</div>}

      {error && (
        <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        style={{ width: "100%", height }}
        id="superset-dashboard"
      />
    </div>
  )
}

export default Superset
