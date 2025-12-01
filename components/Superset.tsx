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

  console.log("Montando Superset con dashboardId:", dashboardId)

  const fetchGuestToken = async (): Promise<string> => {
    console.log("Pidiendo guest token a:", `${ApiUrl}/api/superset/guest-token`)
    const res = await fetch(`${ApiUrl}/api/superset/guest-token`, {
      credentials: "include",
    })
    // ...
  }

  const doEmbed = async () => {
    if (!containerRef.current) {
      console.warn("No hay containerRef.current para superset")
      return
    }

    try {
      await embedDashboard({
        id: dashboardId,
        supersetDomain: SupersetUrl,
        mountPoint: containerRef.current,
        fetchGuestToken,
        // ...
      })
      console.log("Dashboard de Superset embebido correctamente")
    } catch (err: any) {
      // ...
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
