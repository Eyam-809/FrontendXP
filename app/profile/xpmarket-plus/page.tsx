"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Crown,
  Gamepad2,
  Headphones,
  Monitor,
  Smartphone,
  Shield,
  Zap,
  Gift,
  Truck,
  User,
  CheckCircle,
  ArrowRight,
  X,
  CreditCard,
  Wallet,
  AlertCircle,
  ShoppingBag
} from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { ApiUrl } from "@/lib/config"

interface UserData {
  name: string
  email: string
  avatar?: string
}

export default function XPmarketPlusPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState("mensual") // mensual, trimestral, anual
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [userPlanId, setUserPlanId] = useState<string | null>(null)
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
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // Verificar el plan actual del usuario (por defecto es plan básico con ID: 1)
    const planId = localStorage.getItem("plan_id") || "1"
    setUserPlanId(planId)
  }, [])

  const gamingApps = [
    { name: "Steam", color: "bg-[#1B3C53]", icon: "🎮" },
    { name: "Epic", color: "bg-[#456882]", icon: "🎯" },
    { name: "Discord", color: "bg-purple-600", icon: "💬" },
    { name: "Twitch", color: "bg-purple-500", icon: "📺" },
    { name: "Spotify", color: "bg-green-500", icon: "🎵" },
    { name: "Netflix", color: "bg-[#E63946]", icon: "🎬" }
  ]

  const familyPlan = {
    title: "XPMarket Basico",
    price: "Gratis",
    monthlyPrice: "",
    badge: "",
    features: [
      "Para usuarios que inician en la plataforma",
      "Publicación de hasta 5 productos activos a la vez",
      "Visualización de anuncios publicitarios",
      "Comisión del 5% sobre cada venta",
      "Sin acceso al chat global  (Sistema de intercambios)",
      "Sin verificación premium",

    ]
  }

  const personalPlan = {
    title: "XPMarket Cliente Fiel",
    price: "$99.00MXN",
    monthlyPrice: "$899.00MXN/año",
    features: [
      "Vendedores activos",
      "Publicación de hasta 100 productos activos a la vez",
      "Comisión reducida del 2.5% por venta",
      "Acceso al chat global",
      "Sistema de puntuaciones y reseñas",
      "Acceso al chat global",
      "Verificación premium incluida",
    ]
  }

  const paymentPlans = {
    mensual: { price: 99, label: "Mensual", usd: 5.50 },
    trimestral: { price: 249, label: "Trimestral", usd: 13.80 },
    anual: { price: 899, label: "Anual", usd: 49.80 }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // nueva función: realiza compra contra el endpoint /api/compras
  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const stored = localStorage.getItem("userData") || localStorage.getItem("user") || localStorage.getItem("userInfo")
      const localUser = stored ? JSON.parse(stored) : user
      const userId = localUser?.id
      const phone = localUser?.phone || ""

      if (!userId) {
        alert("Debes iniciar sesión para comprar la suscripción.")
        setIsProcessing(false)
        return
      }

      const total = getTotalPrice()

      // Determinar plan_id: intenta obtener de un estado/selección, localStorage o un mapeo por defecto
      const planIdFromState = (selectedPaymentPlan as any)?.id ?? null
      const planIdFromStorage = localStorage.getItem("selected_plan_id") || localStorage.getItem("plan_id")
      const planMap: Record<string, number> = { mensual: 1, trimestral: 2, anual: 3 }
      const mappedPlanId = planMap[selectedPaymentPlan] ?? null
      const plan_id = planIdFromState ?? (planIdFromStorage ? Number(planIdFromStorage) : null) ?? mappedPlanId

      if (!plan_id) {
        console.warn("No se encontró plan_id; verifica los ids reales de tus planes. Se enviará plan_id: null")
      }

      // montar payload similar al checkout-modal, tipo 'suscripcion'
      const productos = [{
        producto_id: plan_id ?? null,
        tipo: "suscripcion",
        cantidad: 1,
        precio_unitario: total
      }]

      const payload: any = {
        user_id: userId,
        fecha_pago: new Date().toISOString().split("T")[0],
        total,
        direccion_envio: formData.address,
        telefono_contacto: phone,
        tipo: "suscripcion",
        metodo_pago: paymentMethod,
        productos,
        plan_id // <-- campo añadido para que el backend reciba el id del plan
      }

      console.log("Enviando compra suscripción:", payload)
      const token = localStorage.getItem("token")
      const res = await fetch(`${ApiUrl}/api/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        // intentar leer respuesta para debug y mostrar detalle
        let body: any = null
        try {
          body = await res.json()
        } catch (e) {
          body = await res.text().catch(() => null)
        }
        console.error("Error compra suscripción:", res.status, body)
        const firstError =
          body?.message ||
          (body?.errors && Object.values(body.errors).flat()[0]) ||
          (typeof body === "string" ? body : null) ||
          `Error ${res.status}`
        // sugerencia rápida al dev sobre plan_id faltante
        if (res.status === 400 && (!plan_id || plan_id === null)) {
          console.warn("400 recibido: revisa si el backend requiere plan_id con un id válido. Plan enviado:", plan_id)
        }
        throw new Error(firstError)
      }

      // éxito: actualizar plan local y cerrar modal
      localStorage.setItem("plan_id", "2")
      setUserPlanId("2")
      alert("¡Suscripción exitosa! Ahora tienes acceso al plan Cliente Fiel.")
      setShowSubscriptionModal(false)
    } catch (err: any) {
      console.error("Error procesando suscripción:", err)
      alert(err?.message || "Error al procesar la suscripción")
    } finally {
      setIsProcessing(false)
    }
  }

  const getTotalPrice = () => {
    return paymentPlans[selectedPaymentPlan as keyof typeof paymentPlans].price
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando planes de suscripción...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">XPMarket +</h1>
            <p className="text-gray-600">Adquiere tu plan! Únete a la familia con una suscripción con beneficios en envíos, compras y ventas</p>
          </div>
        </div>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Family Plan */}
          <Card className={`bg-white shadow-lg border-4 relative ${
            userPlanId === "1" 
              ? "border-yellow-400 shadow-[0_0_20px_rgba(255,193,7,0.6),0_0_40px_rgba(255,193,7,0.3)] ring-2 ring-yellow-300 ring-opacity-30" 
              : "border-gray-300"
          }`}>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {familyPlan.title}
              </CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {familyPlan.price}
              </div>
              
              {/* Gaming Apps Icons */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {gamingApps.map((app, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${app.color}`}
                    title={app.name}
                  >
                    {app.icon}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {familyPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-6 space-y-3">
                {userPlanId === "1" ? (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Plan Activo Actualmente
                  </Button>
                ) : (
                  <Button className="w-full bg-[#1B3C53] hover:bg-[#456882] text-[#F9F3EF]">
                    Iniciar ahora
                  </Button>
                )}
                <div className="text-center space-y-2">
                  <Link href="#" className="text-[#1B3C53] hover:underline text-sm block">
                    {familyPlan.monthlyPrice}
                  </Link>
                  <Link href="#" className="text-[#1B3C53] hover:underline text-sm flex items-center justify-center">
                  
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Plan */}
          <Card className={`bg-white shadow-lg border-4 ${
            userPlanId === "2" 
              ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6),0_0_40px_rgba(34,197,94,0.3)] ring-2 ring-green-400 ring-opacity-30" 
              : "border-gray-300"
          }`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {personalPlan.title}
              </CardTitle>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {personalPlan.price}
              </div>
              
              {/* Gaming Apps Icons */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {gamingApps.map((app, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${app.color}`}
                    title={app.name}
                  >
                    {app.icon}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {personalPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-6 space-y-3">
                {userPlanId === "2" ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Plan Adquirido
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full bg-[#1B3C53] hover:bg-[#456882] text-[#F9F3EF]"
                      onClick={() => {
                        if (userPlanId !== "2") {
                          setShowSubscriptionModal(true)
                        }
                      }}
                    >
                      Comprar ahora
                    </Button>
                    <div className="text-center">
                      <Link href="#" className="text-[#1B3C53] hover:underline text-sm block">
                        O comprar por {personalPlan.monthlyPrice}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Suscripción */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSubscriptionModal(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-[#1B3C53] text-white p-4 rounded-lg">
                  <div>
                    <h2 className="text-2xl font-bold">Costos del Plan Cliente Fiel</h2>
                    <p className="text-sm opacity-90">Selecciona tu plan de suscripción</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSubscriptionModal(false)}
                    className="hover:bg-[#456882] text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* Opciones de Precio */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Planes de Pago</h3>
                    {Object.entries(paymentPlans).map(([key, plan]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPaymentPlan(key)}
                        className={`w-full p-3 mb-3 rounded-lg border-2 transition-all ${
                          selectedPaymentPlan === key
                            ? "border-[#1B3C53] bg-[#1B3C53] text-white"
                            : "border-gray-300 bg-white hover:border-[#456882] text-gray-800"
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-bold text-lg">{plan.label}</div>
                          <div className={`text-sm font-semibold ${selectedPaymentPlan === key ? "text-white" : "text-gray-800"}`}>${plan.price} MXN</div>
                          <div className={`text-xs ${selectedPaymentPlan === key ? "text-white opacity-75" : "text-gray-600"}`}>(${plan.usd} USD)</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Método de Pago */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Método de Pago</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                          paymentMethod === "card" ? "border-[#1B3C53] bg-[#1B3C53] text-white" : "border-gray-300 bg-white hover:border-[#456882] text-gray-700"
                        }`}
                      >
                        <CreditCard className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">Tarjeta</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                          paymentMethod === "paypal" ? "border-[#1B3C53] bg-[#1B3C53] text-white" : "border-gray-300 bg-white hover:border-[#456882] text-gray-700"
                        }`}
                      >
                        <Wallet className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">PayPal</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("apple")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                          paymentMethod === "apple" ? "border-[#1B3C53] bg-[#1B3C53] text-white" : "border-gray-300 bg-white hover:border-[#456882] text-gray-700"
                        }`}
                      >
                        <Smartphone className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">Apple Pay</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("oxxo")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                          paymentMethod === "oxxo" ? "border-[#1B3C53] bg-[#1B3C53] text-white" : "border-gray-300 bg-white hover:border-[#456882] text-gray-700"
                        }`}
                      >
                        <ShoppingBag className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">Oxxo</span>
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-br from-[#1B3C53] to-[#456882] text-white p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-4">Resumen</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Plan {paymentPlans[selectedPaymentPlan as keyof typeof paymentPlans].label}</span>
                        <span>${getTotalPrice()} MXN</span>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${getTotalPrice()} MXN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nota importante */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Nota:</p>
                      <p className="text-sm text-yellow-700">
                        Aunque se denomine "ilimitado", existe un límite de 100 productos activos por persona o empresa. Para más productos, contacta soporte.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario de Pago */}
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Información Personal</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Nombre</Label>
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
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Apellido</Label>
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
                          <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">Número de Tarjeta</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">Fecha de Expiración</Label>
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
                            <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">CVV</Label>
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
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Dirección</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Calle Principal 123"
                        className="mt-1 h-8 text-card-foreground placeholder:text-card-foreground/60"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ciudad</Label>
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
                        <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">Código Postal</Label>
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
                </div>

                {/* Botón de Pago */}
                <Button
                  className="w-full mt-4 bg-[#1B3C53] hover:bg-[#456882] text-white font-semibold h-11"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Procesando suscripción..."
                    : paymentMethod === "oxxo"
                      ? `Generar código Oxxo - $${getTotalPrice()} MXN`
                      : `Pagar $${getTotalPrice()} MXN`}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}