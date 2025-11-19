"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApiUrl } from "@/lib/config"
import Navbar from "@/components/navbar"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { Package, CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/components/ui/notification"
import storage from "@/lib/storage"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  user?: {
    id: number
    name: string
    email: string
  }
  subcategoria?: {
    id: number
    name: string
  }
  created_at: string
  status_id: number
}

export default function ValidacionesPage() {
  const { state } = useApp()
  const router = useRouter()
  const { showNotification } = useNotification()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [planId, setPlanId] = useState<string | null>(null)

  // Verificar que el usuario tenga plan_id 3
  useEffect(() => {
    const checkAccess = () => {
      const sessionPlanId = state.userSession?.plan_id
      const storedPlanId = storage.getPlanId() || localStorage.getItem("plan_id")
      const currentPlanId = sessionPlanId || storedPlanId
      
      setPlanId(currentPlanId ? String(currentPlanId) : null)
      
      if (currentPlanId !== "3") {
        showNotification("No tienes acceso a esta sección. Solo disponible para administradores.", "error")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    }

    checkAccess()
    
    const interval = setInterval(checkAccess, 1000)
    return () => clearInterval(interval)
  }, [state.userSession, router, showNotification])

  // Cargar productos con status_id: 1
  useEffect(() => {
    const fetchProducts = async () => {
      if (planId !== "3") return
      
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${ApiUrl}/api/products/status/1`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })

        if (!response.ok) {
          throw new Error("Error al obtener productos")
        }

        const data = await response.json()
        // Filtrar solo los productos con status_id: 1 por si acaso
        const filteredProducts = Array.isArray(data) 
          ? data.filter((p: Product) => p.status_id === 1)
          : []
        
        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        showNotification("Error al cargar productos pendientes de validación", "error")
      } finally {
        setLoading(false)
      }
    }

    if (planId === "3") {
      fetchProducts()
    }
  }, [planId, showNotification])

  // Función para aprobar producto (cambiar status_id a 2)
  const approveProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${ApiUrl}/api/products/${productId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status_id: 2 })
      })

      if (!response.ok) {
        throw new Error("Error al aprobar producto")
      }

      showNotification("Producto aprobado exitosamente", "success")
      // Actualizar la lista removiendo el producto aprobado
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error("Error al aprobar producto:", error)
      showNotification("Error al aprobar el producto", "error")
    }
  }

  // Función para rechazar producto (cambiar status_id a 3)
  const rejectProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${ApiUrl}/api/products/${productId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status_id: 3 })
      })

      if (!response.ok) {
        throw new Error("Error al rechazar producto")
      }

      showNotification("Producto rechazado", "success")
      // Actualizar la lista removiendo el producto rechazado
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error("Error al rechazar producto:", error)
      showNotification("Error al rechazar el producto", "error")
    }
  }

  // Si no tiene acceso, mostrar mensaje
  if (planId !== "3") {
    return (
      <div className="min-h-screen bg-[#F9F3EF]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-md mx-auto p-8 text-center">
            <Package className="h-16 w-16 text-[#1B3C53] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">Acceso Restringido</h2>
            <p className="text-gray-600">
              Esta sección es exclusiva para administradores.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B3C53] mb-2">Validaciones de Productos</h1>
          <p className="text-[#456882]">Productos pendientes de validación</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3C53] mx-auto"></div>
              <p className="mt-4 text-[#456882]">Cargando productos...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1B3C53] mb-2">No hay productos pendientes</h3>
              <p className="text-[#456882]">Todos los productos han sido validados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={
                      product.image?.startsWith("data:image")
                        ? product.image
                        : product.image?.startsWith("http")
                        ? product.image
                        : `${ApiUrl}/storage/${product.image}`
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-[#1B3C53] line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="text-sm text-[#456882]">
                    <p className="font-semibold">${Number(product.price).toFixed(2)}</p>
                    {product.subcategoria && (
                      <p className="text-xs mt-1">{product.subcategoria.name}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  
                  {product.user && (
                    <div className="mb-4 p-2 bg-[#E8DDD4] rounded">
                      <p className="text-xs text-[#1B3C53]">
                        <span className="font-semibold">Vendedor:</span> {product.user.name}
                      </p>
                      <p className="text-xs text-[#456882]">{product.user.email}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Detalles
                      </Button>
                    </Link>
                    <Button
                      onClick={() => approveProduct(product.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => rejectProduct(product.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

