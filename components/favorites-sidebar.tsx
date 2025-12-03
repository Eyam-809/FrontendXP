"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useNotification } from "@/components/ui/notification"

export default function FavoritesSidebar() {
  const { state, dispatch } = useApp()
  const isMobile = useIsMobile()
  const { showNotification } = useNotification()

  const removeFromFavorites = (id: number) => {
    const product = state.favorites.find(item => item.id === id)
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: id })
    if (product) {
      showNotification(`"${product.name}" fue eliminado de favoritos`, "info")
    }
  }

  const addToCart = (product: any) => {
    // Verificar stock disponible
    const productStock = product.stock !== undefined ? Number(product.stock) : null
    if (productStock !== null && productStock <= 0) {
      showNotification(`"${product.name}" no está disponible en stock`, "error")
      return
    }
    
    // Verificar si el producto ya está en el carrito y su cantidad
    const existingItem = state.cart.find((item) => item.id === product.id)
    if (existingItem && productStock !== null) {
      const currentQuantity = existingItem.quantity || 0
      if (currentQuantity >= productStock) {
        showNotification(`Has alcanzado el límite de stock disponible para "${product.name}" (${productStock} unidades)`, "warning")
        return
      }
    }
    
    dispatch({ type: "ADD_TO_CART", payload: product })
    showNotification(`"${product.name}" fue agregado al carrito`, "success")
    // No abrir el sidebar del carrito automáticamente
  }

  return (
    <AnimatePresence>
      {state.isFavoritesOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 ${
              isMobile ? "bg-black/30" : "bg-black/50"
            }`}
            onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className={`fixed right-0 top-0 h-full bg-[#F9F3EF] shadow-2xl z-50 overflow-y-auto ${
              isMobile ? "w-[85%] max-w-sm" : "w-full max-w-md"
            }`}
          >
            {/* Header fijo */}
            <div className={`sticky top-0 z-10 bg-gradient-to-r from-[#1B3C53] to-[#456882] shadow-md ${
              isMobile ? "p-4" : "p-5"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className={`${isMobile ? "h-6 w-6" : "h-7 w-7"} text-white fill-white`} />
                  <div>
                    <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-white`}>
                      Mis Favoritos
                    </h2>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-white/80`}>
                      {state.favorites.length} {state.favorites.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
                    className={`${isMobile ? "h-10 w-10" : "h-11 w-11"} hover:bg-[#456882]/20 text-white hover:text-[#456882] rounded-full`}
                  >
                    <X className={`${isMobile ? "h-5 w-5" : "h-6 w-6"}`} />
                  </Button>
              </div>
            </div>

            <div className={isMobile ? "p-3" : "p-6"}>

              {state.favorites.length === 0 ? (
                <div className={`text-center ${isMobile ? "py-10" : "py-12"} bg-white rounded-xl shadow-sm border border-[#E8DDD4] mt-4`}>
                  <div className="bg-[#E8DDD4] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-10 w-10 text-[#456882]" />
                  </div>
                  <p className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-[#1B3C53] mb-2`}>
                    No tienes favoritos aún
                  </p>
                  <p className={`${isMobile ? "text-sm" : "text-base"} text-[#456882] mb-6`}>
                    Guarda tus productos favoritos aquí
                  </p>
                  <Button 
                    className={`${isMobile ? "h-12 text-base" : "h-14 text-lg"} bg-[#1B3C53] hover:bg-[#456882] text-white font-semibold w-full rounded-lg shadow-md`}
                    onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
                  >
                    Explorar Productos
                  </Button>
                </div>
              ) : (
                <div className={`space-y-3 ${isMobile ? "mt-3" : "mt-4"}`}>
                  {state.favorites.map((item) => {
                    const price = Number(item.price)

                    return (
                      <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-[#E8DDD4] overflow-hidden ${
                        isMobile ? "p-3" : "p-4"
                      }`}>
                        <div className="flex gap-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className={`${isMobile ? "w-20 h-20" : "w-24 h-24"} object-contain rounded-lg border border-[#E8DDD4] flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className={`${isMobile ? "text-sm" : "text-base"} font-bold text-[#1B3C53] mb-2 line-clamp-2`}>
                              {item.name}
                            </h3>
                            <div className={`${isMobile ? "text-lg" : "text-xl"} font-extrabold text-[#456882] mb-4 bg-[#E8DDD4] rounded-lg px-2 py-1 inline-block`}>
                              ${price.toFixed(2)}
                            </div>
                            <div className={`flex ${isMobile ? "flex-col gap-2" : "items-center gap-2"}`}>
                              <Button
                                size={isMobile ? "default" : "sm"}
                                onClick={() => addToCart(item)}
                                className={`${isMobile ? "h-11 text-sm w-full" : "h-10 text-xs"} bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#456882] hover:to-[#1B3C53] text-white font-bold rounded-lg flex-1 shadow-md border-2 border-[#1B3C53] transition-all`}
                              >
                                <ShoppingCart className={`${isMobile ? "h-4 w-4" : "h-3 w-3"} mr-2`} />
                                Agregar al Carrito
                              </Button>
                              <Button
                                variant="outline"
                                size={isMobile ? "default" : "sm"}
                                onClick={() => removeFromFavorites(item.id)}
                                className={`${isMobile ? "h-11 text-sm w-full" : "h-10 text-xs"} border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-bold rounded-lg transition-all`}
                              >
                                Eliminar
                              </Button>
                            </div>
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
