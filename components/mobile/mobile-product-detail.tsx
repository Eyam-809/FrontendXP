"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, ShoppingCart, Plus, Minus, Star, XCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/contexts/app-context"
import { ApiUrl } from "@/lib/config"
import Link from "next/link"
import MobileNavbar from "./mobile-navbar"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import Footer from "@/components/footer"
import "./mobile-product-detail.css"

interface MobileProductDetailProps {
  product: any
}

export default function MobileProductDetail({ product }: MobileProductDetailProps) {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const [quantity, setQuantity] = useState(1)
  const [mediaIndex, setMediaIndex] = useState(0)
  const [isResubmitting, setIsResubmitting] = useState(false)

  const isFavorite = state.favorites.some((fav) => fav.id === product.id)
  const isInCart = state.cart.some((item) => item.id === product.id)

  const finalPrice = product.stock > 0
    ? product.price * (1 - (product.discount || 0) / 100)
    : product.price

  const imageSrc = product.image?.startsWith("data:image")
    ? product.image
    : product.image?.startsWith("http")
    ? product.image
    : product.image?.startsWith("/")
    ? `${ApiUrl}${product.image}`
    : `${ApiUrl}/storage/${product.image}`

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: product.id })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: product })
    }
  }

  const addToCart = () => {
    dispatch({ type: "ADD_TO_CART", payload: { ...product, quantity } })
  }

  const resubmitToValidation = async () => {
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
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsResubmitting(false)
    }
  }

  // Parse rejection reasons
  const rejectionReasons = product.rejection_reasons
    ? typeof product.rejection_reasons === 'string'
      ? JSON.parse(product.rejection_reasons)
      : product.rejection_reasons
    : null

  return (
    <div className="mobile-product-detail">
      <MobileNavbar />
      {/* Header */}
      <div className="mobile-product-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mobile-back-button"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFavorite}
          className={`mobile-favorite-button ${isFavorite ? "active" : ""}`}
        >
          <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Image Carousel */}
      <div className="mobile-product-images">
        <div className="mobile-product-image-container">
          <img
            src={imageSrc}
            alt={product.name}
            className="mobile-product-main-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png'
            }}
          />
          {product.discount > 0 && (
            <Badge className="mobile-product-discount-badge">
              -{product.discount}%
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="mobile-product-content">
        {product.subcategory && (
          <div className="mobile-product-category">{product.subcategory}</div>
        )}

        <h1 className="mobile-product-title">{product.name}</h1>

        <div className="mobile-product-rating-section">
          <div className="mobile-product-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? "fill-current text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="mobile-product-rating-text">
            ({product.rating || 0})
          </span>
        </div>

        <div className="mobile-product-price-section">
          <span className="mobile-product-price">${finalPrice.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="mobile-product-original-price">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rejection Reasons (if rejected) */}
        {product.status_id === 3 && rejectionReasons && (
          <Card className="mobile-rejection-card">
            <CardContent className="mobile-rejection-content">
              <h3 className="mobile-rejection-title">
                <XCircle className="h-5 w-5" />
                Razón de Rechazo
              </h3>
              <div className="mobile-rejection-reasons">
                {Array.isArray(rejectionReasons.allReasons) &&
                  rejectionReasons.allReasons.map((reason: string, idx: number) => (
                    <div key={idx} className="mobile-rejection-reason">
                      <XCircle className="h-4 w-4" />
                      {reason}
                    </div>
                  ))}
                {rejectionReasons.customReason && (
                  <div className="mobile-rejection-reason">
                    <XCircle className="h-4 w-4" />
                    {rejectionReasons.customReason}
                  </div>
                )}
              </div>
              <Button
                onClick={resubmitToValidation}
                disabled={isResubmitting}
                className="mobile-resubmit-button"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isResubmitting ? "Enviando..." : "Reenviar a Validación"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <div className="mobile-product-description">
          <h2 className="mobile-section-title">Descripción del Producto</h2>
          <p className="mobile-description-text">{product.description || "Sin descripción disponible."}</p>
        </div>

        {/* Actions (only if not rejected or pending) */}
        {product.status_id !== 3 && product.status_id !== 1 && (
          <>
            <div className="mobile-product-quantity">
              <span className="mobile-quantity-label">Cantidad:</span>
              <div className="mobile-quantity-controls">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="mobile-quantity-button"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mobile-quantity-value">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="mobile-quantity-button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={addToCart}
              disabled={product.stock === 0 || isInCart}
              className="mobile-add-to-cart-button"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInCart ? "Ya en el Carrito" : product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
            </Button>
          </>
        )}

        {/* Stock Info */}
        {product.stock !== undefined && (
          <div className="mobile-product-stock-info">
            {product.stock > 0 ? (
              <Badge className="mobile-stock-badge available">En Stock</Badge>
            ) : (
              <Badge className="mobile-stock-badge unavailable">Agotado</Badge>
            )}
          </div>
        )}
      </div>
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
    </div>
  )
}

