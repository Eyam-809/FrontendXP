"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Star, Heart, ShoppingCart, ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CategoryPanel from "@/components/category-panel"
import ImageZoom from "@/components/image-zoom"
import { useApp } from "@/contexts/app-context"
import type { Product } from "@/contexts/app-context"
import { ApiUrl } from "@/lib/config"

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
  const [mediaIndex, setMediaIndex] = useState(0)

  // reset al cambiar de producto
  useEffect(() => {
    setMediaIndex(0)
  }, [product])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${ApiUrl}/api/products/${id}`)
        if (!response.ok) throw new Error("Producto no encontrado")
        const data = await response.json()
        setProduct(data)
        console.log(data)

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando producto...</p>
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
    <div className="min-h-screen bg-background">
     <Navbar />
      <CategoryPanel />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 flex items-center text-muted-foreground" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card p-6 rounded-xl shadow-sm">
            {/* Carrusel único: imagen o video en el mismo contenedor */}
            <div className="bg-card p-6 rounded-xl shadow-sm">
              {(() => {
                const base = ApiUrl
                const mediaItems: { type: "image" | "video"; src: string }[] = []
                const normalize = (s?: string) => {
                  if (!s) return ""
                  // si es base64 (empieza con data:image/ o data:video/)
                  if (s.startsWith("data:image") || s.startsWith("data:video")) return s
                  return s.startsWith("http") ? s : `${base}${s.startsWith("/") ? "" : "/"}${s}`
                }

                if (product.image) mediaItems.push({ type: "image", src: normalize(product.image) })
                if (product.video) mediaItems.push({ type: "video", src: normalize(product.video) })

                if (mediaItems.length === 0) {
                  return (
                    <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Sin imagen ni video</span>
                    </div>
                  )
                }

                const current = mediaItems[mediaIndex % mediaItems.length]
                const prev = () => setMediaIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)
                const next = () => setMediaIndex((i) => (i + 1) % mediaItems.length)

                return (
                  <div className="relative">
                    <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                      {current.type === "image" ? (
                        <ImageZoom
                          src={current.src}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          style={{ maxHeight: "400px" }}
                        />
                      ) : (
                        <video
                          src={current.src}
                          controls
                          className="w-full h-full object-contain"
                          style={{ maxHeight: "400px" }}
                        >
                          Tu navegador no soporta video HTML5.
                        </video>
                      )}
                    </div>

                    {mediaItems.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Anterior"
                          onClick={prev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Siguiente"
                          onClick={next}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                          {mediaItems.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setMediaIndex(i)}
                              aria-label={`Ver ${i + 1}`}
                              className={`h-2.5 w-8 rounded-full ${i === mediaIndex ? "bg-primary" : "bg-gray-300"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold text-card-foreground mb-2">{product.name}</h1>
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
                <span className="text-sm text-muted-foreground ml-2">({product.rating})</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">${price.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="font-medium text-card-foreground">Cantidad:</span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium text-card-foreground">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-3 mb-6">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={addToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Añadir al Carrito
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`${isFavorite ? "text-destructive border-destructive" : "text-muted-foreground border-border"}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 text-card-foreground">Información del Producto</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="text-card-foreground">{translateCategory(product.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibilidad:</span>
                  <span className={product.inStock ? "text-green-600" : "text-destructive"}>
                    {product.inStock ? "En Stock" : "Agotado"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vendedor:</span>
                  <Link 
                    href={`/user/${product.id}`}
                    className="text-primary hover:text-primary/80 hover:underline flex items-center"
                  >
                    Usuario
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
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
