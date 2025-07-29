"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Upload, X } from "lucide-react"
import { useApp } from "@/contexts/app-context"

const categories = [
  { name: "Electronics", subcategories: ["Smartphones", "Laptops", "Headphones", "Cameras"] },
  { name: "Fashion", subcategories: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories"] },
  { name: "Home", subcategories: ["Kitchen", "Bedroom", "Living Room", "Garden"] },
  { name: "Sports", subcategories: ["Fitness", "Outdoor", "Team Sports", "Water Sports"] },
  { name: "Beauty", subcategories: ["Skincare", "Makeup", "Hair Care", "Fragrances"] },
  { name: "Toys", subcategories: ["Educational", "Action Figures", "Board Games", "Outdoor Toys"] },
  { name: "Gaming", subcategories: ["Consoles", "Games", "Accessories", "Collectibles"] },
]

interface AddProductForm {
  name: string
  description: string
  price: string
  originalPrice: string
  category: string
  subcategory: string
  condition: string
  images: File[]
  stock: string
}

export default function AddProductModal() {
  const { state } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<AddProductForm>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    condition: "",
    images: [],
    stock: "1"
  })

  const handleInputChange = (field: keyof AddProductForm, value: string | File[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeImage = (index: number) => {
    setForm(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Aquí deberías hacer la llamada real a tu API
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', form.price)
      formData.append('originalPrice', form.originalPrice)
      formData.append('category', form.category)
      formData.append('subcategory', form.subcategory)
      formData.append('condition', form.condition)
      formData.append('stock', form.stock)
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      formData.append('user_id', userData.id || '')

      form.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Resetear formulario
      setForm({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        subcategory: "",
        condition: "",
        images: [],
        stock: "1"
      })
      
      setIsOpen(false)
      // Aquí podrías mostrar un toast de éxito
    } catch (error) {
      console.error("Error adding product:", error)
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.name === form.category)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar nuevo producto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Nintendo Switch OLED"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condición *</Label>
                  <Select value={form.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar condición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="like_new">Como nuevo</SelectItem>
                      <SelectItem value="good">Bueno</SelectItem>
                      <SelectItem value="fair">Aceptable</SelectItem>
                      <SelectItem value="poor">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu producto en detalle..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio de venta *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Precio original (opcional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categoría */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Categorización</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoría *</Label>
                  <Select 
                    value={form.subcategory} 
                    onValueChange={(value) => handleInputChange('subcategory', value)}
                    disabled={!form.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Inventario</h3>
              <div className="space-y-2">
                <Label htmlFor="stock">Cantidad disponible *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Imágenes del producto</h3>
              
              {/* Área de subida */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <Label htmlFor="images" className="cursor-pointer">
                  <span className="text-sm text-gray-600">
                    Haz clic para subir imágenes o arrastra y suelta
                  </span>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG hasta 10MB. Máximo 5 imágenes.
                </p>
              </div>

              {/* Vista previa de imágenes */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {form.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Agregando..." : "Agregar producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 