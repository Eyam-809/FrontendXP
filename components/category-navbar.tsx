"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { Monitor, Shirt, Home, Dumbbell, Star, ToyBrick } from "lucide-react"
import { ApiUrl } from "@/lib/config"

export default function CategoryNavbar() {
  const { dispatch } = useApp()
  const router = useRouter()
  const [categories, setCategories] = useState<
    { id: number; name: string; translation: string; icon: any }[]
  >([])
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // 🔹 Función para traducir categorías
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

  // 🔹 Función para traducir subcategorías
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

  // 🔹 Cargar categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${ApiUrl}/api/categorias`)
        if (!res.ok) throw new Error("Error al cargar categorías")
        const data = await res.json()

        // Asignamos iconos según categoría
       // 👇 Usa los nombres exactos de la BD
    const iconsMap: Record<string, any> = {
      "Electrónicos": Monitor,
      "Moda": Shirt,
      "Hogar": Home,
      "Deportes": Dumbbell,
      "Belleza": Star,
      "Juguetes": ToyBrick,
    }


        setCategories(
          data.map((cat: any) => ({
            id: Number(cat.id), // 👈 forzamos a número
            name: cat.nombre,
            translation: translateCategory(cat.nombre),
           icon: iconsMap[cat.nombre] || Monitor,
          }))
        )
      } catch (error) {
        router.push("/no-internet")
        console.error(error)
        //alert("No se pudieron cargar las categorías")
       
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = async (categoryId: number, categoryName: string) => {
    // Si ya está seleccionada, ocultar subcategorías
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null)
      setSubcategories([])
      return
    }

    setSelectedCategoryId(categoryId)
    setLoading(true)

    try {
      const res = await fetch(
        `${ApiUrl}/api/subcategories/${categoryId}`
      )
      if (!res.ok) throw new Error("Error al cargar subcategorías")
      const data = await res.json()

      const mapped = data.map((item: any) => ({
        id: Number(item.id),
        name: item.nombre,
      }))

      setSubcategories(mapped)
    } catch (error) {
      console.error(error)
      setSubcategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubcategoryClick = (subcategory: { id: number; name: string }) => {
    dispatch({ type: "SET_SELECTED_SUBCATEGORY", payload: subcategory })
    // Limpiar la selección después de hacer clic
    setSelectedCategoryId(null)
    setSubcategories([])
  }

  return (
    <div className="bg-[#F9F3EF] border-b border-[#E8DDD4]">
      <div className="container mx-auto px-4">
        {/* Categorías principales */}
        <nav className="flex items-center justify-center space-x-5 py-5">
          {categories.map((category) => {
            const IconComponent = category.icon
            const isSelected = selectedCategoryId === category.id
            return (
              <div key={category.id} className="relative">
                <button
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  className={`border-2 font-medium text-sm transition-all duration-200 py-3 px-12 rounded-lg shadow-sm hover:shadow-md flex flex-col items-center space-y-2 min-w-[160px] ${
                    isSelected
                      ? "bg-[#1B3C53] text-[#F9F3EF] border-[#1B3C53]"
                      : "bg-[#E8DDD4] text-[#1B3C53] border-[#E8DDD4] hover:bg-[#1B3C53] hover:text-[#F9F3EF]"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.translation}</span>
                </button>
                
                {/* Subcategorías que aparecen debajo */}
                {isSelected && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border-2 border-[#1B3C53] rounded-lg shadow-xl z-50 min-w-[220px]">
                    <div className="p-4">
                      <div className="space-y-2">
                        {loading ? (
                          Array(6)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="h-12 bg-gray-200 rounded-md animate-pulse"
                              ></div>
                            ))
                        ) : (
                          subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => handleSubcategoryClick(subcategory)}
                              className="w-full text-center p-3 rounded-md bg-[#F9F3EF] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-white transition-all duration-200 border border-[#E8DDD4] hover:border-[#1B3C53] font-medium"
                            >
                              <span className="text-sm whitespace-nowrap">
                                {translateSubcategory(subcategory.name)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
