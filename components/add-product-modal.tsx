"use client"

import { useState, useEffect } from "react"
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
  categoria_id?: string
  subcategoria_id?: string
}

interface AddProductModalProps {
  onProductAdded?: () => void
}

export default function AddProductModal({ onProductAdded }: AddProductModalProps) {
  const { state } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([])
  const [subcategorias, setSubcategorias] = useState<{ id: number; nombre: string }[]>([])
  const [modo, setModo] = useState<"venta" | "trueque" | null>(null)

  const [form, setForm] = useState<AddProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "1",
    image: null,
    categoria_id: "",
    subcategoria_id: ""
  })

  // 🔹 Traer categorías cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return
    const fetchCategorias = async () => {
      try {
        const res = await fetch("https://backendxp-1.onrender.com/api/categorias")
        if (!res.ok) throw new Error("Error al cargar categorías")
        const data = await res.json()
        setCategorias(data)
      } catch (error) {
        console.error(error)
        alert("No se pudieron cargar las categorías")
      }
    }
    fetchCategorias()
  }, [isOpen])

  // 🔹 Traer subcategorías al seleccionar categoría
  useEffect(() => {
    if (!form.categoria_id) return
    const fetchSubcategorias = async () => {
      try {
        const res = await fetch(`https://backendxp-1.onrender.com/api/subcategories/${form.categoria_id}`)
        if (!res.ok) throw new Error("Error al cargar subcategorías")
        const data = await res.json()
        setSubcategorias(data)
      } catch (error) {
        console.error(error)
        alert("No se pudieron cargar las subcategorías")
      }
    }
    fetchSubcategorias()
  }, [form.categoria_id])

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
      if (!form.name.trim()) throw new Error("El nombre del producto es requerido")
      if (modo === "venta") {
        if (!form.price || parseFloat(form.price) <= 0) throw new Error("El precio debe ser mayor a 0")
      }
      if (!form.stock || parseInt(form.stock) <= 0) throw new Error("El stock debe ser mayor a 0")

      const token = localStorage.getItem("token")
      if (!token) throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente")

      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      if (!userData.id) throw new Error("No se encontró información del usuario. Por favor, inicia sesión nuevamente")

      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description || '')
      formData.append('stock', form.stock)
      formData.append('id_user', userData.id.toString())
      formData.append('tipo', modo || "venta") // 🔹 Tipo de publicación
      formData.append('price', modo === 'trueque' ? '0' : form.price)

      if (modo === "venta") formData.append('price', form.price)
      if (form.image) formData.append('image', form.image)
      if (form.categoria_id) formData.append('categoria_id', form.categoria_id)
      if (form.subcategoria_id) formData.append('subcategoria_id', form.subcategoria_id)

      const response = await fetch("https://backendxp-1.onrender.com/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear el producto")
      }

      const result = await response.json()
      console.log("Producto creado exitosamente:", result)
      setForm({ name: "", description: "", price: "", stock: "1", image: null, categoria_id: "", subcategoria_id: "" })
      setModo(null)
      setIsOpen(false)
      alert(`¡${modo === "venta" ? "Venta" : "Trueque"} agregado exitosamente!`)
      onProductAdded?.()
    } catch (error) {
      console.error("Error adding product:", error)
      alert(`Error al agregar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setModo(null) }}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B3C53]">
            {!modo ? "Selecciona el tipo de publicación" :
              modo === "venta" ? "Subir venta" : "Subir trueque"}
          </DialogTitle>
        </DialogHeader>

        {/* 🔹 Si aún no se ha seleccionado el modo, muestra los dos botones */}
        {!modo ? (
          <div className="flex justify-center gap-6 py-6">
            <Button
              onClick={() => setModo("venta")}
              className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg"
            >
              Subir Venta
            </Button>
            <Button
              onClick={() => setModo("trueque")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
            >
              Subir Trueque
            </Button>
          </div>
        ) : (
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

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <select
                    id="categoria"
                    value={form.categoria_id || ""}
                    onChange={(e) => handleInputChange("categoria_id", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                

                {/* Subcategoría */}
                {subcategorias.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategoria">Subcategoría</Label>
                    <select
                      id="subcategoria"
                      value={form.subcategoria_id || ""}
                      onChange={(e) => handleInputChange("subcategoria_id", e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">Selecciona una subcategoría</option>
                      {subcategorias.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Precio y Stock (solo si es venta) */}
            {modo === "venta" && (
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
            )}

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
                className="text-[#1B3C53]"
                type="button"
                variant="outline"
                onClick={() => setModo(null)}
                disabled={isLoading}
              >
                Volver
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Agregando..." : modo === "venta" ? "Publicar venta" : "Publicar trueque"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
