"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useState } from "react"
import { useNotification } from "@/components/ui/notification"

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
              className="fixed right-0 top-0 h-full w-full sm:w-80 md:w-96 bg-background shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4 bg-secondary p-3 rounded-lg">
                  <h2 className="text-lg font-bold flex items-center text-card-foreground">
                    <ShoppingBag className="mr-2 text-primary" />
                    Carrito ({state.cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => dispatch({ type: "TOGGLE_CART" })}
                    className="hover:bg-accent text-muted-foreground hover:text-card-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {state.cart.length === 0 ? (
                  <div className="text-center py-8 bg-secondary rounded-lg">
                    <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-card-foreground font-medium mb-3">Tu carrito está vacío</p>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground" 
                      onClick={() => dispatch({ type: "TOGGLE_CART" })}
                    >
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {state.cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-card shadow-sm">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-12 h-12 object-contain rounded border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-card-foreground truncate">{item.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-bold text-primary">${Number(item.price).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-border hover:bg-accent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium text-card-foreground">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-border hover:bg-accent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-3 bg-secondary p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-semibold text-card-foreground">Total:</span>
                        <span className="text-lg font-bold text-primary">${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
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
