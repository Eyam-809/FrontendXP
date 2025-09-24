"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star, Heart, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"

interface ProductGridProps {
  products?: any[] // opcional, si no se pasa hace fetch de todos
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { state, dispatch } = useApp()
  const [productos, setProductos] = useState<any[]>(products || [])
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [loading, setLoading] = useState(!products)
  const [error, setError] = useState<string | null>(null)

  // Añadir al carrito
  const addToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: "ADD_TO_CART", payload: product })
  }

  // Añadir/Remover favoritos
  const toggleFavorite = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isFavorite = state.favorites.some((fav) => fav.id === product.id)
    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: product.id })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: product })
    }
  }

  // Fetch productos si no se pasan por props
  useEffect(() => {
    if (products) return // ya tenemos los productos

    const fetchProductos = async () => {
      try {
        const response = await fetch("https://backendxp-1.onrender.com/api/products")
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {products ? "Productos filtrados" : "Todos los productos"}
        </h2>
        <div className="text-sm text-gray-500">
          {productos.length} producto{productos.length !== 1 ? "s" : ""} encontrado
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((product, index) => {
          const finalPrice = product.stock > 0
            ? product.price * (1 - (product.discount || 0) / 100)
            : product.price

          const isFavorite = state.favorites.some((fav) => fav.id === product.id)

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "tween" }}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-contain p-4 cursor-pointer"
                  />

                  {product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{product.discount}%</Badge>
                  )}

                  {product.isNew && (
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Nuevo</Badge>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredProduct === product.id ? 1 : 0 }}
                    className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={(e) => addToCart(product, e)}>
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                </div>

                <div className="p-4">
                  <div className="text-xs text-purple-600 font-medium mb-1">{product.subcategory}</div>
                  <h3 className="font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "fill-current" : "stroke-current fill-none"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold text-lg text-gray-800">${finalPrice.toFixed(2)}</span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`${isFavorite ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
                      onClick={(e) => toggleFavorite(product, e)}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                      <span className="sr-only">Añadir a favoritos</span>
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
