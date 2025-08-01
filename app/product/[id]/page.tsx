"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Star, Heart, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CategoryPanel from "@/components/category-panel"
import { useApp } from "@/contexts/app-context"
import type { Product } from "@/contexts/app-context"

const translateCategory = (category: string) => {
  const translations: Record<string, string> = {
    Electronics: "Electrónicos",
    Fashion: "Moda",
    Home: "Hogar",
    Sports: "Deportes",
    Beauty: "Belleza",
    Toys: "Juguetes",
  }
  return translations[category] || category
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://backendxp-1.onrender.com/api/products/${id}`)
        if (!response.ok) throw new Error("Producto no encontrado")
        const data = await response.json()
        setProduct(data)

        if (state.products.length === 0) {
          dispatch({ type: "SET_PRODUCTS", payload: [data] })
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error)
        router.push("/")
      }
    }

    if (id) fetchProduct()
  }, [id, router, dispatch, state.products])

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  const price = Number(product.price ?? 0)
  const isFavorite = state.favorites.some((fav) => fav.id === product.id)

  const addToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_TO_CART", payload: product })
    }
  }

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: product.id })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: product })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <Navbar />
      <CategoryPanel />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 flex items-center text-gray-600" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="relative">
              <img
                src={`https://backendxp-1.onrender.com/storage/${product.image}`}
                alt={product.name}
                className="w-full h-auto object-contain rounded-lg"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "fill-current" : "stroke-current fill-none"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">({product.rating})</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-[#be0c0c]-600">${price.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="font-medium">Cantidad:</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-3 mb-6">
              <Button
                className="flex-1 bg-gradient-to-r from-[#be0c0c] to-[#be0c0c] hover:from-[#8B0000] hover:to-[#8B0000]"
                onClick={addToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Añadir al Carrito
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`${isFavorite ? "text-red-500 border-red-500" : ""}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Información del Producto</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Categoría:</span>
                  <span>{translateCategory(product.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilidad:</span>
                  <span className={product.stock ? "text-green-600" : "text-red-600"}>
                    {product.stock ? "En Stock" : "Agotado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ID del Producto:</span>
                  <span>#{product.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
    </div>
  )
}
