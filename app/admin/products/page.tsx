"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Edit, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Footer from "@/components/footer"
import { products } from "@/data/products"
import type { Product } from "@/contexts/app-context"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"

export default function AdminProducts() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [productList, setProductList] = useState<Product[]>(products)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    productId: number | null
    productName: string
    isLoading: boolean
  }>({
    isOpen: false,
    productId: null,
    productName: "",
    isLoading: false
  })

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    description: "",
    discount: "",
    isNew: false,
  })

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
          <p className="mt-4 text-gray-600">Cargando gestión de productos...</p>
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

  const subcategoriesByCategory: Record<string, string[]> = {
    Electronics: ["Smartphones", "Laptops", "Headphones", "Cameras"],
    Fashion: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories"],
    Home: ["Kitchen", "Bedroom", "Living Room", "Garden"],
    Sports: ["Fitness", "Outdoor", "Team Sports", "Water Sports"],
    Beauty: ["Skincare", "Makeup", "Hair Care", "Fragrances"],
    Toys: ["Educational", "Action Figures", "Board Games", "Outdoor Toys"],
  }

  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    const product: Product = {
      id: Math.max(...productList.map((p) => p.id)) + 1,
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number.parseFloat(newProduct.originalPrice) : undefined,
      rating: 4.0,
      image: "/placeholder.svg?height=200&width=200",
      discount: Number.parseInt(newProduct.discount) || 0,
      isNew: newProduct.isNew,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      description: newProduct.description,
      inStock: true,
    }

    setProductList([...productList, product])
    setNewProduct({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      subcategory: "",
      description: "",
      discount: "",
      isNew: false,
    })
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      discount: product.discount.toString(),
      isNew: product.isNew,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return

    const updatedProduct: Product = {
      ...editingProduct,
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number.parseFloat(newProduct.originalPrice) : undefined,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      description: newProduct.description,
      discount: Number.parseInt(newProduct.discount) || 0,
      isNew: newProduct.isNew,
    }

    setProductList(productList.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
    setEditingProduct(null)
    setNewProduct({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      subcategory: "",
      description: "",
      discount: "",
      isNew: false,
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteProduct = (productId: number) => {
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    setDeleteModal({
      isOpen: true,
      productId,
      productName: product.name,
      isLoading: false
    });
  }

  const handleConfirmDelete = () => {
    if (!deleteModal.productId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    // Simular delay para mostrar el loading
    setTimeout(() => {
      setProductList(productList.filter((p) => p.id !== deleteModal.productId))
      setDeleteModal({
        isOpen: false,
        productId: null,
        productName: "",
        isLoading: false
      });
    }, 1000);
  }

  const handleCloseDeleteModal = () => {
    if (deleteModal.isLoading) return;
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: "",
      isLoading: false
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
              <p className="text-gray-600">Agregar, editar y eliminar productos del catálogo</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  <DialogDescription>Completa la información del nuevo producto</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Precio Original (Opcional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Descuento (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={newProduct.discount}
                      onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category: value, subcategory: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {translateCategory(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Select
                      value={newProduct.subcategory}
                      onValueChange={(value) => setNewProduct({ ...newProduct, subcategory: value })}
                      disabled={!newProduct.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {newProduct.category &&
                          subcategoriesByCategory[newProduct.category]?.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descripción del producto"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddProduct}>Agregar Producto</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {translateCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
              <CardDescription>
                Mostrando {filteredProducts.length} de {productList.length} productos
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
                      <th className="text-left py-3 px-4">Descuento</th>
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-left py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 20).map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 object-contain rounded"
                            />
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <Badge variant="outline">{translateCategory(product.category)}</Badge>
                            <p className="text-xs text-gray-500">{product.subcategory}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                              <p className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {product.discount > 0 ? (
                            <Badge className="bg-red-500">{product.discount}%</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {product.isNew && <Badge className="bg-green-500">Nuevo</Badge>}
                            <Badge variant={product.inStock ? "default" : "destructive"}>
                              {product.inStock ? "En Stock" : "Agotado"}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>Modifica la información del producto</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre del Producto</Label>
                <Input
                  id="edit-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-originalPrice">Precio Original (Opcional)</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount">Descuento (%)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value, subcategory: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {translateCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory">Subcategoría</Label>
                <Select
                  value={newProduct.subcategory}
                  onValueChange={(value) => setNewProduct({ ...newProduct, subcategory: value })}
                  disabled={!newProduct.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {newProduct.category &&
                      subcategoriesByCategory[newProduct.category]?.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProduct}>Actualizar Producto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema."
        itemName={deleteModal.productName}
        isLoading={deleteModal.isLoading}
      />
    </div>
  )
}
