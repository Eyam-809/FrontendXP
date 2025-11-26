"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Smartphone, Wallet, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { useState } from "react"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"
import Navbar from "@/components/navbar"
import MobileNavbar from "@/components/mobile/mobile-navbar"
import { useIsMobile } from "@/hooks/use-mobile"
import Footer from "@/components/footer"

export default function CheckoutPage() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { showNotification } = useNotification()
  const isMobile = useIsMobile()
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

  useEffect(() => {
    if (state.cart.length === 0) {
      router.push("/")
      showNotification("Tu carrito está vacío", "warning")
    }
  }, [state.cart.length, router, showNotification])

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

      const productos = state.cart.map((item: any) => ({
        producto_id: item.id,
        tipo: item.tipo ?? "venta",
        cantidad: item.quantity,
        precio_unitario: item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price,
      }))

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
        const firstError =
          body?.message ||
          (body?.errors && Object.values(body.errors).flat()[0]) ||
          (typeof body === "string" ? body : null)
        throw new Error(firstError || `Error ${res.status} al crear la compra`)
      }

      dispatch({ type: "CLEAR_CART" })
      showNotification("Compra realizada con éxito 🎉", "success")
      router.push("/")
    } catch (error: any) {
      console.error("Error al procesar la compra:", error)
      showNotification(error?.message || "Error al procesar la compra", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      {isMobile ? <MobileNavbar /> : <Navbar />}
      <div className={`container mx-auto ${isMobile ? "px-4 py-6" : "px-6 py-8"}`}>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-[#1B3C53] hover:text-[#456882] hover:bg-[#E8DDD4]"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>

        <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-[#1B3C53] mb-6`}>
          Finalizar Compra
        </h1>

        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"} gap-6`}>
          {/* Order Summary */}
          <div className={`${isMobile ? "order-2" : "lg:order-1"} bg-white rounded-xl shadow-lg border border-[#E8DDD4] p-6 h-fit`}>
            <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-[#1B3C53] mb-4`}>
              Resumen del Pedido
            </h3>
            <div className="space-y-3 mb-4">
              {state.cart.map((item) => {
                const finalPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-[#F9F3EF] p-3 rounded-lg border border-[#E8DDD4]">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className={`${isMobile ? "w-16 h-16" : "w-20 h-20"} object-contain rounded-lg border border-[#E8DDD4]`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`${isMobile ? "text-sm" : "text-base"} font-semibold text-[#1B3C53] truncate`}>
                        {item.name}
                      </p>
                      <p className={`${isMobile ? "text-xs" : "text-sm"} text-[#456882]`}>
                        Cantidad: {item.quantity}
                      </p>
                      <p className={`${isMobile ? "text-base" : "text-lg"} font-bold text-[#1B3C53] mt-1`}>
                        ${(finalPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t-2 border-[#E8DDD4] pt-4 bg-gradient-to-r from-[#E8DDD4] to-[#F9F3EF] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-[#1B3C53]`}>
                  Total:
                </span>
                <span className={`${isMobile ? "text-2xl" : "text-3xl"} font-extrabold text-[#1B3C53]`}>
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className={`${isMobile ? "order-1" : "lg:col-span-2 lg:order-2"} space-y-6`}>
            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-[#E8DDD4] p-6">
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-[#1B3C53] mb-4`}>
                Método de Pago
              </h3>
              <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-3`}>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "card"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <CreditCard className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`} />
                  <span className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>Tarjeta</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "paypal"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <Wallet className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`} />
                  <span className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>PayPal</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("apple")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "apple"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <Smartphone className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`} />
                  <span className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>Apple Pay</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("oxxo")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "oxxo"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <ShoppingBag className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`} />
                  <span className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>Oxxo</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-xl shadow-lg border border-[#E8DDD4] p-6">
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-[#1B3C53] mb-4`}>
                Información de Pago
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-[#1B3C53] font-semibold mb-2 block">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                  />
                </div>

                <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                  <div>
                    <Label htmlFor="firstName" className="text-[#1B3C53] font-semibold mb-2 block">
                      Nombre
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Juan"
                      className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-[#1B3C53] font-semibold mb-2 block">
                      Apellido
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Pérez"
                      className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                    />
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber" className="text-[#1B3C53] font-semibold mb-2 block">
                        Número de Tarjeta
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                      />
                    </div>

                    <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                      <div>
                        <Label htmlFor="expiryDate" className="text-[#1B3C53] font-semibold mb-2 block">
                          Fecha de Expiración
                        </Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/AA"
                          className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-[#1B3C53] font-semibold mb-2 block">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="address" className="text-[#1B3C53] font-semibold mb-2 block">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle Principal 123"
                    className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                  />
                </div>

                <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                  <div>
                    <Label htmlFor="city" className="text-[#1B3C53] font-semibold mb-2 block">
                      Ciudad
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ciudad de México"
                      className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-[#1B3C53] font-semibold mb-2 block">
                      Código Postal
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="01000"
                      className="h-12 border-[#E8DDD4] focus:border-[#1B3C53] text-[#1B3C53]"
                    />
                  </div>
                </div>
              </div>

              <Button
                className={`${isMobile ? "h-14 text-base mt-6" : "h-16 text-lg mt-8"} w-full bg-gradient-to-r from-[#1B3C53] via-[#456882] to-[#1B3C53] hover:from-[#456882] hover:via-[#1B3C53] hover:to-[#456882] text-white font-extrabold rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Procesando Pago..."
                  : paymentMethod === "oxxo"
                    ? `Generar código para Oxxo - $${getTotalPrice().toFixed(2)}`
                    : `Pagar $${getTotalPrice().toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

