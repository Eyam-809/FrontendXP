"use client"

import React, { useEffect, useState } from "react"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"
import "./mobile-product-grid.css"

interface MobileProductGridProps {
  products?: any[]
}

export default function MobileProductGrid({ products }: MobileProductGridProps) {
  const { state, dispatch } = useApp()
  const { showNotification } = useNotification()
  const [productos, setProductos] = useState<any[]>(products || [])
  const [loading, setLoading] = useState(!products)

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

  useEffect(() => {
    if (products) return

    const fetchProductos = async () => {
      try {
        const response = await fetch(`${ApiUrl}/api/products`)
        if (!response.ok) throw new Error("Error al cargar productos")
        const data = await response.json()
        setProductos(data)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchProductos()
  }, [products])

  if (loading) return <div className="mobile-loading">Cargando productos...</div>
  if (!productos || productos.length === 0) return <div className="mobile-empty">No hay productos disponibles.</div>

  return (
    <section className="mobile-product-grid-section">
      <h2 className="mobile-product-grid-title">Productos</h2>
      <div className="mobile-product-grid">
        {productos.map((product) => {
          const finalPrice = product.stock > 0
            ? product.price * (1 - (product.discount || 0) / 100)
            : product.price
          const originalPrice = product.discount > 0 ? product.price : null
          const isFavorite = state.favorites.some((fav) => fav.id === product.id)

          const imageSrc = product.image?.startsWith("data:image")
            ? product.image
            : product.image?.startsWith("http")
            ? product.image
            : product.image?.startsWith("/")
            ? `${ApiUrl}${product.image}`
            : `${ApiUrl}/storage/${product.image}`

          return (
            <Link key={product.id} href={`/product/${product.id}`} className="mobile-product-card">
              <div className="mobile-product-image-wrapper">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="mobile-product-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.png'
                  }}
                />
                
                <Button
                  size="icon"
                  variant="ghost"
                  className={`mobile-product-favorite ${isFavorite ? "active" : ""}`}
                  onClick={(e) => toggleFavorite(product, e)}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                </Button>

                {product.discount > 0 && (
                  <Badge className="mobile-product-discount">-{product.discount}%</Badge>
                )}
                {product.isNew && (
                  <Badge className="mobile-product-new">Nuevo</Badge>
                )}
              </div>

              <div className="mobile-product-info">
                {product.subcategory && (
                  <div className="mobile-product-category">{product.subcategory}</div>
                )}
                
                <h3 className="mobile-product-name">{product.name}</h3>

                <div className="mobile-product-rating">
                  <div className="mobile-rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-current text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="mobile-rating-number">({product.rating || 0})</span>
                </div>

                <div className="mobile-product-price-section">
                  <span className="mobile-product-price">${finalPrice.toFixed(2)}</span>
                  {originalPrice && (
                    <span className="mobile-product-original-price">${originalPrice.toFixed(2)}</span>
                  )}
                </div>

                {product.stock !== undefined && (
                  <div className="mobile-product-stock">
                    {product.stock > 0 ? (
                      <Badge className="mobile-stock-badge available">En Stock</Badge>
                    ) : (
                      <Badge className="mobile-stock-badge unavailable">Agotado</Badge>
                    )}
                  </div>
                )}

                <Button
                  className="mobile-product-cart-button"
                  onClick={(e) => addToCart(product, e)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

