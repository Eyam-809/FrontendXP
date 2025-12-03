"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Upload, X, DollarSign, RefreshCw, Sparkles } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"

interface AddProductForm {
  name: string
  description: string
  price: string
  stock: string
  image: File | null
  video?: File | null
  categoria_id?: string
  subcategoria_id?: string
}

interface AddProductModalProps {
  onProductAdded?: () => void
}

export default function AddProductModal({ onProductAdded }: AddProductModalProps) {
  const { state } = useApp()
  const { showNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([])
  const [subcategorias, setSubcategorias] = useState<{ id: number; nombre: string }[]>([])
  const [modo, setModo] = useState<"venta" | "trueque" | null>(null)
  const [userPlanId, setUserPlanId] = useState<string | null>(null)
  const token = localStorage.getItem("token")
if (!token) throw new Error("No hay token de autenticación")

  // Obtener el plan_id del usuario
  useEffect(() => {
    const getPlanId = () => {
      // Intentar obtener del contexto primero
      const sessionPlanId = state.userSession?.plan_id
      if (sessionPlanId) {
        setUserPlanId(String(sessionPlanId))
        return
      }
      
      // Si no está en el contexto, obtener de localStorage
      const storedPlanId = localStorage.getItem("plan_id")
      if (storedPlanId) {
        setUserPlanId(storedPlanId)
        return
      }
      
      // También verificar en userData
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        if (userData && userData.plan_id) {
          setUserPlanId(String(userData.plan_id))
          return
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
      
      // Por defecto, plan 1 (gratuito)
      setUserPlanId("1")
    }

    getPlanId()
  }, [state.userSession])

  // Determinar si el usuario puede ver la opción de trueque
  const canViewTrueque = userPlanId === "2" || userPlanId === "3"


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
        const res = await fetch(`${ApiUrl}/api/categorias`)
        if (!res.ok) throw new Error("Error al cargar categorías")
        const data = await res.json()
        setCategorias(data)
      } catch (error) {
        console.error(error)
        showNotification("No se pudieron cargar las categorías", "error")
      }
    }
    fetchCategorias()
  }, [isOpen])

  // 🔹 Traer subcategorías al seleccionar categoría
  useEffect(() => {
    if (!form.categoria_id) return
    const fetchSubcategorias = async () => {
      try {
        const res = await fetch(`${ApiUrl}/api/subcategories/${form.categoria_id}`)
        if (!res.ok) throw new Error("Error al cargar subcategorías")
        const data = await res.json()
        setSubcategorias(data)
      } catch (error) {
        console.error(error)
        showNotification("No se pudieron cargar las subcategorías", "error")
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
      showNotification(`El archivo ${file.name} no es una imagen válida`, "error")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      showNotification(`El archivo ${file.name} es demasiado grande. Máximo 10MB`, "error")
      return
    }
    setForm(prev => ({ ...prev, image: file }))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith("video/")) {
    showNotification(`El archivo ${file.name} no es un video válido`, "error")
    return
  }

  if (file.size > 50 * 1024 * 1024) { // 50 MB máx.
    showNotification(`El archivo ${file.name} es demasiado grande. Máximo 50MB`, "error")
    return
  }

  // Verificar duración del video
  const videoElement = document.createElement("video")
  videoElement.preload = "metadata"
  videoElement.onloadedmetadata = () => {
    window.URL.revokeObjectURL(videoElement.src)
    const duration = videoElement.duration
    if (duration > 90) {
      showNotification("El video no puede durar más de 1 minuto y 30 segundos.", "error")
      e.target.value = "" // limpiar input
      return
    }
    setForm(prev => ({ ...prev, video: file }))
  }
  videoElement.src = URL.createObjectURL(file)
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
      if (modo === "venta") {
    formData.append('price', form.price)
} else {
    formData.append('price', '0')
}

      if (form.image) formData.append('image', form.image)
      if (modo === "venta" && form.video) formData.append('video', form.video)
      if (form.categoria_id) formData.append('categoria_id', form.categoria_id)
      if (form.subcategoria_id) formData.append('subcategoria_id', form.subcategoria_id)

      const response = await fetch(`${ApiUrl}/api/products`, {
  method: "POST",
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
  body: formData,
  credentials: "include" // 🔹 necesario si usas Sanctum con cookies
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
      showNotification(`¡${modo === "venta" ? "Venta" : "Trueque"} agregado exitosamente!`, "success")
      onProductAdded?.()
    } catch (error) {
      console.error("Error adding product:", error)
      showNotification(`Error al agregar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setModo(null) }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#1B3C53] hover:to-[#456882] text-white hover:opacity-90">
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

        {/* 🔹 Si aún no se ha seleccionado el modo, muestra los botones */}
        {!modo ? (
          <div className="py-8">
            <div className={`grid gap-6 ${canViewTrueque ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' : 'grid-cols-1 max-w-md'} mx-auto`}>
              {/* Botón de Venta */}
              <motion.button
                onClick={() => setModo("venta")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B3C53] to-[#456882] hover:from-[#1B3C53] hover:to-[#456882] p-8 text-left shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#1B3C53] cursor-pointer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <Sparkles className="h-6 w-6 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Subir Venta</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Vende tus productos y recibe dinero
                  </p>
                  <div className="flex items-center text-white/90 text-sm font-medium">
                    <span>Continuar</span>
                    <Plus className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.button>

              {/* Botón de Trueque - Solo visible si el usuario tiene plan_id 2 o 3 */}
              {canViewTrueque && (
                <motion.button
                  onClick={() => setModo("trueque")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#456882] to-[#1B3C53] hover:from-[#456882] hover:to-[#1B3C53] p-8 text-left shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#456882] cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <RefreshCw className="h-8 w-8 text-white" />
                      </div>
                      <Sparkles className="h-6 w-6 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Subir Trueque</h3>
                    <p className="text-white/90 text-sm mb-4">
                      Intercambia productos sin usar dinero
                    </p>
                    <div className="flex items-center text-white/90 text-sm font-medium">
                      <span>Continuar</span>
                      <Plus className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </motion.button>
              )}
            </div>
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
                  <Label htmlFor="description">Descripción</Label>
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
            {/* Video (solo si es venta) */}
            {modo === "venta" && (         
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Video del producto</h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <Label htmlFor="video" className="cursor-pointer">
                      <span className="text-sm text-gray-600">Haz clic para subir un video</span>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">MP4 o WebM hasta 50MB y máximo 1:30 min</p>
                  </div>

                  {form.video && (
                    <div className="relative group">
                      <video
                        controls
                        src={URL.createObjectURL(form.video)}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, video: null }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

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
                className="bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#1B3C53] hover:to-[#456882] text-white hover:opacity-90"
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
