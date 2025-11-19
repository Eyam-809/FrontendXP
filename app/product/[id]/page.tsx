"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Star, Heart, ShoppingCart, ArrowLeft, ArrowRight, Plus, Minus, XCircle, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CategoryPanel from "@/components/category-panel"
import ImageZoom from "@/components/image-zoom"
import { useApp } from "@/contexts/app-context"
import type { Product } from "@/contexts/app-context"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"

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

interface ExtendedProduct extends Product {
  status_id?: number
  video?: string
  rejection_reasons?: {
    predefinedReasons?: string[]
    customReason?: string
    allReasons?: string[]
  }
}

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { state, dispatch } = useApp()
  const { showNotification } = useNotification()
  const [product, setProduct] = useState<ExtendedProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mediaIndex, setMediaIndex] = useState(0)
  const [isResubmitting, setIsResubmitting] = useState(false)

  // reset al cambiar de producto
  useEffect(() => {
    setMediaIndex(0)
  }, [product])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${ApiUrl}/api/products/${id}`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
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

  // Función para reenviar producto a validación
  const resubmitToValidation = async () => {
    if (!product?.id) return

    setIsResubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${ApiUrl}/api/products/${product.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status_id: 1 })
      })

      if (!response.ok) {
        throw new Error("Error al reenviar producto a validación")
      }

      showNotification("Producto reenviado a validación exitosamente", "success")
      // Actualizar el estado del producto
      setProduct(prev => prev ? { ...prev, status_id: 1, rejection_reasons: undefined } : null)
    } catch (error) {
      console.error("Error al reenviar producto:", error)
      showNotification("Error al reenviar el producto a validación", "error")
    } finally {
      setIsResubmitting(false)
    }
  }

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
        <Button 
          variant="ghost" 
          className="mb-8 flex items-center gap-2 text-[#456882] hover:text-[#1B3C53] hover:bg-[#F9F3EF] transition-colors" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Volver</span>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            {/* Carrusel único: imagen o video en el mismo contenedor */}
            <div className="bg-gray-50 p-4 rounded-xl">
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
                    <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <span className="text-gray-500 font-medium">Sin imagen ni video</span>
                    </div>
                  )
                }

                const current = mediaItems[mediaIndex % mediaItems.length]
                const prev = () => setMediaIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)
                const next = () => setMediaIndex((i) => (i + 1) % mediaItems.length)

                return (
                  <div className="relative">
                    <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner">
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all backdrop-blur-sm border border-gray-200"
                        >
                          <ArrowLeft className="h-5 w-5 text-[#1B3C53]" />
                        </button>
                        <button
                          type="button"
                          aria-label="Siguiente"
                          onClick={next}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all backdrop-blur-sm border border-gray-200"
                        >
                          <ArrowRight className="h-5 w-5 text-[#1B3C53]" />
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

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {product.category && (
                  <Badge variant="outline" className="px-4 py-1.5 text-sm font-semibold border-2 border-[#1B3C53] text-[#1B3C53]">
                    {product.category}
                  </Badge>
                )}
                {product.status_id === 3 && (
                  <Badge className="bg-red-600 text-white px-4 py-1.5 text-sm font-semibold shadow-md border-2 border-red-700/20">
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Rechazado
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-[#1B3C53] leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(product.rating) ? "fill-current" : "stroke-current fill-none opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#456882] font-medium ml-1">({product.rating})</span>
              </div>
            </div>

            {/* Si el producto está rechazado, mostrar solo razones de rechazo y descripción */}
            {product.status_id === 3 ? (
              <>
                {/* Sección de razones de rechazo - Arriba de la descripción */}
                {product.rejection_reasons && (() => {
                  // Manejar diferentes formatos de rejection_reasons
                  let reasons: any = product.rejection_reasons
                  if (typeof reasons === 'string') {
                    try {
                      reasons = JSON.parse(reasons)
                    } catch (e) {
                      reasons = null
                    }
                  }

                  if (!reasons) return null

                  const predefinedReasons = reasons.predefinedReasons || reasons.predefined_reasons || []
                  const customReason = reasons.customReason || reasons.custom_reason || ''
                  const allReasons = reasons.allReasons || reasons.all_reasons || []

                  // Priorizar mostrar predefinedReasons si existen, sino allReasons
                  const hasPredefined = Array.isArray(predefinedReasons) && predefinedReasons.length > 0
                  const hasCustom = customReason && typeof customReason === 'string' && customReason.trim()
                  const hasAllReasons = Array.isArray(allReasons) && allReasons.length > 0

                  if (!hasPredefined && !hasCustom && !hasAllReasons) return null

                  return (
                    <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 shadow-lg">
                      <CardHeader className="pb-4 bg-red-600/10 border-b border-red-200 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-600 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-xl font-bold text-red-900">Razón de Rechazo</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        {/* Mostrar razones predefinidas (las que se seleccionaron en validaciones) */}
                        {hasPredefined && (
                          <div className="space-y-3">
                            {predefinedReasons.map((reason: string, index: number) => (
                              <div 
                                key={index} 
                                className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm"
                              >
                                <XCircle className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
                                <span className="text-[#1B3C53] font-medium leading-relaxed">{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Mostrar allReasons si no hay predefinedReasons pero hay allReasons */}
                        {!hasPredefined && hasAllReasons && (
                          <div className="space-y-3">
                            {allReasons.map((reason: string, index: number) => (
                              <div 
                                key={index} 
                                className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm"
                              >
                                <XCircle className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
                                <span className="text-[#1B3C53] font-medium leading-relaxed">{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Motivo personalizado */}
                        {hasCustom && (
                          <div className="p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                            <p className="text-[#1B3C53] leading-relaxed">{customReason}</p>
                          </div>
                        )}

                        {/* Botón para reenviar a validación */}
                        <div className="pt-4 border-t-2 border-red-200">
                          <Button
                            onClick={resubmitToValidation}
                            disabled={isResubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                          >
                            <RotateCcw className={`h-5 w-5 mr-2 ${isResubmitting ? 'animate-spin' : ''}`} />
                            {isResubmitting ? 'Reenviando...' : 'Reenviar a Validación'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* Descripción del producto */}
                <div className="bg-gradient-to-br from-[#F9F3EF] to-[#E8DDD4] p-6 rounded-xl border border-[#E8DDD4] shadow-sm">
                  <h3 className="text-xl font-bold text-[#1B3C53] mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#1B3C53] rounded-full"></span>
                    Descripción del Producto
                  </h3>
                  <p className="text-[#456882] leading-relaxed text-base">{product.description}</p>
                </div>
              </>
            ) : (
              <>
                {/* Para productos no rechazados, mostrar precio, cantidad y añadir al carrito */}
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
              </>
            )}

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-lg text-[#1B3C53] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#1B3C53] rounded-full"></span>
                Información del Producto
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-[#456882] font-medium">Categoría:</span>
                  <span className="text-[#1B3C53] font-semibold">{translateCategory(product.category) || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-[#456882] font-medium">Disponibilidad:</span>
                  <Badge className={product.inStock ? "bg-green-600 text-white font-semibold" : "bg-red-600 text-white font-semibold"}>
                    {product.inStock ? "En Stock" : "Agotado"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#456882] font-medium">Vendedor:</span>
                  <Link 
                    href={`/user/${product.id}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-semibold transition-colors"
                  >
                    Usuario
                    <ArrowRight className="h-4 w-4" />
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
