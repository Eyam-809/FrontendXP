"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Package, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Footer from "@/components/footer"
import { products } from "@/data/products"

export default function AdminInventory() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/")
        return
      }
      setUser(parsedUser)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  const categories = ["Electronics", "Fashion", "Home", "Sports", "Beauty", "Toys"]

  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      Electronics: "Electrónicos",
      Fashion: "Moda",
      Home: "Hogar",
      Sports: "Deportes",
      Beauty: "Belleza",
      Toys: "Juguetes",
    }
    return translations[category] || category
  }

  const getStockLevel = (productId: number) => {
    // Simulate stock levels
    const stockLevels = [5, 12, 25, 8, 45, 3, 67, 15, 0, 33, 21, 7]
    return stockLevels[productId % stockLevels.length]
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Agotado", color: "bg-red-500", textColor: "text-red-700" }
    if (stock < 10) return { status: "Stock Bajo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    return { status: "En Stock", color: "bg-green-500", textColor: "text-green-700" }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categoryStats = categories.map((category) => {
    const categoryProducts = products.filter((p) => p.category === category)
    const totalStock = categoryProducts.reduce((sum, p) => sum + getStockLevel(p.id), 0)
    const lowStock = categoryProducts.filter((p) => getStockLevel(p.id) < 10).length
    const outOfStock = categoryProducts.filter((p) => getStockLevel(p.id) === 0).length

    return {
      category,
      totalProducts: categoryProducts.length,
      totalStock,
      lowStock,
      outOfStock,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Inventario</h1>
          <p className="text-gray-600">Administra el stock de productos por categorías</p>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categoryStats.map((stat, index) => (
            <motion.div
              key={stat.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {translateCategory(stat.category)}
                    <Package className="h-5 w-5 text-gray-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Productos:</span>
                      <span className="font-medium">{stat.totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock Total:</span>
                      <span className="font-medium">{stat.totalStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-600">Stock Bajo:</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        {stat.lowStock}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Agotados:</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        {stat.outOfStock}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar Productos</CardTitle>
            <CardDescription>Filtra productos por nombre o categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {translateCategory(category).slice(0, 8)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Productos en Inventario</CardTitle>
              <CardDescription>
                Mostrando {filteredProducts.length} de {products.length} productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Producto</th>
                      <th className="text-left py-3 px-4">Categoría</th>
                      <th className="text-left py-3 px-4">Precio</th>
                      <th className="text-left py-3 px-4">Stock</th>
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-left py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 20).map((product) => {
                      const stock = getStockLevel(product.id)
                      const stockStatus = getStockStatus(stock)

                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 object-contain rounded"
                              />
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">ID: {product.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{translateCategory(product.category)}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{stock}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
                              <span className={`text-sm ${stockStatus.textColor}`}>{stockStatus.status}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                Editar
                              </Button>
                              <Button size="sm" variant="outline">
                                Reabastecer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length > 20 && (
                <div className="mt-4 text-center">
                  <Button variant="outline">Cargar Más Productos</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
