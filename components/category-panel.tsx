"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"

const translateSubcategory = (subcategory: string) => {
  const translations: Record<string, string> = {
    Smartphones: "Teléfonos",
    Laptops: "Portátiles",
    Headphones: "Auriculares",
    Cameras: "Cámaras",
    "Men's Clothing": "Ropa de Hombre",
    "Women's Clothing": "Ropa de Mujer",
    Shoes: "Zapatos",
    Accessories: "Accesorios",
    Kitchen: "Cocina",
    Bedroom: "Dormitorio",
    "Living Room": "Sala de Estar",
    Garden: "Jardín",
    Fitness: "Fitness",
    Outdoor: "Aire Libre",
    "Team Sports": "Deportes de Equipo",
    "Water Sports": "Deportes Acuáticos",
    Skincare: "Cuidado de la Piel",
    Makeup: "Maquillaje",
    "Hair Care": "Cuidado del Cabello",
    Fragrances: "Fragancias",
    Educational: "Educativos",
    "Action Figures": "Figuras de Acción",
    "Board Games": "Juegos de Mesa",
    "Outdoor Toys": "Juguetes de Exterior",
  }
  return translations[subcategory] || subcategory
}

export default function CategoryPanel() {
  const { state, dispatch } = useApp()
  // 👇 ahora subcategories y featured guardan {id, name}
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([])
  const [featured, setFeatured] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!state.selectedCategory?.id) return

    setLoading(true)
    setSubcategories([])
    setFeatured([])

    const fetchSubcategories = async () => {
      try {
        const res = await fetch(
          `https://backendxp-1.onrender.com/api/subcategories/${state.selectedCategory.id}`
        )
        if (!res.ok) throw new Error("Error al cargar subcategorías")
        const data = await res.json()

        // 👇 guardamos id (forzado a número) + nombre
        const mapped = data.map((item: any) => ({
          id: Number(item.id),
          name: item.nombre,
        }))

        setSubcategories(mapped)
        setFeatured(mapped.slice(0, 4))
      } catch (error) {
        console.error(error)
        alert("No se pudieron cargar las subcategorías")
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategories()
  }, [state.selectedCategory])

  if (!state.isCategoryPanelOpen) return null

  // 👇 ahora recibimos también el id
  const handleSubcategoryClick = (subcategory: { id: number; name: string }) => {
    dispatch({ type: "SET_SELECTED_SUBCATEGORY", payload: subcategory })
  }

  const handleFeaturedClick = (item: { id: number; name: string }) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: item.name })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => dispatch({ type: "TOGGLE_CATEGORY_PANEL" })}
      >
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1B3C53]">
                {state.selectedCategory?.name || "Categoría"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "TOGGLE_CATEGORY_PANEL" })}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Subcategorías */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#1B3C53]">
                  Subcategorías
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {loading
                    ? Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-16 bg-gray-200 rounded-md animate-pulse"
                          ></div>
                        ))
                    : subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleSubcategoryClick(subcategory)}
                          className="text-left p-3 rounded-md hover:bg-purple-50 hover:text-purple-600 transition-colors border border-gray-200 hover:border-purple-200"
                        >
                          <span className="font-medium text-[#1B3C53]">
                            {translateSubcategory(subcategory.name)}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                          
                          </div>
                        </button>
                      ))}
                </div>
              </div>

              {/* Productos Destacados */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#1B3C53]">
                  Productos Destacados
                </h3>
                <div className="space-y-2">
                  {loading
                    ? Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-8 bg-gray-200 rounded-md animate-pulse"
                          ></div>
                        ))
                    : featured.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleFeaturedClick(item)}
                          className="block w-full text-left p-2 rounded-md hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          <span className="font-medium text-[#1B3C53]">
                            {translateSubcategory(item.name)} (ID: {item.id})
                          </span>
                        </button>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
