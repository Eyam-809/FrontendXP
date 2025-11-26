"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Star, Heart, ShoppingCart, ArrowLeft, ArrowRight, Plus, Minus, XCircle, AlertTriangle, CheckCircle, RotateCcw, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { useIsMobile } from "@/hooks/use-mobile"
import MobileProductDetail from "@/components/mobile/mobile-product-detail"

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

// Razones predefinidas para rechazo de producto
const REJECTION_REASONS = [
  "Información incompleta o incorrecta",
  "Imágenes de baja calidad o inapropiadas",
  "Precio no razonable o fuera de rango",
  "Producto no cumple políticas de la plataforma",
  "Categoría o subcategoría incorrecta",
  "Descripción engañosa o poco clara",
  "Producto duplicado",
  "Contenido ofensivo o inapropiado",
]

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
  const isMobile = useIsMobile()
  const [product, setProduct] = useState<ExtendedProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mediaIndex, setMediaIndex] = useState(0)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [customReason, setCustomReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

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

  // Función para aprobar producto
  const approveProduct = async () => {
    if (!product?.id) return

    setIsApproving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${ApiUrl}/api/products/${product.id}/status`, {
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
      // Actualizar el estado del producto
      setProduct(prev => prev ? { ...prev, status_id: 2 } : null)
      // Redirigir después de un momento
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (error) {
      console.error("Error al aprobar producto:", error)
      showNotification("Error al aprobar el producto", "error")
    } finally {
      setIsApproving(false)
    }
  }

  // Función para abrir el modal de rechazo
  const openRejectDialog = () => {
    setSelectedReasons([])
    setCustomReason("")
    setRejectDialogOpen(true)
  }

  // Función para cerrar el modal de rechazo
  const closeRejectDialog = () => {
    setRejectDialogOpen(false)
    setSelectedReasons([])
    setCustomReason("")
  }

  // Función para manejar el cambio de razones seleccionadas
  const handleReasonToggle = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    )
  }

  // Función para rechazar producto
  const confirmRejectProduct = async () => {
    if (!product?.id) return

    // Validar que se haya seleccionado al menos una razón o escrito un motivo personalizado
    if (selectedReasons.length === 0 && !customReason.trim()) {
      showNotification("Por favor selecciona al menos una razón o escribe un motivo de rechazo", "error")
      return
    }

    setIsRejecting(true)
    try {
      const token = localStorage.getItem("token")
      
      // Preparar las razones del rechazo
      const rejectionReasons = {
        predefinedReasons: selectedReasons,
        customReason: customReason.trim(),
        allReasons: [
          ...selectedReasons,
          ...(customReason.trim() ? [customReason.trim()] : [])
        ]
      }

      const response = await fetch(`${ApiUrl}/api/products/${product.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          status_id: 3,
          rejection_reasons: rejectionReasons
        })
      })

      if (!response.ok) {
        throw new Error("Error al rechazar producto")
      }

      showNotification("Producto rechazado exitosamente", "success")
      // Actualizar el estado del producto
      setProduct(prev => prev ? { ...prev, status_id: 3, rejection_reasons: rejectionReasons } : null)
      closeRejectDialog()
      // Redirigir después de un momento
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (error) {
      console.error("Error al rechazar producto:", error)
      showNotification("Error al rechazar el producto", "error")
    } finally {
      setIsRejecting(false)
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

  // Si es mobile, usar la vista móvil
  if (isMobile) {
    return <MobileProductDetail product={product} />
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
                {product.status_id === 1 && (
                  <Badge className="bg-yellow-500 text-white px-4 py-1.5 text-sm font-semibold shadow-md">
                    Pendiente
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
                <div className="bg-gradient-to-br from-[#F9F3EF] to-[#E8DDD4] p-6 rounded-xl border border-[#E8DDD4] shadow-sm mb-6">
                  <h3 className="text-xl font-bold text-[#1B3C53] mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#1B3C53] rounded-full"></span>
                    Descripción del Producto
                  </h3>
                  <p className="text-[#456882] leading-relaxed text-base">{product.description}</p>
                </div>

                {/* Botón principal para volver a validar */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-blue-600 rounded-full">
                      <RotateCcw className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#1B3C53] mb-2">¿Quieres volver a enviar este producto a validación?</h4>
                      <p className="text-sm text-[#456882] mb-4">
                        El producto será reenviado para su revisión nuevamente
                      </p>
                    </div>
                    <Button
                      onClick={resubmitToValidation}
                      disabled={isResubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                    >
                      <RotateCcw className={`h-5 w-5 mr-2 ${isResubmitting ? 'animate-spin' : ''}`} />
                      {isResubmitting ? 'Reenviando...' : 'Volver a Validar'}
                    </Button>
                  </div>
                </div>
              </>
            ) : product.status_id === 1 ? (
              <>
                {/* Para productos pendientes de validación, mostrar botones de aprobar y rechazar */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">${price.toFixed(2)}</span>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className="flex gap-3 mb-6">
                  <Button
                    onClick={approveProduct}
                    disabled={isApproving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    <CheckCircle className={`h-5 w-5 mr-2 ${isApproving ? 'animate-spin' : ''}`} />
                    {isApproving ? 'Aprobando...' : 'Aprobar Producto'}
                  </Button>
                  <Button
                    onClick={openRejectDialog}
                    disabled={isRejecting}
                    variant="destructive"
                    className="flex-1 font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Rechazar Producto
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Para productos aprobados (status_id === 2), mostrar precio, cantidad y añadir al carrito */}
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

      {/* Modal de Rechazo de Producto */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white shadow-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E8DDD4]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-[#1B3C53]">
                  Rechazar Producto
                </DialogTitle>
                <DialogDescription className="text-[#456882] mt-1">
                  Selecciona las razones por las cuales se rechaza este producto
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-200px)]">
            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda: Razones predefinidas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1B3C53]" />
                  <Label className="text-base font-semibold text-[#1B3C53]">
                    Razones de rechazo
                  </Label>
                  <span className="text-xs text-[#456882]">(selecciona una o más)</span>
                </div>
                <div className="space-y-2 border-2 border-[#E8DDD4] rounded-xl p-4 bg-gradient-to-br from-[#F9F3EF] to-[#FFFFFF] shadow-inner max-h-[400px] overflow-y-auto">
                  {REJECTION_REASONS.map((reason, index) => (
                    <div 
                      key={reason} 
                      className={`flex items-start space-x-2 p-2 rounded-lg transition-all duration-200 ${
                        selectedReasons.includes(reason) 
                          ? 'bg-[#E8DDD4] border-2 border-[#1B3C53] shadow-sm' 
                          : 'bg-white hover:bg-[#F9F3EF] border-2 border-transparent hover:border-[#E8DDD4]'
                      }`}
                    >
                      <Checkbox
                        id={`reason-${index}`}
                        checked={selectedReasons.includes(reason)}
                        onCheckedChange={() => handleReasonToggle(reason)}
                        className="mt-0.5 h-4 w-4 data-[state=checked]:bg-[#1B3C53] data-[state=checked]:border-[#1B3C53]"
                      />
                      <Label
                        htmlFor={`reason-${index}`}
                        className={`text-xs font-medium cursor-pointer leading-tight flex-1 ${
                          selectedReasons.includes(reason) 
                            ? 'text-[#1B3C53]' 
                            : 'text-[#456882]'
                        }`}
                      >
                        {reason}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna derecha: Cuadro de texto para razones adicionales */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1B3C53]" />
                  <Label className="text-base font-semibold text-[#1B3C53]">
                    Motivos adicionales
                  </Label>
                  <span className="text-xs text-[#456882]">(opcional)</span>
                </div>
                <Textarea
                  placeholder="Escribe aquí cualquier motivo adicional o detalle sobre el rechazo del producto..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="min-h-[400px] max-h-[400px] resize-none border-2 border-[#E8DDD4] focus:border-[#1B3C53] focus:ring-2 focus:ring-[#1B3C53]/20 rounded-xl p-4 text-sm text-[#456882] placeholder:text-[#456882]/60 bg-white shadow-inner"
                />
                {(selectedReasons.length === 0 && !customReason.trim()) && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Debes seleccionar al menos una razón o escribir un motivo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <DialogFooter className="flex gap-3 px-6 py-4 border-t border-[#E8DDD4] bg-gradient-to-r from-[#F9F3EF] to-white">
            <Button
              onClick={closeRejectDialog}
              variant="outline"
              className="flex-1 sm:flex-1 border-2 border-[#456882] text-[#456882] hover:bg-[#456882] hover:text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <X className="h-5 w-5 mr-2" />
              Salir
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejectProduct}
              disabled={isRejecting || (selectedReasons.length === 0 && !customReason.trim())}
              className="flex-1 sm:flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:hover:shadow-md"
            >
              <XCircle className="h-5 w-5 mr-2" />
              {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
    </div>
  )
}
