"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, ShoppingCart, Star } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/app-context"

interface FavoritesGridProps {
  products: any[]
}

export default function FavoritesGrid({ products }: FavoritesGridProps) {
  const { dispatch } = useApp()

  const removeFromFavorites = (productId: number) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: productId })
  }

  const addToCart = (product: any) => {
    dispatch({ type: "ADD_TO_CART", payload: product })
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes favoritos</h3>
          <p className="text-gray-500 mb-4">Explora productos y agrega tus favoritos para verlos aquí</p>
          <Link href="/">
            <Button>
              Explorar productos
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badge de descuento si existe */}
            {product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-[#E63946] text-white">
                -{product.discount}%
              </Badge>
            )}

            {/* Botón de favoritos */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-[#456882] hover:text-white"
              onClick={() => removeFromFavorites(product.id)}
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500 hover:fill-white hover:text-white" />
            </Button>

            {/* Overlay con información rápida */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                <Link href={`/product/${product.id}`}>
                  <Button variant="secondary" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </Link>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2">
                {product.name}
              </h3>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 mb-3">
              <p className="text-2xl font-bold text-red-600">
                ${product.price.toLocaleString()}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <Link href={`/product/${product.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver producto
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 