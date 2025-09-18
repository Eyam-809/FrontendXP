"use client"

import { useApp } from "@/contexts/app-context"
import { Monitor, Shirt, Home, Dumbbell, Star, ToyBrick } from "lucide-react"

const categories = [
  { name: "Electronics", translation: "Electrónicos", icon: Monitor },
  { name: "Fashion", translation: "Moda", icon: Shirt },
  { name: "Home", translation: "Hogar", icon: Home },
  { name: "Sports", translation: "Deportes", icon: Dumbbell },
  { name: "Beauty", translation: "Belleza", icon: Star },
  { name: "Toys", translation: "Juguetes", icon: ToyBrick },
]

export default function CategoryNavbar() {
  const { dispatch } = useApp()

  const handleCategoryClick = (categoryName: string) => {
    dispatch({ type: "SET_SELECTED_CATEGORY", payload: categoryName })
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
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
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
