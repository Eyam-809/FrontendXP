"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Smartphone, Wallet, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { useState } from "react"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"

interface CheckoutModalProps {
  onClose?: () => void
  isOpen?: boolean
  total?: number
}

export default function CheckoutModal({ onClose, isOpen, total }: CheckoutModalProps) {
  const { state, dispatch } = useApp()
  const { showNotification } = useNotification()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  // Show modal when cart has items and checkout is triggered
  React.useEffect(() => {
    if (state.cart.length > 0) {
      setIsModalOpen(true)
      document.body.style.overflow = 'hidden'
    } else {
      setIsModalOpen(false)
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [state.cart.length])

  // Handle external onClose prop
  React.useEffect(() => {
    if (isOpen !== undefined) {
      setIsModalOpen(isOpen)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'unset'
    if (onClose) {
      onClose()
    }
  }

  const getTotalPrice = () => {
    return state.cart.reduce((total, item) => {
      const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
      return total + price * item.quantity
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Preferir user desde el estado global; si no existe, intentar localStorage
      const userFromState = (state as any).user
      let user = userFromState
      if (!user) {
        const stored = localStorage.getItem("user") || localStorage.getItem("userData") || localStorage.getItem("userInfo")
        user = stored ? JSON.parse(stored) : null
      }

      const userId = user?.id
      const phone = user?.phone || ""

      if (!userId) {
        showNotification("Por favor inicia sesión para completar la compra", "warning")
        setIsProcessing(false)
        return
      }

      if (state.cart.length === 0) {
        showNotification("El carrito está vacío", "warning")
        setIsProcessing(false)
        return
      }

      // Preparar productos según lo que espera el backend
      const productos = state.cart.map((item: any) => ({
        producto_id: item.id,
        tipo: item.tipo ?? "venta",
        cantidad: item.quantity,
        precio_unitario: item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price,
      }))

      // Payload con los nombres que indicó el backend
      const payload = {
        user_id: userId,
        fecha_pago: new Date().toISOString().split("T")[0],
        total: getTotalPrice(),
        direccion_envio: formData.address,
        telefono_contacto: phone,
        tipo: productos[0]?.tipo ?? "venta",
        metodo_pago: paymentMethod,
        productos,
      }

      console.log("Compra payload:", payload)

      const token = localStorage.getItem("token")
      const res = await fetch(`${ApiUrl}/api/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let body: any = null
        try { body = await res.json() } catch { body = await res.text().catch(() => null) }
        console.error("Error crear compra:", res.status, body)
        const firstError =
          body?.message ||
          (body?.errors && Object.values(body.errors).flat()[0]) ||
          (typeof body === "string" ? body : null)
        throw new Error(firstError || `Error ${res.status} al crear la compra`)
      }

      // Éxito
      dispatch({ type: "CLEAR_CART" })
      showNotification("Compra realizada con éxito 🎉", "success")
      handleClose()
    } catch (error: any) {
      console.error("Error al procesar la compra:", error)
      showNotification(error?.message || "Error al procesar la compra", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isModalOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 bg-secondary p-3 rounded-lg">
              <h2 className="text-xl font-bold text-card-foreground">Pago</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="hover:bg-accent text-muted-foreground hover:text-card-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Order Summary */}
              <div className="bg-secondary p-3 rounded-lg">
                <h3 className="text-base font-semibold mb-2 text-card-foreground">Resumen del Pedido</h3>
                <div className="space-y-2 mb-2">
                  {state.cart.map((item) => {
                    const finalPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
                    return (
                      <div key={item.id} className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-8 h-8 object-contain rounded border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-card-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-primary text-sm">${(finalPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-border pt-2 bg-card p-2 rounded-lg">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-card-foreground">Total:</span>
                    <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-card p-3 rounded-lg border border-border">
                <h3 className="text-base font-semibold mb-2 text-card-foreground">Método de Pago</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2 border rounded-lg flex flex-col items-center transition-colors ${
                      paymentMethod === "card" ? "border-primary bg-primary/10" : "border-border hover:border-ring"
                    }`}
                  >
                    <CreditCard className={`h-4 w-4 mb-1 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs ${paymentMethod === "card" ? "text-primary font-medium" : "text-muted-foreground"}`}>Tarjeta</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-2 border rounded-lg flex flex-col items-center transition-colors ${
                      paymentMethod === "paypal" ? "border-primary bg-primary/10" : "border-border hover:border-ring"
                    }`}
                  >
                    <Wallet className={`h-4 w-4 mb-1 ${paymentMethod === "paypal" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs ${paymentMethod === "paypal" ? "text-primary font-medium" : "text-muted-foreground"}`}>PayPal</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("apple")}
                    className={`p-2 border rounded-lg flex flex-col items-center transition-colors ${
                      paymentMethod === "apple" ? "border-primary bg-primary/10" : "border-border hover:border-ring"
                    }`}
                  >
                    <Smartphone className={`h-4 w-4 mb-1 ${paymentMethod === "apple" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs ${paymentMethod === "apple" ? "text-primary font-medium" : "text-muted-foreground"}`}>Apple Pay</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("oxxo")}
                    className={`p-2 border rounded-lg flex flex-col items-center transition-colors ${
                      paymentMethod === "oxxo" ? "border-primary bg-primary/10" : "border-border hover:border-ring"
                    }`}
                  >
                    <ShoppingBag className={`h-4 w-4 mb-1 ${paymentMethod === "oxxo" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs ${paymentMethod === "oxxo" ? "text-primary font-medium" : "text-muted-foreground"}`}>Oxxo</span>
                  </button>
                </div>

              </div>

              {/* Form Fields */}
              <div className="bg-card p-3 rounded-lg border border-border">
                <h3 className="text-base font-semibold mb-2 text-card-foreground">Información Personal</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="email" className="text-card-foreground font-medium text-sm">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                     className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="firstName" className="text-card-foreground font-medium text-sm">Nombre</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                        className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-card-foreground font-medium text-sm">Apellido</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Pérez"
                        className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                      />
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber" className="text-card-foreground font-medium text-sm">Número de Tarjeta</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          pattern="[0-9\s]{13,19}"
                          inputMode="numeric"
                          className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="expiryDate" className="text-card-foreground font-medium text-sm">Fecha de Expiración</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/AA"
                            className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-card-foreground font-medium text-sm">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="address" className="text-card-foreground font-medium text-sm">Dirección</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Calle Principal 123"
                      className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city" className="text-card-foreground font-medium text-sm">Ciudad</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ciudad de México"
                        className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-card-foreground font-medium text-sm">Código Postal</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="01000"
                        className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Procesando Pago..."
                    : paymentMethod === "oxxo"
                      ? `Generar código para Oxxo`
                      : `Pagar $${getTotalPrice().toFixed(2)}`}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
