"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Truck, Package } from "lucide-react"
import { ApiUrl } from "@/lib/config"
import Navbar from "@/components/navbar"

interface Producto {
  id: number
  nombre: string
  created_at: string
  estado: string
  precio: string
}

interface Pedido {
  id: number
  nombre: string
  fecha: string
  estado: string
}

export default function DatosCuentaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const stored =
          localStorage.getItem("user") ||
          localStorage.getItem("userData") ||
          localStorage.getItem("userInfo") ||
          localStorage.getItem("usuario")

        const user = stored ? JSON.parse(stored) : null
        const userId = user?.id

        if (!userId) {
          console.error("No se encontró el ID del usuario en localStorage")
          setLoading(false)
          return
        }

        const token = localStorage.getItem("token")

        // 🔹 Obtener compras
        const comprasRes = await fetch(`${ApiUrl}/api/compras/usuario/${userId}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!comprasRes.ok) throw new Error("Error al obtener compras")
        const comprasData = await comprasRes.json()

        // 🔹 Obtener pedidos
        const pedidosRes = await fetch(`${ApiUrl}/api/pedidos/usuario/${userId}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!pedidosRes.ok) throw new Error("Error al obtener pedidos")
        const pedidosData = await pedidosRes.json()

        setProductos(comprasData)
        setPedidos(pedidosData)
        console.log("Compras obtenidas:", comprasData)
        console.log("Pedidos obtenidos:", pedidosData)
      } catch (error) {
        console.error("Error al obtener los datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDatos()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <p className="text-[#1B3C53] text-lg font-semibold">Cargando tus datos...</p>
      </div>
    )
  }

  // 📦 Clasificar productos
  // Todas las compras (por ejemplo, las 5 más recientes)
const pendientes = productos.slice(0, 5)


  // 🚚 Clasificar pedidos
  const entregas = pedidos.filter(
    (p) => p.estado === "en proceso de empaquetado" || p.estado === "en camino"
  )
  const enviosEnProgreso = pedidos.filter((p) => p.estado === "entregado")

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Título */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1B3C53] mb-2">Seguimiento de tus productos y pedidos</h1>
            <p className="text-[#456882]">Consulta tus compras y envíos</p>
          </div>
        </div>

        {/* Sección de Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimas compras */}
          <Card className="bg-white shadow-md border-[#E8DDD4]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckSquare className="h-5 w-5 text-[#1B3C53]" />
                <span>Últimas compras</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendientes.length > 0 ? (
                pendientes.map((p) => (
                  <div key={p.id} className="border-b border-[#E8DDD4] pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[#1B3C53]">{p.nombre}</h4>
                        <p className="text-sm text-[#456882]">{p.created_at}</p>
                      </div>
                      <p className="font-semibold text-[#1B3C53]">${p.precio}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#456882] text-sm">No tienes productos pendientes.</p>
              )}
            </CardContent>
          </Card>

          {/* Entregas (pedidos en proceso o en camino) */}
          <Card className="bg-white shadow-md border-[#E8DDD4]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Truck className="h-5 w-5 text-[#456882]" />
                <span>Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entregas.length > 0 ? (
                entregas.map((p) => (
                  <div key={p.id} className="border-b border-[#E8DDD4] pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[#1B3C53]">{p.nombre}</h4>
                        <p className="text-sm text-[#456882]">{p.fecha}</p>
                      </div>
                      <Badge variant="secondary" className="bg-[#E8DDD4] text-[#1B3C53]">
                        {p.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#456882] text-sm">No tienes pedidos en proceso o en camino.</p>
              )}
            </CardContent>
          </Card>

          {/* Envíos en progreso (pedidos entregados) */}
          <Card className="bg-white shadow-md border-[#E8DDD4]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-[#E63946]" />
                <span>Envíos en progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enviosEnProgreso.length > 0 ? (
                enviosEnProgreso.map((p) => (
                  <div key={p.id} className="border-b border-[#E8DDD4] pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[#1B3C53]">{p.nombre}</h4>
                        <p className="text-sm text-[#456882]">{p.fecha}</p>
                      </div>
                      <Badge variant="secondary" className="bg-[#E63946] text-white">
                        {p.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#456882] text-sm">No hay pedidos entregados.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
