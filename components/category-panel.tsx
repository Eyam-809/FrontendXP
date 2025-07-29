"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"

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

const categoryData = {
  Electronics: {
    subcategories: ["Smartphones", "Laptops", "Headphones", "Cameras"],
    featured: ["iPhone 15", "MacBook Pro", "AirPods Pro", "PlayStation 5"],
  },
  Fashion: {
    subcategories: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories"],
    featured: ["Summer Collection", "Designer Shoes", "Luxury Watches", "Handbags"],
  },
  Home: {
    subcategories: ["Kitchen", "Bedroom", "Living Room", "Garden"],
    featured: ["Smart Kitchen", "Bedroom Sets", "Garden Tools", "Home Decor"],
  },
  Sports: {
    subcategories: ["Fitness", "Outdoor", "Team Sports", "Water Sports"],
    featured: ["Gym Equipment", "Camping Gear", "Soccer Balls", "Swimwear"],
  },
  Beauty: {
    subcategories: ["Skincare", "Makeup", "Hair Care", "Fragrances"],
    featured: ["Anti-Aging", "Foundation", "Shampoo", "Perfumes"],
  },
  Toys: {
    subcategories: ["Educational", "Action Figures", "Board Games", "Outdoor Toys"],
    featured: ["LEGO Sets", "Dolls", "Puzzles", "Remote Control"],
  },
}

export default function CategoryPanel() {
  const { state, dispatch } = useApp()

  if (!state.isCategoryPanelOpen || !state.selectedCategory) return null

  const categoryInfo = categoryData[state.selectedCategory as keyof typeof categoryData]

  const handleSubcategoryClick = (subcategory: string) => {
    dispatch({ type: "SET_SELECTED_SUBCATEGORY", payload: subcategory })
    dispatch({ type: "TOGGLE_CATEGORY_PANEL" })
  }

  const handleFeaturedClick = (item: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: item })
    dispatch({ type: "TOGGLE_CATEGORY_PANEL" })
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
              <h2 className="text-2xl font-bold text-gray-800">{translateCategory(state.selectedCategory || "")}</h2>
              <Button variant="ghost" size="icon" onClick={() => dispatch({ type: "TOGGLE_CATEGORY_PANEL" })}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Subcategorías</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categoryInfo.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryClick(subcategory)}
                      className="text-left p-3 rounded-md hover:bg-purple-50 hover:text-purple-600 transition-colors border border-gray-200 hover:border-purple-200"
                    >
                      <span className="font-medium">{translateSubcategory(subcategory)}</span>
                      <div className="text-xs text-gray-500 mt-1">10 productos</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Productos Destacados</h3>
                <div className="space-y-2">
                  {categoryInfo.featured.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleFeaturedClick(item)}
                      className="block w-full text-left p-2 rounded-md hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Ofertas Especiales</h3>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white">
                  <h4 className="font-semibold mb-2">Hasta 50% de Descuento</h4>
                  <p className="text-sm mb-3">
                    Artículos seleccionados de {translateCategory(state.selectedCategory || "").toLowerCase()}
                  </p>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm">Comprar Ahora</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
