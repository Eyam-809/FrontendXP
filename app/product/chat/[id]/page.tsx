"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import ImageZoom from "@/components/image-zoom"

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

const translateCategory = (category: string) => {
  const translations: Record<string, string> = {
    Electronics: "Electrónicos",
    Fashion: "Moda",
    Home: "Hogar",
    Sports: "Deportes",
    Beauty: "Belleza",
    Toys: "Juguetes",
    Gaming: "Gaming"
  }
  return translations[category] || category
}

export default function ChatProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<GlobalProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Simular datos del producto (en una implementación real, esto vendría del backend)
        const mockProducts: GlobalProduct[] = [
          {
            id: 1,
            name: "iPhone 14 Pro Max",
            description: "iPhone 14 Pro Max en excelente estado, solo 6 meses de uso. Incluye cargador original y funda de regalo. Color Space Black, 256GB.",
            price: 14999,
            originalPrice: 24999,
            image: "/placeholder.jpg",
            category: "Electronics",
            condition: "Como nuevo",
            location: "Ciudad de México",
            createdAt: "2024-02-15T10:30:00",
            views: 156,
            likes: 23,
            seller: {
              id: 1,
              name: "Ana Martínez",
              avatar: "/placeholder-user.jpg",
              rating: 4.8,
              isOnline: true
            }
          },
          {
            id: 2,
            name: "MacBook Air M2",
            description: "MacBook Air con chip M2, 8GB RAM, 256GB SSD. Perfecto para trabajo y estudio. Incluye funda y mouse inalámbrico.",
            price: 16099,
            originalPrice: 22999,
            image: "/placeholder.jpg",
            category: "Electronics",
            condition: "Bueno",
            location: "Guadalajara",
            createdAt: "2024-02-15T09:15:00",
            views: 89,
            likes: 15,
            seller: {
              id: 2,
              name: "Carlos López",
              avatar: "/placeholder-user.jpg",
              rating: 4.6,
              isOnline: false
            }
          }
        ]

        const foundProduct = mockProducts.find(p => p.id === Number(id))
        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          // Si no se encuentra en los datos mock, intentar obtener del backend
          const response = await fetch(`https://backendxp-1.onrender.com/api/products/${id}`)
          if (response.ok) {
            const data = await response.json()
            setProduct(data)
          } else {
            router.push("/global-chat")
          }
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error)
        router.push("/global-chat")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id, router])

  const startConversation = () => {
    if (!product) return

    // Crear una nueva conversación
    const newConversation = {
      id: Date.now(),
      sellerId: product.seller.id,
      sellerName: product.seller.name,
      sellerAvatar: product.seller.avatar,
      productId: product.id,
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
      conv.sellerId === product.seller.id && conv.productId === product.id
    )

    if (!conversationExists) {
      const updatedConversations = [...existingConversations, newConversation]
      localStorage.setItem('conversations', JSON.stringify(updatedConversations))
    }

    // Redirigir al perfil con la pestaña de conversaciones activa
    router.push('/profile/personal-info?tab=conversations')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3C53] mx-auto"></div>
          <p className="mt-4 text-[#456882]">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">Producto no encontrado</h2>
          <Button onClick={() => router.push("/global-chat")}>
            Volver al Chat Global
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center text-[#456882] hover:text-[#1B3C53]" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagen del producto */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E8DDD4]">
            <ImageZoom
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg"
              style={{ maxHeight: "500px" }}
            />
            <p className="text-sm text-[#456882] mt-2 text-center">
              Pasa el mouse sobre la imagen y haz clic para hacer zoom
            </p>
          </div>

          {/* Información del producto */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E8DDD4]">
            <div className="mb-6">
              <Badge variant="outline" className="mb-3 text-[#1B3C53] border-[#E8DDD4]">
                {translateCategory(product.category)}
              </Badge>
              <h1 className="text-3xl font-bold text-[#1B3C53] mb-4">{product.name}</h1>
            </div>

            <div className="mb-6">
              <p className="text-[#456882] leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Botón de iniciar conversación */}
            <div className="mb-8">
              <Button
                className="w-full bg-[#1B3C53] hover:bg-[#456882] text-white py-3 text-lg font-semibold"
                onClick={startConversation}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Iniciar Conversación
              </Button>
            </div>

            {/* Información del producto */}
            <div className="p-4 bg-[#F9F3EF] rounded-lg border border-[#E8DDD4]">
              <h4 className="font-semibold mb-3 text-[#1B3C53] text-lg">Información del Producto</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#456882]">Categoría:</span>
                  <span className="text-[#1B3C53] font-medium">{translateCategory(product.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#456882]">Condición:</span>
                  <span className="text-[#1B3C53] font-medium">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#456882]">Ubicación:</span>
                  <span className="text-[#1B3C53] font-medium">{product.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#456882]">Vendedor:</span>
                  <span className="text-[#1B3C53] font-medium">{product.seller.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

