"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Package, Star } from "lucide-react"
import { useParams } from "next/navigation"

interface UserProduct {
  id: number
  name: string
  price: number
  image: string
  category: string
  status: 'active' | 'sold' | 'pending'
  views: number
  likes: number
  created_at: string
}

interface UserProfile {
  id: number
  name: string
  email: string
  avatar?: string
  rating?: number
  totalProducts?: number
  joinDate?: string
}

export default function UserProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<UserProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        // Obtener datos del usuario
        const userResponse = await fetch(`https://backendxp-1.onrender.com/api/users/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const userData = await userResponse.json()
        setUser(userData)

        // Obtener productos del usuario
        const productsResponse = await fetch(`https://backendxp-1.onrender.com/api/products/user/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const productsData = await productsResponse.json()
        setProducts(productsData.products || productsData)
      } catch (error) {
        console.error("Error al cargar el perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUserProfile()
    }
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Usuario no encontrado</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{user.rating || 0}</span>
                </div>
                <Badge variant="secondary">
                  <Package className="h-4 w-4 mr-1" />
                  {user.totalProducts || 0} productos
                </Badge>
                <Badge variant="outline">
                  Miembro desde {new Date(user.joinDate || "").getFullYear()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos de {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-0">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-red-600">
                      ${product.price.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {product.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Este usuario aún no tiene productos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
