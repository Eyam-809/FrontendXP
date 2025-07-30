"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Upload, X } from "lucide-react"
import { useApp } from "@/contexts/app-context"

interface AddProductForm {
  name: string
  description: string
  price: string
  stock: string
  image: File | null
}

interface AddProductModalProps {
  onProductAdded?: () => void
}

export default function AddProductModal({ onProductAdded }: AddProductModalProps) {
  const { state } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<AddProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "1",
    image: null
  })

  const handleInputChange = (field: keyof AddProductForm, value: string | File[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(`El archivo ${file.name} no es una imagen válida`)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB`)
      return
    }

    setForm(prev => ({ ...prev, image: file }))
  }

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!form.name.trim()) {
        throw new Error("El nombre del producto es requerido")
      }
      if (!form.price || parseFloat(form.price) <= 0) {
        throw new Error("El precio debe ser mayor a 0")
      }
      if (!form.stock || parseInt(form.stock) <= 0) {
        throw new Error("El stock debe ser mayor a 0")
      }

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente")
      }

      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      if (!userData.id) {
        throw new Error("No se encontró información del usuario. Por favor, inicia sesión nuevamente")
      }

      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description || '')
      formData.append('price', form.price)
      formData.append('stock', form.stock)
      formData.append('id_user', userData.id.toString())

      if (form.image) {
        formData.append('image', form.image)
      }

      const response = await fetch("https://backendxp-1.onrender.com/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear el producto")
      }

      const result = await response.json()
      console.log("Producto creado exitosamente:", result)

      setForm({
        name: "",
        description: "",
        price: "",
        stock: "1",
        image: null
      })

      setIsOpen(false)
      alert("¡Producto agregado exitosamente!")

      onProductAdded?.()

    } catch (error) {
      console.error("Error adding product:", error)
      alert(`Error al agregar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

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
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu producto en detalle..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Precios y Stock */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Precio y Stock</h3>
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
              </div>
            </CardContent>
          </Card>

          {/* Imagen */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Imagen del producto</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <Label htmlFor="image" className="cursor-pointer">
                  <span className="text-sm text-gray-600">Haz clic para subir una imagen</span>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB</p>
              </div>

              {form.image && (
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones */}
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
