"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useState } from "react"
import { useNotification } from "@/components/ui/notification"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"

export default function CartSidebar() {
  const { state, dispatch } = useApp()
  const isMobile = useIsMobile()
  const router = useRouter()

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id })
  }

  const getTotalPrice = () => {
    return state.cart.reduce((total, item) => {
      const price = Number(item.price)
      return total + price * item.quantity
    }, 0)
  }

  const handleCheckout = () => {
    dispatch({ type: "TOGGLE_CART" })
    router.push("/checkout")
  }

  return (
    <>
      <AnimatePresence>
        {state.isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 ${
                isMobile ? "bg-black/30" : "bg-black/50"
              }`}
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className={`fixed right-0 top-0 h-full bg-[#F9F3EF] shadow-2xl z-50 overflow-y-auto ${
                isMobile ? "w-[90%] max-w-md" : "w-full sm:w-80 md:w-96"
              }`}
            >
              {/* Header fijo */}
              <div className={`sticky top-0 z-10 bg-gradient-to-r from-[#1B3C53] to-[#456882] shadow-lg ${
                isMobile ? "p-5" : "p-4"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className={`${isMobile ? "h-7 w-7" : "h-6 w-6"} text-white`} />
                    <div>
                      <h2 className={`${isMobile ? "text-xl" : "text-lg"} font-bold text-white`}>
                        Mi Carrito
                      </h2>
                      <p className={`${isMobile ? "text-sm" : "text-xs"} text-white/90`}>
                        {state.cart.reduce((sum, item) => sum + item.quantity, 0)} {state.cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'artículo' : 'artículos'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => dispatch({ type: "TOGGLE_CART" })}
                    className={`${isMobile ? "h-11 w-11" : "h-9 w-9"} hover:bg-[#456882]/30 text-white hover:text-[#456882] rounded-full border border-white/30`}
                  >
                    <X className={`${isMobile ? "h-6 w-6" : "h-5 w-5"}`} />
                  </Button>
                </div>
              </div>

              <div className={isMobile ? "p-4 pb-32" : "p-4 pb-28"}>

                {state.cart.length === 0 ? (
                  <div className={`text-center ${isMobile ? "py-16" : "py-12"} bg-white rounded-xl shadow-sm border border-[#E8DDD4] ${isMobile ? "mt-5" : "mt-4"}`}>
                    <div className={`bg-[#E8DDD4] rounded-full ${isMobile ? "w-24 h-24" : "w-20 h-20"} flex items-center justify-center mx-auto mb-4`}>
                      <ShoppingBag className={`${isMobile ? "h-12 w-12" : "h-10 w-10"} text-[#456882]`} />
                    </div>
                    <p className={`${isMobile ? "text-lg" : "text-base"} font-semibold text-[#1B3C53] mb-2`}>
                      Tu carrito está vacío
                    </p>
                    <p className={`${isMobile ? "text-base" : "text-sm"} text-[#456882] mb-6`}>
                      Agrega productos para comenzar
                    </p>
                    <Button 
                      className={`${isMobile ? "h-14 text-base" : "h-12 text-sm"} bg-[#1B3C53] hover:bg-[#456882] text-white font-semibold w-full rounded-lg shadow-md`}
                      onClick={() => dispatch({ type: "TOGGLE_CART" })}
                    >
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className={`space-y-3 ${isMobile ? "mt-4" : "mt-3"} ${isMobile ? "mb-6" : "mb-4"}`}>
                      {state.cart.map((item) => (
                        <div key={item.id} className={`flex items-start ${isMobile ? "gap-4 p-4" : "gap-3 p-3"} bg-white rounded-xl shadow-md border-2 border-[#E8DDD4] hover:border-[#456882] transition-all`}>
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className={`${isMobile ? "w-24 h-24" : "w-20 h-20"} object-contain rounded-lg border-2 border-[#E8DDD4] flex-shrink-0 bg-white p-1`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className={`${isMobile ? "text-base" : "text-sm"} font-bold text-[#1B3C53] line-clamp-2 flex-1`}>
                                {item.name}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`${isMobile ? "h-9 w-9" : "h-8 w-8"} text-red-500 hover:text-white hover:bg-red-500 rounded-lg flex-shrink-0 mt-0.5`}
                                onClick={() => removeItem(item.id)}
                              >
                                <X className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-[#E8DDD4] rounded-lg px-2 py-1.5 inline-block">
                                <span className={`${isMobile ? "text-xl" : "text-lg"} font-extrabold text-[#1B3C53]`}>
                                  ${Number(item.price).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 bg-[#E8DDD4] rounded-lg p-1.5 border-2 border-[#D4C4B5] w-fit">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`${isMobile ? "h-10 w-10" : "h-9 w-9"} hover:bg-[#1B3C53] hover:text-white rounded-md transition-all`}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className={`${isMobile ? "h-5 w-5" : "h-4 w-4"} ${item.quantity <= 1 ? "text-gray-400" : "text-[#1B3C53]"}`} />
                                </Button>
                                <span className={`${isMobile ? "w-12 text-lg" : "w-10 text-base"} text-center font-bold text-[#1B3C53]`}>
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`${isMobile ? "h-10 w-10" : "h-9 w-9"} hover:bg-[#1B3C53] hover:text-white rounded-md transition-all`}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className={`${isMobile ? "h-5 w-5" : "h-4 w-4"} text-[#1B3C53]`} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer fijo con total y botón de pago */}
              {state.cart.length > 0 && (
                <div className={`fixed bottom-0 right-0 ${isMobile ? "w-[90%] max-w-md" : "w-full sm:w-80 md:w-96"} bg-white border-t-4 border-[#1B3C53] shadow-2xl z-10`}>
                  <div className={`${isMobile ? "p-5" : "p-4"} ${isMobile ? "space-y-5" : "space-y-3"} bg-gradient-to-b from-white to-[#F9F3EF]`}>
                    <div className="flex justify-between items-center bg-gradient-to-r from-[#E8DDD4] to-[#F0E8E0] rounded-xl p-3 border-2 border-[#D4C4B5] shadow-sm">
                      <span className={`${isMobile ? "text-xl" : "text-lg"} font-bold text-[#1B3C53]`}>
                        Total:
                      </span>
                      <span className={`${isMobile ? "text-3xl" : "text-2xl"} font-extrabold text-[#1B3C53]`}>
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className={`${isMobile ? "h-16 text-lg" : "h-12 text-base"} w-full bg-gradient-to-r from-[#1B3C53] via-[#456882] to-[#1B3C53] hover:from-[#456882] hover:via-[#1B3C53] hover:to-[#456882] text-white font-extrabold rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-[#1B3C53]`}
                      onClick={handleCheckout}
                    >
                      Proceder al Pago
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  )
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
}

function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const { state, dispatch } = useApp()
  const { showNotification } = useNotification()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Calcular el total de la compra
      const totalAmount = getTotalPrice()
      
      // Agregar puntos al usuario si está autenticado
      if (state.userSession?.user?.id) {
        const token = localStorage.getItem('token')
        await fetch('http://localhost:8000/api/points/add', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: state.userSession.user.id,
            amount: totalAmount,
            description: `Compra por $${totalAmount.toFixed(2)}`
          })
        })
      }
      
      // Simular procesamiento de pago
      setTimeout(() => {
        setIsProcessing(false)
        dispatch({ type: "CLEAR_CART" })
        onClose()
        showNotification(`¡Pago exitoso! Has ganado ${Math.floor(totalAmount)} puntos por tu compra.`, "success")
      }, 2000)
    } catch (error) {
      console.error('Error al procesar pago:', error)
      setIsProcessing(false)
      showNotification("Error al procesar el pago. Inténtalo de nuevo.", "error")
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Pago</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Método de Pago</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Tarjeta de Crédito/Débito</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>PayPal</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="apple"
                  checked={paymentMethod === "apple"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Apple Pay</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="oxxo"
                  checked={paymentMethod === "oxxo"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Pago en Oxxo</span>
              </label>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing
              ? "Procesando..."
              : paymentMethod === "oxxo"
                ? "Generar código para Oxxo"
                : `Pagar $${total.toFixed(2)}`}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
