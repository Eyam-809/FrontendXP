"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApiUrl } from "@/lib/config"
import Navbar from "@/components/navbar"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { Package, XCircle, Eye, Clock } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/components/ui/notification"

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

export default function ProductosRechazadosPage() {
  const { state } = useApp()
  const router = useRouter()
  const { showNotification } = useNotification()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar productos con status_id: 3 (Rechazados)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
       const response = await fetch(`${ApiUrl}/api/products/rejected`, {
          headers: {
            "Accept": "application/json",
            Authorization: `Bearer ${token}`
          }
        });


       if (!response.ok) {
  const errorMessage = await response.text();
  console.error("ERROR BACKEND:", response.status, errorMessage);
  throw new Error("Error al obtener productos");
}


        const data = await response.json()
        // Filtrar solo los productos con status_id: 3 por si acaso
        const filteredProducts = Array.isArray(data) 
          ? data.filter((p: Product) => p.status_id === 3)
          : []
        
        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        showNotification("Error al cargar productos rechazados", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [showNotification])

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B3C53] mb-2">Productos Rechazados</h1>
          <p className="text-[#456882]">Productos con estado rechazado</p>
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
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1B3C53] mb-2">No hay productos rechazados</h3>
              <p className="text-[#456882]">No se encontraron productos con estado rechazado</p>
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
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rechazado
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
                        Ver Detalles
                      </Button>
                    </Link>
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

