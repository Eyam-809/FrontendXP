"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"

export default function FavoritesSidebar() {
  const { state, dispatch } = useApp()

  const removeFromFavorites = (id: number) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: id })
  }

  const addToCart = (product: any) => {
    dispatch({ type: "ADD_TO_CART", payload: product })
  }

  return (
    <AnimatePresence>
      {state.isFavoritesOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-bold flex items-center text-gray-900">
                  <Heart className="mr-2 text-red-500" />
                  Favoritos ({state.favorites.length})
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
                  className="hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {state.favorites.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-4">No tienes favoritos aún</p>
                  <Button 
                    className="mt-4 bg-[#1B3C53] hover:bg-[#0F2A3A] text-white" 
                    onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
                  >
                    Explorar Productos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.favorites.map((item) => {
                    const price = Number(item.price) // 👈 conversión segura

                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded border border-gray-100"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-base text-gray-900">{item.name}</h3>
                          <div className="mt-1">
                            <span className="font-bold text-lg text-red-600">${price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-[#1B3C53] hover:bg-[#0F2A3A] text-white font-medium"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Añadir al Carrito
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromFavorites(item.id)}
                              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
