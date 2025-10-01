"use client"

import { motion } from "framer-motion"
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

export default function CategorySection() {
  const { dispatch } = useApp()

  const handleCategoryClick = (categoryName: string) => {
    dispatch({ type: "SET_SELECTED_CATEGORY", payload: categoryName })
    dispatch({ type: "TOGGLE_CATEGORY_PANEL" })
  }

  return (
    <section className="py-6 bg-[#F9F3EF]">
      <div className="flex items-center justify-center space-x-4">
        {categories.map((category, index) => {
          const IconComponent = category.icon
          return (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleCategoryClick(category.name)}
              className="bg-[#E8DDD4] border-2 border-[#E8DDD4] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-[#F9F3EF] font-medium text-xs transition-all duration-200 py-2 px-12 rounded-lg shadow-sm hover:shadow-md flex flex-col items-center space-y-1 min-w-[150px]"
            >
              <IconComponent className="h-5 w-5" />
              <span>{category.translation}</span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
