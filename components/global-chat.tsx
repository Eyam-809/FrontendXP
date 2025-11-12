"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, MessageCircle, Heart, Eye, Star, Clock, MapPin, User, Package } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { ApiUrl } from "@/lib/config"

interface GlobalProduct {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  condition: string
  location: string
  createdAt: string
  views: number
  likes: number
  seller: {
    id: number
    name: string
    avatar: string
    rating: number
    isOnline: boolean
  }
}

interface GlobalChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalChat({ isOpen, onClose }: GlobalChatProps) {
  const { state } = useApp()
  const router = useRouter()
  const [products, setProducts] = useState<GlobalProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const loadGlobalProducts = async () => {
      try {
        const response = await fetch(`${ApiUrl}/api/products`)
        const data = await response.json()
        setProducts(data) // Asume que el backend devuelve un array de productos
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading global products:", error)
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadGlobalProducts()
    }
  }, [isOpen])

  const categories = [
    { id: "all", name: "Todos", icon: Globe },
    { id: "Electronics", name: "Electrónicos", icon: Package },
    { id: "Fashion", name: "Moda", icon: User },
    { id: "Gaming", name: "Gaming", icon: Package },
    { id: "Sports", name: "Deportes", icon: Package }
  ]

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Hace unos minutos"
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  const startChat = (sellerId: number, productId: number) => {
    // Encontrar el producto y vendedor para obtener más información
    const product = products.find(p => p.id === productId)
    if (!product) return

    // Crear una nueva conversación con información completa
    const newConversation = {
      id: Date.now(),
      sellerId,
      sellerName: product.seller.name,
      sellerAvatar: product.seller.avatar,
      productId,
      productName: product.name,
      productImage: product.image,
      productPrice: product.price,
      timestamp: new Date().toISOString(),
      lastMessage: "Conversación iniciada",
      unreadCount: 0
    }

    // Guardar la conversación en localStorage
    const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    const conversationExists = existingConversations.find((conv: any) => 
      conv.sellerId === sellerId && conv.productId === productId
    )

    if (!conversationExists) {
      const updatedConversations = [...existingConversations, newConversation]
      localStorage.setItem('conversations', JSON.stringify(updatedConversations))
    }

    // Cerrar el modal del chat global
    onClose()
    
    // Redirigir al perfil con la pestaña de conversaciones activa
    router.push('/profile/personal-info?tab=conversations')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-[#1B3C53]" />
            <div>
              <h2 className="text-xl font-bold">Chat Global</h2>
              <p className="text-sm text-gray-500">Descubre productos de toda la comunidad</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Cerrar</span>
            ×
          </Button>
        </div>

        {/* Filtros de categoría */}
        <div className="p-4 border-b">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3C53]"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos</h3>
              <p className="text-gray-500">No se encontraron productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <Badge variant="outline" className="absolute top-2 right-2 bg-white/90">
                      {product.condition}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#1B3C53] truncate">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={product.seller.avatar} />
                        <AvatarFallback className="text-xs bg-yellow-100 text-yellow-700">
                          {product.seller.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm text-[#1B3C53]">{product.seller.name}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-yellow-600">{product.seller.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{formatTime(product.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-yellow-500" />
                          <span>{product.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3 text-red-400" />
                          <span>{product.likes}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-yellow-500" />
                        <span>{product.location}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button 
                        className="flex-1 bg-[#1B3C53] hover:bg-[#456882]"
                        size="sm"
                        onClick={() => startChat(product.seller.id, product.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Iniciar Chat
                      </Button>
                      <Link href={`/product/chat/${product.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-[#E8DDD4] text-[#1B3C53] hover:bg-[#F9F3EF]">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Producto
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}