"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star, Heart, ShoppingCart, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"
import CategoryNavbar from "@/components/category-navbar"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"

interface ProductGridProps {
  products?: any[] // opcional, si no se pasa hace fetch de todos
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { state, dispatch } = useApp()
  const { showNotification } = useNotification()
  const [productos, setProductos] = useState<any[]>(products || [])
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [loading, setLoading] = useState(!products)
  const [error, setError] = useState<string | null>(null)

  // Añadir al carrito
  const addToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Verificar stock disponible
    const productStock = product.stock !== undefined ? Number(product.stock) : null
    if (productStock !== null && productStock <= 0) {
      showNotification(`"${product.name}" no está disponible en stock`, "error")
      return
    }
    
    // Verificar si el producto ya está en el carrito y su cantidad
    const existingItem = state.cart.find((item) => item.id === product.id)
    if (existingItem && productStock !== null) {
      const currentQuantity = existingItem.quantity || 0
      if (currentQuantity >= productStock) {
        showNotification(`Has alcanzado el límite de stock disponible para "${product.name}" (${productStock} unidades)`, "warning")
        return
      }
    }
    
    dispatch({ type: "ADD_TO_CART", payload: product })
    showNotification(`"${product.name}" fue agregado al carrito`, "success")
  }

  // Añadir/Remover favoritos
  const toggleFavorite = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isFavorite = state.favorites.some((fav) => fav.id === product.id)
    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: product.id })
      showNotification(`"${product.name}" fue eliminado de favoritos`, "info")
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: product })
      showNotification(`"${product.name}" fue agregado a favoritos`, "success")
    }
  }

  // Limpiar filtro de subcategoría
  const clearFilter = () => {
    dispatch({ type: "SET_SELECTED_SUBCATEGORY", payload: null })
  }

  // Fetch productos si no se pasan por props
  useEffect(() => {
    if (products) return // ya tenemos los productos

    const fetchProductos = async () => {
      try {
        const response = await fetch(`${ApiUrl}/api/products`)
        if (!response.ok) throw new Error("Error al cargar productos")
        const data = await response.json()
        setProductos(data)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Error al cargar productos")
        setLoading(false)
      }
    }

    fetchProductos()
  }, [products])

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>
  if (!productos || productos.length === 0) return <p className="text-center mt-10 text-gray-500">No hay productos disponibles.</p>

  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3C53]">
          {products ? "Productos filtrados" : "Todos los productos"}
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          {products && (
            <Button
              onClick={clearFilter}
              variant="outline"
              className="bg-white border-2 border-[#1B3C53] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-white transition-all duration-200 font-semibold"
            >
              <X className="h-4 w-4 mr-2" />
              Borrar Filtro
            </Button>
          )}
          <div className="text-sm font-medium text-[#456882] bg-[#F9F3EF] px-4 py-2 rounded-lg">
            {productos.length} producto{productos.length !== 1 ? "s" : ""} encontrado{productos.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <CategoryNavbar />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((product, index) => {
          const finalPrice = product.stock > 0
            ? product.price * (1 - (product.discount || 0) / 100)
            : product.price
          const originalPrice = product.discount > 0 ? product.price : null

          const isFavorite = state.favorites.some((fav) => fav.id === product.id)
          
          // Manejar imagen
          const imageSrc = product.image?.startsWith("data:image")
            ? product.image
            : product.image?.startsWith("http")
            ? product.image
            : product.image?.startsWith("/")
            ? `${ApiUrl}${product.image}`
            : `${ApiUrl}/storage/${product.image}`

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden border-0 group transition-all duration-300 hover:-translate-y-1"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "tween", duration: 0.3 }}
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 cursor-pointer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png'
                    }}
                  />

                  {/* Overlay gradient al hacer hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.discount > 0 && (
                      <Badge className="bg-red-600 text-white shadow-lg px-3 py-1 font-bold text-xs border-2 border-white/20">
                        -{product.discount}%
                      </Badge>
                  )}
                  {product.isNew && (
                      <Badge className="bg-green-600 text-white shadow-lg px-3 py-1 font-bold text-xs border-2 border-white/20">
                        Nuevo
                      </Badge>
                  )}
                  </div>

                  {/* Botones de acción al hacer hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: hoveredProduct === product.id ? 1 : 0,
                      y: hoveredProduct === product.id ? 0 : 10
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10"
                  >
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="bg-white/95 hover:bg-[#456882] hover:text-white shadow-lg backdrop-blur-sm border border-gray-200 hover:border-[#456882]"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                        <Eye className="h-4 w-4" />
                      </Button>
                    <Button 
                      size="sm" 
                      className="bg-[#1B3C53] hover:bg-[#2d5a7a] text-white shadow-lg"
                      onClick={(e) => addToCart(product, e)}
                    >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                  </motion.div>

                  {/* Botón de favoritos */}
                    <Button
                      size="icon"
                      variant="ghost"
                    className={`absolute top-3 right-3 bg-white/95 hover:bg-[#456882] shadow-lg backdrop-blur-sm border border-gray-200 hover:border-[#456882] ${isFavorite ? "text-red-600 hover:text-white" : "text-gray-600 hover:text-white"}`}
                      onClick={(e) => toggleFavorite(product, e)}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                      <span className="sr-only">Añadir a favoritos</span>
                    </Button>
                  </div>

                <div className="p-5 space-y-3">
                  {/* Subcategoría */}
                  {product.subcategory && (
                    <div className="text-xs font-semibold text-[#456882] uppercase tracking-wide">
                      {product.subcategory}
                    </div>
                  )}

                  {/* Nombre del producto */}
                  <h3 className="font-bold text-lg text-[#1B3C53] line-clamp-2 min-h-[3.5rem] group-hover:text-[#2d5a7a] transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 0) 
                              ? "fill-current" 
                              : "stroke-current fill-none opacity-30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#456882] font-medium">
                      ({product.rating || 0})
                    </span>
                  </div>

                  {/* Precio */}
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-bold text-[#1B3C53]">
                      ${finalPrice.toFixed(2)}
                    </span>
                    {originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  {product.stock !== undefined && (
                    <div className="pt-2">
                      {product.stock > 0 ? (
                        <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold">
                          En Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border border-red-300 text-xs font-semibold">
                          Agotado
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
