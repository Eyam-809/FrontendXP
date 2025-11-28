"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Smartphone, Wallet, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { ApiUrl } from "@/lib/config"
import { useNotification } from "@/components/ui/notification"
import Navbar from "@/components/navbar"
import MobileNavbar from "@/components/mobile/mobile-navbar"
import { useIsMobile } from "@/hooks/use-mobile"
import Footer from "@/components/footer"

// Stripe
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import axios from "axios"

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

  // Guardar clave pública de Stripe en localStorage (igual que el modal)
  useEffect(() => {
    try {
      const publishedKey =
        "pk_test_51SW6ScRLm0Qi3fncQzMnCEve8TRhXnd2JOzdhRmaXlz3WC6NZ6a4dPqu5fkE0ZdD3uotXJ4V2sVlkVJD2Qw4jpfY00jLgCxI6y"
      if (!localStorage.getItem("stripe_publishable_key")) {
        localStorage.setItem("stripe_publishable_key", publishedKey)
      }
    } catch (e) {
      console.warn("No se pudo guardar la clave pública de Stripe en localStorage", e)
    }
  }, [])

  const stripeKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_STRIPE_KEY ||
        localStorage.getItem("stripe_publishable_key") ||
        ""
      : ""
  const stripePromise = stripeKey ? loadStripe(stripeKey) : null

  useEffect(() => {
    if (state.cart.length === 0) {
      router.push("/")
      showNotification("Tu carrito está vacío", "warning")
    }
  }, [state.cart.length, router, showNotification])

  const getTotalPrice = () => {
    return state.cart.reduce((total, item) => {
      const price =
        item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
      return total + price * item.quantity
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // === PayPal (mismo flujo que el modal) ===
  const handlePayPal = async () => {
    setIsProcessing(true)

    try {
      const userFromState = (state as any).user
      let user = userFromState
      if (!user) {
        const stored =
          localStorage.getItem("user") ||
          localStorage.getItem("userData") ||
          localStorage.getItem("userInfo")
        user = stored ? JSON.parse(stored) : null
      }
      const userId = user?.id

      if (!userId) {
        showNotification("Por favor inicia sesión para completar la compra", "warning")
        setIsProcessing(false)
        return null
      }

      if (state.cart.length === 0) {
        showNotification("El carrito está vacío", "warning")
        setIsProcessing(false)
        return null
      }

      const productos = state.cart.map((item: any) => ({
        producto_id: item.id,
        tipo: item.tipo ?? "venta",
        cantidad: item.quantity,
        precio_unitario:
          item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price,
      }))

      const payloadCompra: any = {
        user_id: userId,
        fecha_pago: new Date().toISOString().split("T")[0],
        total: getTotalPrice(),
        direccion_envio:
          paymentMethod === "paypal" ? "PayPal" : formData.address,
        telefono_contacto: user?.phone || "",
        tipo: productos[0]?.tipo ?? "venta",
        metodo_pago: "paypal",
        productos,
      }

      const tokenAuth = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {}),
      }

      // Crear compra
      const createRes = await fetch(
        `${ApiUrl.replace(/\/$/, "")}/api/compras`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payloadCompra),
        }
      )

      const createJson: any = await (async () => {
        try {
          return await createRes.json()
        } catch {
          return null
        }
      })()

      if (!createRes.ok) {
        const err =
          createJson?.message ||
          (createJson?.errors &&
            (Object.values(createJson.errors).flat() as any)[0]) ||
          `Error ${createRes.status} creando compra`
        showNotification(err, "error")
        console.error("Error creando compra antes de PayPal:", createRes.status, createJson)
        setIsProcessing(false)
        return null
      }

      const createdCompra = createJson?.compra ?? createJson?.data ?? createJson
      const compraId = createdCompra?.id ?? createdCompra?.compra_id ?? null
      const compraTotal = createdCompra?.total ?? getTotalPrice()

      if (!compraId) {
        showNotification("No se obtuvo el ID de la compra del backend.", "error")
        console.error("Respuesta creación compra inválida:", createJson)
        setIsProcessing(false)
        return null
      }

      const paypalEndpoints = [
        `${ApiUrl.replace(/\/$/, "")}/api/paypal/pay`,
        `${ApiUrl.replace(/\/$/, "")}/paypal/pay`,
        `${ApiUrl.replace(/\/$/, "")}/api/paypal/create`,
        `${ApiUrl.replace(/\/$/, "")}/paypal/create`,
      ]

      const body = {
        compra_id: compraId,
        amount: Number(Number(compraTotal).toFixed(2)),
        currency: "MXN",
        description: `Compra #${compraId} - XPMarket`,
        user_id: userId,
        id_user: userId,
      }

      for (const url of paypalEndpoints) {
        try {
          console.log("PayPal POST ->", url, body)
          const resp = await axios.post(url, body, {
            headers,
            validateStatus: () => true,
          })
          console.log("PayPal response", url, resp.status, resp.data)

          if (
            (resp.status === 200 || resp.status === 201) &&
            resp.data?.approval_url
          ) {
            const approval = resp.data.approval_url
            setIsProcessing(false)
            window.location.href = approval
            return approval
          }

          if (resp.data && typeof resp.data === "object" && resp.data.approval_url) {
            const approval = resp.data.approval_url
            setIsProcessing(false)
            window.location.href = approval
            return approval
          }

          const params = new URLSearchParams()
          params.set("compra_id", String(compraId))
          params.set("amount", body.amount.toFixed(2))
          params.set("currency", body.currency)
          params.set("description", body.description)
          params.set("user_id", String(userId))
          params.set("id_user", String(userId))
          if (tokenAuth) params.set("token", tokenAuth)
          const urlWithParams = `${url}${
            url.includes("?") ? "&" : "?"
          }${params.toString()}`

          try {
            const getRes = await axios.get(urlWithParams, {
              headers,
              validateStatus: () => true,
            })
            console.log(
              "PayPal GET response:",
              urlWithParams,
              getRes.status,
              getRes.data
            )
            if (
              (getRes.status === 200 || getRes.status === 201) &&
              getRes.data?.approval_url
            ) {
              setIsProcessing(false)
              window.location.href = getRes.data.approval_url
              return getRes.data.approval_url
            }
            // @ts-ignore
            const finalUrl = getRes.request?.responseURL
            if (finalUrl && /paypal\.com/i.test(finalUrl)) {
              setIsProcessing(false)
              window.location.href = finalUrl
              return finalUrl
            }
          } catch (errGet: any) {
            console.warn("GET fallback falló:", errGet)
          }
        } catch (err: any) {
          console.warn("Error conectando a", url, err?.message || err)
          continue
        }
      }

      showNotification(
        "No se pudo iniciar PayPal. Revisa ruta backend y CORS.",
        "error"
      )
      setIsProcessing(false)
      return null
    } catch (err: any) {
      console.error("Error handlePayPal:", err)
      showNotification("Error iniciando PayPal", "error")
      setIsProcessing(false)
      return null
    }
  }

  // === Pago general (Stripe + Oxxo + Apple, mismo flujo que el modal) ===
  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const userFromState = (state as any).user
      let user = userFromState
      if (!user) {
        const stored =
          localStorage.getItem("user") ||
          localStorage.getItem("userData") ||
          localStorage.getItem("userInfo")
        user = stored ? JSON.parse(stored) : null
      }

      const userId = user?.id
      const phone = user?.phone || ""
      const userEmail = formData.email || user?.email || ""

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
        precio_unitario:
          item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price,
      }))

      let stripeChargeData: any = null

      if (paymentMethod === "card") {
        // Usar Stripe Elements expuestos en window (igual que el modal)
        // @ts-ignore
        const stripeWin = (window as any).__stripe_instance
        // @ts-ignore
        const elementsWin = (window as any).__stripe_elements
        if (!stripeWin || !elementsWin) {
          showNotification(
            "No se pudo inicializar Stripe Elements. Asegúrate de que el formulario de tarjeta esté visible.",
            "error"
          )
          setIsProcessing(false)
          return
        }

        const cardEl = elementsWin.getElement(CardNumberElement)
        // @ts-ignore
        const cardReady = (window as any).__card_ready
        if (!cardEl || !cardReady) {
          showNotification("Completa los datos de la tarjeta en el formulario.", "warning")
          setIsProcessing(false)
          return
        }

        const tokenResult: any = await stripeWin.createToken(cardEl)
        if (tokenResult.error) {
          console.error("Stripe token error:", tokenResult.error)
          showNotification(
            tokenResult.error.message || "Error creando token de tarjeta",
            "error"
          )
          setIsProcessing(false)
          return
        }

        const token = tokenResult.token?.id ?? tokenResult.id
        if (!token) {
          showNotification("No se obtuvo token de Stripe", "error")
          setIsProcessing(false)
          return
        }

        const tokenAuth = localStorage.getItem("token")

        const payloadCompra = {
          user_id: userId,
          fecha_pago: new Date().toISOString().split("T")[0],
          total: getTotalPrice(),
          direccion_envio: formData.address,
          telefono_contacto: phone,
          tipo: productos[0]?.tipo ?? "venta",
          metodo_pago: paymentMethod,
          productos,
        }

        // 1) Crear compra
        const createRes = await fetch(`${ApiUrl}/api/compras`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {}),
          },
          body: JSON.stringify(payloadCompra),
        })

        const createJson: any = await (async () => {
          try {
            return await createRes.json()
          } catch {
            return null
          }
        })()

        if (!createRes.ok) {
          const errMsg =
            createJson?.message ||
            `Error ${createRes.status} creando compra`
          showNotification(errMsg, "error")
          console.error(
            "Error creando compra antes de cobrar:",
            createRes.status,
            createJson
          )
          setIsProcessing(false)
          return
        }

        const createdCompra = createJson?.compra ?? createJson?.data ?? createJson
        if (!createdCompra) {
          console.error("Respuesta inválida al crear compra:", createJson)
          showNotification(
            "Respuesta inválida del backend al crear la compra.",
            "error"
          )
          setIsProcessing(false)
          return
        }

        try {
          const compraId =
            createdCompra?.id ??
            createdCompra?.compra_id ??
            createdCompra?.data?.id ??
            null

          const compraTotal =
            createdCompra?.total ?? createJson?.total ?? getTotalPrice()

          if (!compraId) {
            console.error(
              "No se encontró compra id en la respuesta de creación:",
              createJson
            )
            showNotification(
              "No se encontró compra_id en la respuesta del backend. Revisa la API.",
              "error"
            )
            setIsProcessing(false)
            return
          }

          const chargeRes = await fetch(
            `${ApiUrl.replace(/\/$/, "")}/api/stripe/charge`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {}),
              },
              body: JSON.stringify({
                token,
                amount: compraTotal,
                email: userEmail,
                compra_id: compraId,
              }),
            }
          )

          let chargeBody: any = null
          try {
            chargeBody = await chargeRes.json()
          } catch {
            chargeBody = null
          }

          if (!chargeRes.ok) {
            const msg =
              chargeBody?.message ||
              (typeof chargeBody === "string"
                ? chargeBody
                : `Error ${chargeRes.status}`)
            showNotification(msg, "error")
            console.error("Error cobrando compra:", chargeRes.status, chargeBody)
            setIsProcessing(false)
            return
          }

          stripeChargeData = chargeBody?.data ?? chargeBody

          dispatch({ type: "CLEAR_CART" })
          showNotification("Compra realizada con éxito 🎉", "success")
          setIsProcessing(false)
          router.push("/")
          return
        } catch (err) {
          console.error("Error en request de cobro:", err)
          showNotification("Error al conectar con el endpoint de cobro", "error")
          setIsProcessing(false)
          return
        }
      }

      // Para métodos distintos de tarjeta (oxxo, apple, etc.) se crea solo la compra
      const payload: any = {
        user_id: userId,
        fecha_pago: new Date().toISOString().split("T")[0],
        total: getTotalPrice(),
        direccion_envio: formData.address,
        telefono_contacto: phone,
        tipo: productos[0]?.tipo ?? "venta",
        metodo_pago: paymentMethod,
        productos,
        stripe_charge: stripeChargeData ? { raw: stripeChargeData } : undefined,
      }

      const tokenAuth = localStorage.getItem("token")
      const res = await fetch(`${ApiUrl}/api/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let body: any = null
        try {
          body = await res.json()
        } catch {
          body = await res.text().catch(() => null)
        }
        console.error("Error crear compra:", res.status, body)
        const firstError =
          body?.message ||
          (body?.errors && (Object.values(body.errors).flat() as any)[0]) ||
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
          {/* Resumen */}
          <div className={`${isMobile ? "order-2" : "lg:order-1"} bg-white rounded-xl shadow-lg border border-[#E8DDD4] p-6 h-fit`}>
            <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-[#1B3C53] mb-4`}>
              Resumen del Pedido
            </h3>
            <div className="space-y-3 mb-4">
              {state.cart.map((item) => {
                const finalPrice =
                  item.discount > 0
                    ? item.price * (1 - item.discount / 100)
                    : item.price
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-[#F9F3EF] p-3 rounded-lg border border-[#E8DDD4]"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className={`${
                        isMobile ? "w-16 h-16" : "w-20 h-20"
                      } object-contain rounded-lg border border-[#E8DDD4]`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${
                          isMobile ? "text-sm" : "text-base"
                        } font-semibold text-[#1B3C53] truncate`}
                      >
                        {item.name}
                      </p>
                      <p
                        className={`${
                          isMobile ? "text-xs" : "text-sm"
                        } text-[#456882]`}
                      >
                        Cantidad: {item.quantity}
                      </p>
                      <p
                        className={`${
                          isMobile ? "text-base" : "text-lg"
                        } font-bold text-[#1B3C53] mt-1`}
                      >
                        ${(finalPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t-2 border-[#E8DDD4] pt-4 bg-gradient-to-r from-[#E8DDD4] to-[#F9F3EF] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span
                  className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } font-bold text-[#1B3C53]`}
                >
                  Total:
                </span>
                <span
                  className={`${
                    isMobile ? "text-2xl" : "text-3xl"
                  } font-extrabold text-[#1B3C53]`}
                >
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div
            className={`${
              isMobile ? "order-1" : "lg:col-span-2 lg:order-2"
            } space-y-6`}
          >
            {/* Métodos */}
            <div className="bg-white rounded-xl shadow-lg border border-[#E8DDD4] p-6">
              <h3
                className={`${
                  isMobile ? "text-lg" : "text-xl"
                } font-bold text-[#1B3C53] mb-4`}
              >
                Método de Pago
              </h3>
              <div
                className={`grid ${
                  isMobile ? "grid-cols-2" : "grid-cols-4"
                } gap-3`}
              >
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "card"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <CreditCard
                    className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`}
                  />
                  <span
                    className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}
                  >
                    Tarjeta
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "paypal"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <Wallet
                    className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`}
                  />
                  <span
                    className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}
                  >
                    PayPal
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod("apple")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "apple"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <Smartphone
                    className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`}
                  />
                  <span
                    className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}
                  >
                    Apple Pay
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod("oxxo")}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                    paymentMethod === "oxxo"
                      ? "border-[#1B3C53] bg-[#1B3C53] text-white shadow-lg"
                      : "border-[#E8DDD4] hover:border-[#456882] text-[#1B3C53] bg-[#F9F3EF]"
                  }`}
                >
                  <ShoppingBag
                    className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} mb-2`}
                  />
                  <span
                    className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}
                  >
                    Oxxo
                  </span>
                </button>
              </div>
            </div>

            {/* Info pago */}
            <div className="bg-white rounded-xl shadow-lg border border-[#E8DDD4] p-6">
              {paymentMethod === "paypal" ? (
                // ===== Vista PayPal (igual que el modal pero con tu diseño) =====
                <div className="flex flex-col items-center justify-center space-y-4">
                  <h3
                    className={`${
                      isMobile ? "text-lg" : "text-xl"
                    } font-bold text-[#1B3C53] mb-2`}
                  >
                    Pago con PayPal
                  </h3>
                  <p className="text-sm text-[#456882] text-center mb-2">
                    Serás redirigido a PayPal para completar tu pago de{" "}
                    <span className="font-bold">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </p>
                  <Button
                    className={`${isMobile ? "h-14 text-base" : "h-16 text-lg"} w-full bg-[#1B3C53] hover:bg-[#456882] text-white font-extrabold rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                    onClick={async (e) => {
                      e.preventDefault()
                      try {
                        await handlePayPal()
                      } catch (err) {
                        console.error("Error iniciando PayPal:", err)
                        showNotification("Error iniciando PayPal", "error")
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Redirigiendo a PayPal..."
                      : "Pagar con PayPal"}
                  </Button>
                </div>
              ) : (
                // ===== Vista normal (tarjeta / oxxo / apple) =====
                <>
                  <h3
                    className={`${
                      isMobile ? "text-lg" : "text-xl"
                    } font-bold text-[#1B3C53] mb-4`}
                  >
                    Información de Pago
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-[#1B3C53] font-semibold mb-2 block"
                      >
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

                    <div
                      className={`grid ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      } gap-4`}
                    >
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-[#1B3C53] font-semibold mb-2 block"
                        >
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
                        <Label
                          htmlFor="lastName"
                          className="text-[#1B3C53] font-semibold mb-2 block"
                        >
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

                    {/* Stripe CardInput igual que en el modal */}
                    {paymentMethod === "card" && (
                      <>
                        {stripePromise ? (
                          <div className="space-y-3">
                            <Label className="text-[#1B3C53] font-semibold mb-2 block">
                              Datos de Tarjeta
                            </Label>
                            <div className="border border-[#E8DDD4] rounded-xl p-3 bg-white">
                              <Elements stripe={stripePromise}>
                                <CardInput />
                              </Elements>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-500">
                            Clave pública de Stripe no disponible
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <Label
                        htmlFor="address"
                        className="text-[#1B3C53] font-semibold mb-2 block"
                      >
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

                    <div
                      className={`grid ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      } gap-4`}
                    >
                      <div>
                        <Label
                          htmlFor="city"
                          className="text-[#1B3C53] font-semibold mb-2 block"
                        >
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
                        <Label
                          htmlFor="zipCode"
                          className="text-[#1B3C53] font-semibold mb-2 block"
                        >
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
                    className={`${
                      isMobile ? "h-14 text-base mt-6" : "h-16 text-lg mt-8"
                    } w-full bg-gradient-to-r from-[#1B3C53] via-[#456882] to-[#1B3C53] hover:from-[#456882] hover:via-[#1B3C53] hover:to-[#456882] text-white font-extrabold rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Procesando Pago..."
                      : paymentMethod === "oxxo"
                      ? `Generar código para Oxxo - $${getTotalPrice().toFixed(2)}`
                      : `Pagar $${getTotalPrice().toFixed(2)}`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// === CardInput igualito al del modal ===
function CardInput() {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [numComplete, setNumComplete] = useState(false)
  const [expComplete, setExpComplete] = useState(false)
  const [cvcComplete, setCvcComplete] = useState(false)

  React.useEffect(() => {
    // @ts-ignore
    window.__stripe_instance = stripe
    // @ts-ignore
    window.__stripe_elements = elements
    // @ts-ignore
    window.__card_ready = false
    return () => {
      try {
        // @ts-ignore
        delete window.__stripe_instance
        // @ts-ignore
        delete window.__stripe_elements
        // @ts-ignore
        delete window.__card_ready
      } catch {}
    }
  }, [stripe, elements])

  React.useEffect(() => {
    const ready = !!(numComplete && expComplete && cvcComplete && !error)
    // @ts-ignore
    window.__card_ready = ready
  }, [numComplete, expComplete, cvcComplete, error])

  const handleNumberChange = (e: any) => {
    setError(e.error ? e.error.message : null)
    setNumComplete(!!e.complete && !e.error)
  }
  const handleExpiryChange = (e: any) => {
    setError(e.error ? e.error.message : null)
    setExpComplete(!!e.complete && !e.error)
  }
  const handleCvcChange = (e: any) => {
    setError(e.error ? e.error.message : null)
    setCvcComplete(!!e.complete && !e.error)
  }

  const elementOptions = {
    style: {
      base: {
        color: "#333",
        fontSize: "16px",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        "::placeholder": { color: "#aaa" },
      },
      invalid: { color: "#fa755a" },
    },
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-[#1B3C53] mb-1">
          Número de tarjeta
        </label>
        <div className="p-2 border rounded-lg bg-white border-[#E8DDD4]">
          <CardNumberElement options={elementOptions} onChange={handleNumberChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-[#1B3C53] mb-1">
            Expiración
          </label>
          <div className="p-2 border rounded-lg bg-white border-[#E8DDD4]">
            <CardExpiryElement options={elementOptions} onChange={handleExpiryChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-[#1B3C53] mb-1">CVC</label>
          <div className="p-2 border rounded-lg bg-white border-[#E8DDD4]">
            <CardCvcElement options={elementOptions} onChange={handleCvcChange} />
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  )
}
