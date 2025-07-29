"use client"

import { motion } from "framer-motion"

const categories = [
  { name: "Electrónicos", icon: "💻", color: "bg-gradient-to-br from-blue-500 to-cyan-400" },
  { name: "Moda", icon: "👕", color: "bg-gradient-to-br from-pink-500 to-rose-400" },
  { name: "Hogar", icon: "🏠", color: "bg-gradient-to-br from-amber-500 to-yellow-400" },
  { name: "Deportes", icon: "⚽", color: "bg-gradient-to-br from-green-500 to-emerald-400" },
  { name: "Belleza", icon: "💄", color: "bg-gradient-to-br from-purple-500 to-violet-400" },
  { name: "Juguetes", icon: "🧸", color: "bg-gradient-to-br from-red-500 to-orange-400" },
]

export default function CategorySection() {
  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Comprar por Categoría</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.05 }}
            className={`${category.color} rounded-xl shadow-lg overflow-hidden cursor-pointer`}
          >
            <a href="#" className="block p-6 text-center text-white">
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="font-medium">{category.name}</h3>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
