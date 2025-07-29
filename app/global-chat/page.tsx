"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Globe, 
  MessageCircle, 
  Heart, 
  Eye, 
  Star,
  Clock,
  MapPin,
  User,
  Package,
  Search,
  Filter,
  Send,
  Hash,
  Users,
  Circle,
  Minus,
  X
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

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
    status: 'online' | 'idle' | 'dnd' | 'offline'
    activity?: string
  }
}

export default function GlobalChatPage() {
  const { state } = useApp()
  const router = useRouter()
  const [products, setProducts] = useState<GlobalProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<GlobalProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    // Simular carga de productos globales
    const loadGlobalProducts = async () => {
      try {
        const mockProducts: GlobalProduct[] = [
          {
            id: 1,
            name: "iPhone 14 Pro Max",
            description: "iPhone 14 Pro Max en excelente estado, solo 6 meses de uso. Incluye cargador original y funda de regalo. Color Space Black, 256GB.",
            price: Math.round(24999 * 0.6), // 60% del original
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
              isOnline: true,
              status: 'online',
              activity: "Vendiendo productos"
            }
          },
          {
            id: 2,
            name: "MacBook Air M2",
            description: "MacBook Air con chip M2, 8GB RAM, 256GB SSD. Perfecto para trabajo y estudio. Incluye funda y mouse inalámbrico.",
            price: Math.round(22999 * 0.7), // 30% menos
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
              isOnline: false,
              status: 'offline'
            }
          },
          {
            id: 3,
            name: "Nike Air Jordan 1",
            description: "Tenis Nike Air Jordan 1 Retro High OG, talla 9.5, color Chicago. Originales, solo usados 2 veces. Caja y papeles incluidos.",
            price: Math.round(6500 * 0.6),
            originalPrice: 6500,
            image: "/placeholder.jpg",
            category: "Fashion",
            condition: "Como nuevo",
            location: "Monterrey",
            createdAt: "2024-02-15T08:45:00",
            views: 234,
            likes: 45,
            seller: {
              id: 3,
              name: "Diego Ramírez",
              avatar: "/placeholder-user.jpg",
              rating: 4.9,
              isOnline: true,
              status: 'idle',
              activity: "Jugando a FIFA 24"
            }
          },
          {
            id: 4,
            name: "PlayStation 5",
            description: "PS5 Digital Edition con 2 controles DualSense y 3 juegos: Spider-Man 2, God of War Ragnarök y FIFA 24. Todo en perfecto estado.",
            price: Math.round(15999 * 0.7),
            image: "/placeholder.jpg",
            category: "Gaming",
            condition: "Excelente",
            location: "Puebla",
            createdAt: "2024-02-15T07:20:00",
            views: 312,
            likes: 67,
            seller: {
              id: 4,
              name: "Sofía García",
              avatar: "/placeholder-user.jpg",
              rating: 4.7,
              isOnline: true,
              status: 'online',
              activity: "En línea"
            }
          },
          {
            id: 5,
            name: "Cámara Canon EOS R6",
            description: "Cámara mirrorless Canon EOS R6 con lente RF 24-105mm f/4L. Ideal para fotografía profesional. Incluye trípode y bolsa.",
            price: Math.round(35999 * 0.6),
            originalPrice: 35999,
            image: "/placeholder.jpg",
            category: "Electronics",
            condition: "Bueno",
            location: "Querétaro",
            createdAt: "2024-02-15T06:10:00",
            views: 78,
            likes: 12,
            seller: {
              id: 5,
              name: "Roberto Silva",
              avatar: "/placeholder-user.jpg",
              rating: 4.5,
              isOnline: false,
              status: 'offline'
            }
          },
          {
            id: 6,
            name: "Bicicleta de Montaña Trek",
            description: "Bicicleta Trek Marlin 7, talla M, color azul. Perfecta para senderos y ciudad. Incluye luces, candado y bomba de aire.",
            price: Math.round(8500 * 0.7),
            image: "/placeholder.jpg",
            category: "Sports",
            condition: "Bueno",
            location: "Tijuana",
            createdAt: "2024-02-15T05:30:00",
            views: 145,
            likes: 28,
            seller: {
              id: 6,
              name: "María Fernández",
              avatar: "/placeholder-user.jpg",
              rating: 4.8,
              isOnline: true,
              status: 'dnd',
              activity: "No molestar"
            }
          },
          {
            id: 7,
            name: "iPad Pro 12.9",
            description: "iPad Pro 12.9 pulgadas con Apple Pencil 2. Perfecto para diseño y trabajo creativo. Incluye funda y teclado.",
            price: Math.round(19999 * 0.6),
            originalPrice: 19999,
            image: "/placeholder.jpg",
            category: "Electronics",
            condition: "Excelente",
            location: "Cancún",
            createdAt: "2024-02-15T04:15:00",
            views: 198,
            likes: 34,
            seller: {
              id: 7,
              name: "Laura Torres",
              avatar: "/placeholder-user.jpg",
              rating: 4.9,
              isOnline: true,
              status: 'online',
              activity: "Diseñando"
            }
          },
          {
            id: 8,
            name: "Adidas Ultraboost 22",
            description: "Tenis Adidas Ultraboost 22, talla 10, color blanco. Ideales para correr, muy cómodos y ligeros.",
            price: Math.round(4500 * 0.6),
            originalPrice: 4500,
            image: "/placeholder.jpg",
            category: "Fashion",
            condition: "Bueno",
            location: "Mérida",
            createdAt: "2024-02-15T03:45:00",
            views: 167,
            likes: 29,
            seller: {
              id: 8,
              name: "Javier Morales",
              avatar: "/placeholder-user.jpg",
              rating: 4.7,
              isOnline: false,
              status: 'offline'
            }
          }
        ]
        setProducts(mockProducts)
        setFilteredProducts(mockProducts)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading global products:", error)
        setIsLoading(false)
      }
    }
    loadGlobalProducts()
  }, [])

  useEffect(() => {
    // Filtrar y ordenar productos
    let filtered = products

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Ordenar productos
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "popular":
        filtered.sort((a, b) => b.views - a.views)
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchQuery, sortBy])

  const categories = [
    { id: "all", name: "Todos", icon: Globe },
    { id: "Electronics", name: "Electrónicos", icon: Package },
    { id: "Fashion", name: "Moda", icon: User },
    { id: "Gaming", name: "Gaming", icon: Package },
    { id: "Sports", name: "Deportes", icon: Package }
  ]

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Circle className="h-3 w-3 text-green-500 fill-current" />
      case 'idle':
        return <Circle className="h-3 w-3 text-yellow-500 fill-current" />
      case 'dnd':
        return <X className="h-3 w-3 text-red-500" />
      case 'offline':
        return <Circle className="h-3 w-3 text-gray-500" />
      default:
        return <Circle className="h-3 w-3 text-gray-500" />
    }
  }

  const startChat = (sellerId: number, productId: number) => {
    router.push(`/profile?tab=conversations&seller=${sellerId}&product=${productId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal rojo */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-4">
            <Hash className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Chat Global</h1>
              <p className="text-sm opacity-90">Descubre productos de toda la comunidad</p>
            </div>
          </div>
          {/* Barra de búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white text-gray-900 border-0 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      <div className="flex">
        {/* Chat principal */}
        <div className="flex-1 flex flex-col">
          {/* Filtros */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {/* Categorías */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 whitespace-nowrap text-xs ${selectedCategory === category.id ? 'bg-red-600 text-white' : 'border-red-600 text-red-600 hover:bg-red-50'} border-2`}
                  >
                    <category.icon className="h-3 w-3" />
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>
              {/* Ordenamiento */}
              <div className="flex items-center space-x-2">
                <Filter className="h-3 w-3 text-yellow-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border border-red-600 text-red-600 rounded px-2 py-1 bg-white"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="popular">Más populares</option>
                </select>
              </div>
            </div>
          </div>
          {/* Chat de productos */}
          <div className="flex-1 flex justify-center overflow-y-auto p-4">
            <div className="w-full max-w-4xl space-y-4 px-2 sm:px-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="bg-white border-red-200">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">No se encontraron productos</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No hay productos que coincidan con "${searchQuery}"`
                      : "No hay productos en esta categoría"
                    }
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex space-x-3 group">
                  {/* Avatar del vendedor */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={product.seller.avatar} />
                        <AvatarFallback className="text-xs bg-yellow-100 text-yellow-700">
                          {product.seller.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {/* Estado eliminado */}
                    </div>
                  </div>
                  {/* Mensaje del producto */}
                  <div className="flex-1 min-w-0">
                    {/* Header del mensaje */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-sm text-red-700">{product.seller.name}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-yellow-600">{product.seller.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{formatTime(product.createdAt)}</span>
                    </div>
                    {/* Contenido del mensaje */}
                    <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                      {/* Imagen del producto */}
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {product.originalPrice && (
                          <Badge className="absolute top-2 left-2 bg-red-600 text-xs text-white">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </Badge>
                        )}
                        <Badge variant="outline" className="absolute top-2 right-2 bg-yellow-100 text-xs border-yellow-400 text-yellow-700">
                          {product.condition}
                        </Badge>
                      </div>
                      {/* Información del producto */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-red-700">{product.name}</h3>
                        <p className="text-sm text-gray-700 mb-3">{product.description}</p>
                        {/* Precio */}
                        <div className="flex items-center space-x-2 mb-3">
                          <p className="text-xl font-bold text-red-600">${product.price.toLocaleString()}</p>
                          {product.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              ${product.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                        {/* Estadísticas */}
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
                        {/* Botones de acción */}
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            size="sm"
                            onClick={() => startChat(product.seller.id, product.id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Iniciar Chat
                          </Button>
                          <Link href={`/product/${product.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Producto
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 