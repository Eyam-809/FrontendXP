"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Smartphone, Wallet, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { useState } from "react"

export default function CheckoutModal({ onClose }: { onClose?: () => void }) {
  const { state, dispatch } = useApp()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handlePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      dispatch({ type: "CLEAR_CART" })
      alert("Payment successful! Your order has been placed.")
    }, 2000)
  }

  if (state.cart.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Pago</h2>
              <Button variant="ghost" size="icon" onClick={onClose || (() => {})}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {state.cart.map((item) => {
                    const finalPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
                    return (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(finalPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">Método de Pago</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        paymentMethod === "card" ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}
                    >
                      <CreditCard className="h-6 w-6 mb-1" />
                      <span className="text-xs">Tarjeta</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        paymentMethod === "paypal" ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}
                    >
                      <Wallet className="h-6 w-6 mb-1" />
                      <span className="text-xs">PayPal</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("apple")}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        paymentMethod === "apple" ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}
                    >
                      <Smartphone className="h-6 w-6 mb-1" />
                      <span className="text-xs">Apple Pay</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("oxxo")}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        paymentMethod === "oxxo" ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}
                    >
                      <ShoppingBag className="h-6 w-6 mb-1" />
                      <span className="text-xs">Oxxo</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Fecha de Expiración</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/AA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === "oxxo" && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="font-medium text-yellow-800 mb-2">Pago en Oxxo</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Al completar tu compra, recibirás un código de barras para realizar el pago en cualquier tienda
                        Oxxo. Tu pedido será procesado una vez que se confirme el pago.
                      </p>
                      <div className="flex items-center justify-center p-3 bg-white border border-yellow-200 rounded-md">
                        <ShoppingBag className="h-8 w-8 text-yellow-500 mr-3" />
                        <div>
                          <p className="font-medium">Pago en efectivo</p>
                          <p className="text-xs text-gray-500">El código será enviado a tu correo</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Calle Principal 123"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ciudad de México"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Código Postal</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="01000"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
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
