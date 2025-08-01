"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useState } from "react"

export default function CartSidebar() {
  const { state, dispatch } = useApp()
  const [showCheckout, setShowCheckout] = useState(false)
  

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
    setShowCheckout(true)
    dispatch({ type: "TOGGLE_CART" })
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
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <ShoppingBag className="mr-2" />
                    Carrito de Compras ({state.cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {state.cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Tu carrito está vacío</p>
                    <Button className="mt-4" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {state.cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 object-contain rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-bold">${Number(item.price).toFixed(2)}</span>

                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-xl font-bold text-black-600">${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-[#be0c0c] to-[#be0c0c] hover:from-[#8B0000] hover:to-[#8B0000]"
                        onClick={handleCheckout}
                      >
                        Proceder al Pago
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showCheckout && (
        <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} total={getTotalPrice()} />
      )}
    </>
  )
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
}

function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const { dispatch } = useApp()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      dispatch({ type: "CLEAR_CART" })
      onClose()
      alert("Payment successful! Your order has been placed.")
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
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
