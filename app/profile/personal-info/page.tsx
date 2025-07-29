"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Edit,
  Save,
  ArrowLeft,
  Star,
  Package,
  TrendingUp,
  Settings,
  Heart,
  ShoppingCart,
  MessageCircle,
  Plus
} from "lucide-react"
import Link from "next/link"
import AddProductModal from "@/components/add-product-modal"
import UserStats from "@/components/user-stats"
import UserProductsGrid from "@/components/user-products-grid"
import FavoritesGrid from "@/components/favorites-grid"
import CartItemsList from "@/components/cart-items-list"
import ChatConversations from "@/components/chat-conversations"

interface UserData {
  name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  joinDate?: string
  rating?: number
  totalProducts?: number
  totalSales?: number
}

interface UserProduct {
  id: number
  name: string
  price: number
  image: string
  category: string
  status: 'active' | 'sold' | 'pending'
  views: number
  likes: number
  createdAt: string
}

export default function PersonalInfoPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
    rating: 4.8,
    totalProducts: 12,
    totalSales: 45
  })
  const [userProducts, setUserProducts] = useState<UserProduct[]>([])
  const [favoriteProducts, setFavoriteProducts] = useState<UserProduct[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<UserProduct[]>([])
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    // Primero intenta obtener datos del localStorage
    const userData = localStorage.getItem("userData")
    console.log("🔍 Buscando datos en localStorage:", userData)
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log("✅ Datos encontrados en localStorage:", parsedUser)
        setUser(parsedUser)
        setFormData({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          joinDate: parsedUser.joinDate || parsedUser.created_at || "",
          rating: parsedUser.rating || 4.8,
          totalProducts: parsedUser.totalProducts || 12,
          totalSales: parsedUser.totalSales || 45
        })
        return // Si encontramos datos en localStorage, no necesitamos hacer la API call
      } catch (error) {
        console.error("❌ Error parseando datos del localStorage:", error)
      }
    }

    // Si no hay datos en localStorage, intenta obtener de la API
    const fetchUserFromApi = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("🔑 Token encontrado:", token ? "Sí" : "No")
        
        if (token) {
          const response = await fetch("https://backendxp-1.onrender.com/api/user", {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.ok) {
            const apiUser = await response.json()
            console.log("📡 Datos de la API:", apiUser)
            setUser(apiUser)
            setFormData({
              name: apiUser.name || "",
              email: apiUser.email || "",
              phone: apiUser.phone || "",
              address: apiUser.address || "",
              joinDate: apiUser.joinDate || "",
              rating: apiUser.rating || 4.8,
              totalProducts: apiUser.totalProducts || 12,
              totalSales: apiUser.totalSales || 45
            })
            return
          } else {
            console.log("❌ API respondió con status:", response.status)
          }
        }
      } catch (error) {
        console.error("❌ Error en la API:", error)
      }
      
      console.log("⚠️ No se encontraron datos, usando valores por defecto")
    }

    fetchUserFromApi()
    // Mock data para productos, favorites, cart, y conversaciones
    const mockProducts: UserProduct[] = [
      {
        id: 1,
        name: "Nintendo Switch OLED",
        price: 8999,
        image: "/nitendo.png",
        category: "Gaming",
        status: 'active',
        views: 234,
        likes: 18,
        createdAt: "2024-02-15"
      },
      {
        id: 2,
        name: "Xbox Series X",
        price: 12999,
        image: "/xbox.png",
        category: "Gaming",
        status: 'active',
        views: 189,
        likes: 25,
        createdAt: "2024-02-10"
      },
      {
        id: 3,
        name: "Pokemon Scarlet",
        price: 1299,
        image: "/poke.png",
        category: "Gaming",
        status: 'sold',
        views: 156,
        likes: 12,
        createdAt: "2024-01-20"
      }
    ]

    const mockConversations = [
      {
        id: 1,
        user: {
          id: 1,
          name: "María González",
          avatar: "/placeholder-user.jpg",
          isOnline: true
        },
        product: {
          id: 1,
          name: "Nintendo Switch OLED",
          image: "/nitendo.png",
          price: 8999
        },
        messages: [
          {
            id: 1,
            sender: 'other',
            content: "¡Hola! Vi tu Nintendo Switch OLED y me interesa mucho. ¿Todavía está disponible?",
            timestamp: "14:30",
            isRead: true
          },
          {
            id: 2,
            sender: 'user',
            content: "¡Hola María! Sí, todavía está disponible. Está en perfecto estado, solo la usé un par de veces.",
            timestamp: "14:32",
            isRead: true
          }
        ],
        unreadCount: 1,
        lastMessage: "¿Podrías hacer envío a Guadalajara? Y otra pregunta, ¿aceptas pagos en efectivo al recibir?",
        lastMessageTime: "2024-02-15T14:40:00"
      }
    ]

    setUserProducts(mockProducts)
    setFavoriteProducts([])
    setPurchasedProducts([])
    setConversations(mockConversations)
  }, [])

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Aquí guardarías los datos actualizados
    localStorage.setItem("userData", JSON.stringify(formData))
    setUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "Usuario Demo",
        email: user.email || "usuario@demo.com",
        phone: user.phone || "",
        address: user.address || "",
        joinDate: user.joinDate || new Date().toISOString().split('T')[0],
        rating: user.rating || 4.8,
        totalProducts: user.totalProducts || 12,
        totalSales: user.totalSales || 45
      })
    }
    setIsEditing(false)
  }

  // Si no hay usuario, mostrar datos por defecto
  const currentUser = user || {
    name: "Usuario Demo",
    email: "usuario@demo.com",
    phone: "",
    address: "",
    joinDate: new Date().toISOString().split('T')[0],
    rating: 4.8,
    totalProducts: 12,
    totalSales: 45
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botón de volver */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="outline" className="bg-white/90 hover:bg-white text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Header con imagen de portada */}
      <div className="relative h-64 bg-gradient-to-r from-red-600 to-red-800">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end space-x-4">
            <Avatar className="h-24 w-24 border-4 border-white">
              {currentUser.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : null}
              <AvatarFallback className="text-2xl font-bold bg-red-600 text-white">
                {(currentUser.name && currentUser.name.trim() ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold">{currentUser.name}</h1>
              <p className="text-lg opacity-90">Miembro desde {new Date(currentUser.joinDate || new Date()).toLocaleDateString()}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{currentUser.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">{currentUser.totalProducts} productos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{currentUser.totalSales} ventas</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-gray-900 hover:bg-gray-100">
              <Edit className="h-4 w-4 mr-2" />
              Editar perfil
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar con información del usuario */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Información personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">
                    Actualiza tu información personal y datos de contacto para mantener tu perfil actualizado.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  {currentUser.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{currentUser.phone}</span>
                    </div>
                  )}
                  {currentUser.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{currentUser.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Miembro desde {new Date(currentUser.joinDate || new Date()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{currentUser.totalProducts}</div>
                      <div className="text-sm text-gray-500">Productos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{currentUser.totalSales}</div>
                      <div className="text-sm text-gray-500">Ventas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <UserStats
              totalProducts={currentUser.totalProducts || 12}
              totalSales={currentUser.totalSales || 45}
              rating={currentUser.rating || 4.8}
              followers={156}
              following={89}
              totalViews={userProducts.reduce((sum, p) => sum + p.views, 0)}
              totalLikes={userProducts.reduce((sum, p) => sum + p.likes, 0)}
              activeProducts={userProducts.filter(p => p.status === 'active').length}
              soldProducts={userProducts.filter(p => p.status === 'sold').length}
            />
          </div>

          {/* Contenido principal con tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal-info" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Mi Información</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Mis Productos</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Favoritos</span>
                </TabsTrigger>
                <TabsTrigger value="cart" className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Carrito</span>
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Conversaciones</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal-info" className="mt-6">
                <div className="space-y-6">
                  {/* Foto de perfil */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Foto de perfil</span>
                      </CardTitle>
                      <CardDescription>
                        Esta es la foto que verán otros usuarios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                          {currentUser.avatar ? (
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                          ) : null}
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl font-semibold">
                            {(currentUser.name && currentUser.name.trim() ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Cambiar foto
                          </Button>
                          <p className="text-sm text-gray-500 mt-1">
                            JPG, PNG hasta 5MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información personal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Información personal</span>
                      </CardTitle>
                      <CardDescription>
                        Actualiza tu información personal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Tu nombre completo"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              disabled={!isEditing}
                              placeholder="tu@email.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              disabled={!isEditing}
                              placeholder="+52 55 1234 5678"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="joinDate">Fecha de registro</Label>
                            <Input
                              id="joinDate"
                              type="date"
                              value={formData.joinDate}
                              onChange={(e) => handleInputChange('joinDate', e.target.value)}
                              disabled={true}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Tu dirección completa"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de la cuenta */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Información de la cuenta</span>
                      </CardTitle>
                      <CardDescription>
                        Datos de tu cuenta de XPmarket
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Correo electrónico</p>
                              <p className="text-sm text-gray-600">{currentUser.email}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Cambiar
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Miembro desde</p>
                              <p className="text-sm text-gray-600">
                                {currentUser.joinDate ? new Date(currentUser.joinDate).toLocaleDateString() : "No disponible"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-4">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar información
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Mis Productos</h2>
                  <AddProductModal />
                </div>

                <UserProductsGrid 
                  products={userProducts}
                  onEdit={(productId) => {
                    console.log('Editar producto:', productId)
                  }}
                  onDelete={(productId) => {
                    console.log('Eliminar producto:', productId)
                  }}
                  onToggleStatus={(productId, status) => {
                    console.log('Cambiar estado del producto:', productId, status)
                  }}
                />
              </TabsContent>

              <TabsContent value="favorites" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Mis Favoritos</h2>
                <FavoritesGrid products={favoriteProducts} />
              </TabsContent>

              <TabsContent value="cart" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Mi Carrito</h2>
                <CartItemsList items={purchasedProducts} />
              </TabsContent>

              <TabsContent value="conversations" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Mis Conversaciones</h2>
                <ChatConversations conversations={conversations} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}