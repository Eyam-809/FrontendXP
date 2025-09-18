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
  // Método para guardar solo datos del usuario (sin imagen)
  const saveUserInfo = async () => {
    setIsSaving(true);
    try {
      if (!formData.name.trim()) throw new Error("El nombre es requerido");
      if (!formData.email.trim()) throw new Error("El email es requerido");
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      if (!token || !userData.id) throw new Error("No hay token de autenticación o ID de usuario");

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        telefono: formData.phone || "",
        direccion: formData.address || ""
      };

      const response = await fetch("https://backendxp-1.onrender.com/api/usuario", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // Actualizar el estado local y localStorage
      const updatedUser = { ...user, ...result };
      setUser(updatedUser);
      const updatedUserData = { ...userData, ...result };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setIsEditing(false);
      alert("¡Datos actualizados exitosamente!");
    } catch (error) {
      console.error("Error al guardar datos:", error);
      alert(`Error al guardar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };
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
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [userProducts, setUserProducts] = useState<UserProduct[]>([])
  const [favoriteProducts, setFavoriteProducts] = useState<UserProduct[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<UserProduct[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [refresh, setRefresh] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

useEffect(() => {
  async function fetchProducts() {
    try {
      const token = localStorage.getItem("token")
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")

      if (!token || !userData.id) {
        console.error("Falta token o ID del usuario")
        return
      }

      const res = await fetch(`https://backendxp-1.onrender.com/api/products/user/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      setUserProducts(data.products || data) // Ajusta según la estructura de tu backend
    } catch (err) {
      console.error("Error al obtener productos:", err)
    }
  }

  fetchProducts()
}, [refresh])

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
    
    // Función para obtener productos del usuario
    const fetchUserProducts = async () => {
      console.log("🚀 Iniciando fetchUserProducts...")
      try {
        const token = localStorage.getItem("token")
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        
        console.log("🔑 Token:", token ? "Existe" : "No existe")
        console.log("👤 UserData:", userData)
        
        if (token && userData.id) {
          console.log("🔍 Buscando productos del usuario:", userData.id)
          
          // Intentar diferentes endpoints para obtener productos del usuario
          let response = await fetch(`https://backendxp-1.onrender.com/api/products/user/${userData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          // Si falla, intentar con endpoint alternativo
          if (!response.ok) {
            console.log("❌ Primer endpoint falló, intentando alternativo...")
            response = await fetch(`https://backendxp-1.onrender.com/api/products?user_id=${userData.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          }
          
          // Si aún falla, intentar obtener todos los productos
          if (!response.ok) {
            console.log("❌ Segundo endpoint falló, intentando obtener todos los productos...")
            response = await fetch(`https://backendxp-1.onrender.com/api/products`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          }
          
          if (response.ok) {
            const products = await response.json()
            console.log("✅ Productos encontrados:", products)
            console.log("📊 Cantidad de productos:", products.length || 0)
            setUserProducts(products)
            return
          } else {
            console.log("❌ Error obteniendo productos:", response.status)
            console.log("❌ Response text:", await response.text())
          }
        }
      } catch (error) {
        console.error("❌ Error en fetchUserProducts:", error)
      }
      
      // Si no se pueden obtener productos reales, usar datos mock
      console.log("⚠️ Usando datos mock para productos")
      
    }

    fetchUserProducts()

  }, [])

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error("El nombre es requerido")
      }
      if (!formData.email.trim()) {
        throw new Error("El email es requerido")
      }
      
      const token = localStorage.getItem("token")
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      
      if (!token || !userData.id) {
        throw new Error("No hay token de autenticación o ID de usuario")
      }

      // Preparar datos para enviar al backend
        // FormData para enviar texto + archivo solo si hay imagen
        const body = new FormData()
        body.append("name", formData.name.trim())
        body.append("email", formData.email.trim())
        body.append("telefono", formData.phone || "")
        body.append("direccion", formData.address || "")
        if (selectedImage) {
          body.append("imagen", selectedImage)
        }
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone || null,
        address: formData.address || null
      }

      console.log("Enviando datos de actualización:", updateData)

      const response = await fetch("https://backendxp-1.onrender.com/api/usuario", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Usuario actualizado exitosamente:", result)

      // Actualizar el estado local con los datos del backend
      const updatedUser = { ...currentUser, ...result }
      setUser(updatedUser)
      
      // Actualizar localStorage con los nuevos datos
      const updatedUserData = { ...userData, ...result }
      localStorage.setItem("userData", JSON.stringify(updatedUserData))

      setIsEditing(false)
      alert("¡Datos actualizados exitosamente!")

    } catch (error) {
      console.error("Error updating user:", error)
      alert(`Error al actualizar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsSaving(false)
    }
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

  // Función para recargar productos
  const reloadUserProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      
      if (token && userData.id) {
        const response = await fetch(`https://backendxp-1.onrender.com/api/products/user/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const products = await response.json()
          setUserProducts(products)
        }
      }
    } catch (error) {
      console.error("Error recargando productos:", error)
    }
  }

//Metodo para eliminar un producto
const deleteUserProduct = async (productId: number) => {
  // ⚠️ Mostrar confirmación
  const confirmed = window.confirm("¿Seguro que deseas eliminar este producto?");
  if (!confirmed) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(
      `https://backendxp-1.onrender.com/api/products/${productId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      console.log("Producto eliminado");
      reloadUserProducts();
    } else {
      const errorData = await response.json();
      console.error("Error al eliminar producto:", errorData);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
};




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
    <div className="min-h-screen bg-[#F9F3EF]">
      {/* Botón de volver */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="outline" className="bg-[#F9F3EF] hover:bg-white text-[#1B3C53] border-[#E8DDD4]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Header con imagen de portada */}
      <div className="relative h-64 bg-gradient-to-r from-[#1B3C53] to-[#456882]">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end space-x-4">
            <Avatar className="h-24 w-24 border-4 border-white">
              {currentUser.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : null}
              <AvatarFallback className="text-2xl font-bold bg-[#1B3C53] text-white">
                {(currentUser.name && currentUser.name.trim() ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold">{currentUser.name}</h1>
              <p className="text-lg opacity-90">Miembro desde {new Date(currentUser.joinDate || new Date()).toLocaleDateString()}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-[#E8DDD4] fill-current" />
                  <span className="text-sm">{currentUser.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">{userProducts.length} productos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{currentUser.totalSales} ventas</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-[#1B3C53] hover:bg-[#F9F3EF] border-[#E8DDD4]">
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
                  <p className="text-[#456882] text-sm">
                    Actualiza tu información personal y datos de contacto para mantener tu perfil actualizado.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-[#456882]" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  {currentUser.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-[#456882]" />
                      <span className="text-sm">{currentUser.phone}</span>
                    </div>
                  )}
                  {currentUser.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-[#456882]" />
                      <span className="text-sm">{currentUser.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-[#456882]" />
                    <span className="text-sm">Miembro desde {new Date(currentUser.joinDate || new Date()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{userProducts.length}</div>
                      <div className="text-sm text-gray-500">Productos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1B3C53]">{currentUser.totalSales}</div>
                      <div className="text-sm text-[#456882]">Ventas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <UserStats
              totalProducts={userProducts.length}
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
              <TabsList className="grid w-full grid-cols-5 bg-[#E8DDD4]">
                <TabsTrigger value="personal-info" className="flex items-center space-x-2 data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53]">
                  <User className="h-4 w-4" />
                  <span>Mi Información</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center space-x-2 data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53]">
                  <Package className="h-4 w-4" />
                  <span>Mis Productos</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center space-x-2 data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53]">
                  <Heart className="h-4 w-4" />
                  <span>Favoritos</span>
                </TabsTrigger>
                <TabsTrigger value="cart" className="flex items-center space-x-2 data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53]">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Carrito</span>
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center space-x-2 data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53]">
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
                          <AvatarFallback className="bg-[#E8DDD4] text-[#1B3C53] text-2xl font-semibold">
                            {(currentUser.name && currentUser.name.trim() ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Cambiar foto
                          </Button>
                          <p className="text-sm text-[#456882] mt-1">
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
                              disabled={!isEditing || isSaving}
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
                              disabled={!isEditing || isSaving}
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
                              value={formData.joinDate ? new Date(formData.joinDate).toISOString().split('T')[0] : ''}
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
                        <div className="flex items-center justify-between p-3 bg-[#E8DDD4] rounded-lg">
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

                        <div className="flex items-center justify-between p-3 bg-[#E8DDD4] rounded-lg">
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
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSave} 
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? "Guardando..." : "Guardar cambios con imagen"}
                        </Button>
                        <Button 
                          onClick={saveUserInfo} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? "Guardando..." : "Guardar solo datos"}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} className="bg-[#E63946] hover:bg-[#D62828] text-white">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar información
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#1B3C53]">Mis Productos</h2>
                  <AddProductModal onProductAdded={() => setRefresh(r => !r)} />
                </div>

                <UserProductsGrid 
                  products={userProducts}
                  onEdit={(productId) => {
                    console.log('Editar producto:', productId)
                  }}
                  onDelete={deleteUserProduct} 
                  onToggleStatus={(productId, status) => {
                    console.log('Cambiar estado del producto:', productId, status)
                  }}
                />
              </TabsContent>

              <TabsContent value="favorites" className="mt-6">
                <h2 className="text-2xl font-bold mb-6 text-[#1B3C53]">Mis Favoritos</h2>
                <FavoritesGrid products={favoriteProducts} />
              </TabsContent>

              <TabsContent value="cart" className="mt-6">
                <h2 className="text-2xl font-bold mb-6 text-[#1B3C53]">Mi Carrito</h2>
                <CartItemsList items={purchasedProducts} />
              </TabsContent>

              <TabsContent value="conversations" className="mt-6">
                <h2 className="text-2xl font-bold mb-6 text-[#1B3C53]">Mis Conversaciones</h2>
                <ChatConversations conversations={conversations} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}