"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Monitor, Shirt, Home, Dumbbell, Star, ToyBrick } from "lucide-react"

export default function CategoryNavbar() {
  const { dispatch } = useApp()
   const router = useRouter()
  const [categories, setCategories] = useState<
    { id: number; name: string; translation: string; icon: any }[]
  >([])

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

  // 🔹 Cargar categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://backendxp-1.onrender.com/api/categorias")
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
        console.error(error)
        //alert("No se pudieron cargar las categorías")
        router.push("/no-internet")
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    dispatch({ type: "SET_SELECTED_CATEGORY", payload: { id: categoryId, name: categoryName } })
    dispatch({ type: "TOGGLE_CATEGORY_PANEL" })
  }

  return (
    <div className="bg-[#F9F3EF] border-b border-[#E8DDD4]">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-center space-x-4 py-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id, category.name)}
                className="bg-[#E8DDD4] border-2 border-[#E8DDD4] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-[#F9F3EF] font-medium text-xs transition-all duration-200 py-1.5 px-10 rounded-lg shadow-sm hover:shadow-md flex flex-col items-center space-y-1 min-w-[130px]"
              >
                <IconComponent className="h-5 w-5" />
                <span>{category.translation}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
