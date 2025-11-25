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
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js"
import axios from "axios"

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

  // Guardar la clave pública de Stripe en localStorage para que la use el flujo de pago
  React.useEffect(() => {
    try {
      const publishedKey = "pk_test_51SW6ScRLm0Qi3fncQzMnCEve8TRhXnd2JOzdhRmaXlz3WC6NZ6a4dPqu5fkE0ZdD3uotXJ4V2sVlkVJD2Qw4jpfY00jLgCxI6y"
      // solo setear si no existe para evitar sobrescribir
      if (!localStorage.getItem("stripe_publishable_key")) {
        localStorage.setItem("stripe_publishable_key", publishedKey)
      }
    } catch (e) {
      // silencioso en caso de error de acceso a localStorage
      console.warn("No se pudo guardar la clave pública de Stripe en localStorage", e)
    }
  }, [])

  const stripeKey = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_STRIPE_KEY || localStorage.getItem("stripe_publishable_key") || "")
    : ""
  const stripePromise = stripeKey ? loadStripe(stripeKey) : null

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

  const handleCvvChange = (e) => {
    let value = e.target.value;

    // Solo números
    value = value.replace(/\D/g, "");

    // Limite de 4 (por si un día aceptas AMEX)
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    setFormData({
      ...formData,
      cvv: value,
    });
  };
  const handleCardNumberChange = (e) => {
    let value = e.target.value;

    // Solo números
    value = value.replace(/\D/g, "");

    // Agrupar cada 4 dígitos
    value = value.replace(/(.{4})/g, "$1 ").trim();

    // No permitir más de 19 chars (16 números + 3 espacios)
    if (value.length > 19) {
      value = value.slice(0, 19);
    }

    setFormData({
      ...formData,
      cardNumber: value,
    });
  };
  const handleExpiryChange = (e) => {
    let value = e.target.value;

    // Solo permitir números
    value = value.replace(/[^\d]/g, "");

    // Insertar la diagonal después de 2 dígitos
    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }

    // Limitar a 5 caracteres totales
    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    setFormData({
      ...formData,
      expiryDate: value,
    });
  };

  const handlePayPal = async () => {
    setIsProcessing(true)

    try {
      // 1) Obtener usuario
      const userFromState = (state as any).user
      let user = userFromState
      if (!user) {
        const stored = localStorage.getItem("user") || localStorage.getItem("userData") || localStorage.getItem("userInfo")
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

      // 2) Preparar productos y payload de compra
      const productos = state.cart.map((item: any) => ({
        producto_id: item.id,
        tipo: item.tipo ?? "venta",
        cantidad: item.quantity,
        precio_unitario: item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price,
      }))

      const payloadCompra: any = {
        user_id: userId,
        fecha_pago: new Date().toISOString().split("T")[0],
        total: getTotalPrice(),
        direccion_envio: paymentMethod === "paypal" ? "PayPal" : formData.address,
        telefono_contacto: user?.phone || "",
        tipo: productos[0]?.tipo ?? "venta",
        metodo_pago: "paypal",
        productos,
      }

      const tokenAuth = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {})
      }

      // 3) Crear la compra en el backend
      const createRes = await fetch(`${ApiUrl.replace(/\/$/, "")}/api/compras`, {
        method: "POST",
        headers,
        body: JSON.stringify(payloadCompra),
      })

      const createJson: any = await (async () => { try { return await createRes.json() } catch { return null } })()

      if (!createRes.ok) {
        const err = createJson?.message || (createJson?.errors && Object.values(createJson.errors).flat()[0]) || `Error ${createRes.status} creando compra`
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

      // 4) Llamar a PayPal pasando compra_id, amount e id_user
      const paypalEndpoints = [
        `${ApiUrl.replace(/\/$/, "")}/api/paypal/pay`,
        `${ApiUrl.replace(/\/$/, "")}/paypal/pay`,
        `${ApiUrl.replace(/\/$/, "")}/api/paypal/create`,
        `${ApiUrl.replace(/\/$/, "")}/paypal/create`
      ]

      const body = {
        compra_id: compraId,
        amount: Number(Number(compraTotal).toFixed(2)),
        currency: "MXN",
        description: `Compra #${compraId} - XPMarket`,
        user_id: userId,
        id_user: userId
      }

      for (const url of paypalEndpoints) {
        try {
          console.log("PayPal POST ->", url, body)
          const resp = await axios.post(url, body, { headers, validateStatus: () => true })
          console.log("PayPal response", url, resp.status, resp.data)

          // Si backend devuelve approval_url -> redirigir a PayPal (misma pestaña)
          if ((resp.status === 200 || resp.status === 201) && resp.data?.approval_url) {
            const approval = resp.data.approval_url
            setIsProcessing(false)
            // redirigir directamente a la URL de PayPal
            window.location.href = approval
            return approval
          }

          // Si backend devuelve JSON con approval_url anidado (o devolvió objeto), intentar extraerlo
          if (resp.data && typeof resp.data === "object" && resp.data.approval_url) {
            const approval = resp.data.approval_url
            setIsProcessing(false)
            window.location.href = approval
            return approval
          }

          // Fallback: backend no devolvió approval_url en POST -> construir URL con query y hacer GET para intentar obtener approval_url
          const params = new URLSearchParams()
          params.set("compra_id", String(compraId))
          params.set("amount", body.amount.toFixed(2))
          params.set("currency", body.currency)
          params.set("description", body.description)
          params.set("user_id", String(userId))
          params.set("id_user", String(userId))
          if (tokenAuth) params.set("token", tokenAuth)
          const urlWithParams = `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`

          try {
            const getRes = await axios.get(urlWithParams, { headers, validateStatus: () => true })
            console.log("PayPal GET response:", urlWithParams, getRes.status, getRes.data)
            if ((getRes.status === 200 || getRes.status === 201) && getRes.data?.approval_url) {
              setIsProcessing(false)
              window.location.href = getRes.data.approval_url
              return getRes.data.approval_url
            }
            // Si el servidor respondió con una redirección final hacia PayPal, usar responseURL
            // @ts-ignore
            const finalUrl = getRes.request?.responseURL
            if (finalUrl && /paypal\.com/i.test(finalUrl)) {
              setIsProcessing(false)
              window.location.href = finalUrl
              return finalUrl
            }
          } catch (errGet: any) {
            console.warn("GET fallback falló:", errGet)
            // continuar con next endpoint
          }

        } catch (err: any) {
          console.warn("Error conectando a", url, err?.message || err)
          continue
        }
      }

      showNotification("No se pudo iniciar PayPal. Revisa ruta backend y CORS.", "error")
      setIsProcessing(false)
      return null

    } catch (err: any) {
      console.error("Error handlePayPal:", err)
      showNotification("Error iniciando PayPal", "error")
      setIsProcessing(false)
      return null
    }
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

      // Preparar productos según lo que espera el backend
      const productos = state.cart.map((item: any) => ({
        producto_id: item.id,
        tipo: item.tipo ?? "venta",
        cantidad: item.quantity,
        precio_unitario: item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price,
      }))

      // Si el método es tarjeta, generar token Stripe con los datos del mismo formulario
      let stripeChargeData: any = null
      if (paymentMethod === "card") {
        // Usar Stripe Elements montado (CardElement) para crear token seguro sin enviar datos crudos
        // Tomamos stripe/elements expuestos por el componente CardInput (se asignan a window.__stripe_instance / __stripe_elements)
        // @ts-ignore
        
        const stripeWin = (window as any).__stripe_instance
        // @ts-ignore
        const elementsWin = (window as any).__stripe_elements
        if (!stripeWin || !elementsWin) {
          showNotification("No se pudo inicializar Stripe Elements. Asegúrate de que el formulario de tarjeta esté visible.", "error")
          setIsProcessing(false)
          return
        }
        // usar CardNumberElement porque montamos elementos separados
        const cardEl = elementsWin.getElement(CardNumberElement)
        console.log("cardEl:", !!cardEl, "cardReady:", (window as any).__card_ready)
        // Comprobación adicional si el usuario no completó los datos del CardElement
        // (CardElement manejará validaciones; aquí solo avisamos si no está listo)
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
          showNotification(tokenResult.error.message || "Error creando token de tarjeta", "error")
          setIsProcessing(false)
          return
        }
        const token = tokenResult.token?.id ?? tokenResult.id
        if (!token) {
          showNotification("No se obtuvo token de Stripe", "error")
          setIsProcessing(false)
          return
        }

        // Enviar token al backend para cobrar
        // Intentar varias URLs (algunas apps ponen la ruta en /api/stripe/charge)
        // --------------------------------------------------------
        // Nuevo flujo: crear la compra primero y luego cobrarla
        // --------------------------------------------------------
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

        // 1) Crear la compra en el backend
        const createRes = await fetch(`${ApiUrl}/api/compras`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {})
          },
          body: JSON.stringify(payloadCompra)
        })

        const createJson: any = await (async () => { try { return await createRes.json() } catch { return null } })()

        if (!createRes.ok) {
          const errMsg = createJson?.message || `Error ${createRes.status} creando compra`
          showNotification(errMsg, "error")
          console.error("Error creando compra antes de cobrar:", createRes.status, createJson)
          setIsProcessing(false)
          return
        }

        // Normalizar respuesta: la API devuelve { compra: { ... } } según CompraController
        const createdCompra = createJson?.compra ?? createJson?.data ?? createJson
        if (!createdCompra) {
          console.error("Respuesta inválida al crear compra:", createJson)
          showNotification("Respuesta inválida del backend al crear la compra.", "error")
          setIsProcessing(false)
          return
        }

        // 2) Cobrar con Stripe usando el total devuelto por el backend
        try {
          // obtener compra id y total desde createdCompra
          const compraId =
            createdCompra?.id ??
            createdCompra?.compra_id ??
            createdCompra?.data?.id ??
            null

          const compraTotal =
            createdCompra?.total ??
            createJson?.total ??
            getTotalPrice()

          if (!compraId) {
            console.error("No se encontró compra id en la respuesta de creación:", createJson)
            showNotification("No se encontró compra_id en la respuesta del backend. Revisa la API.", "error")
            setIsProcessing(false)
            return
          }

          const chargeRes = await fetch(`${ApiUrl.replace(/\/$/, "")}/api/stripe/charge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {})
            },
            body: JSON.stringify({
              token,
              amount: compraTotal,
              email: userEmail,
              compra_id: compraId
            })
          })

          let chargeBody: any = null
          try { chargeBody = await chargeRes.json() } catch { chargeBody = null }

          if (!chargeRes.ok) {
            const msg = chargeBody?.message || (typeof chargeBody === "string" ? chargeBody : `Error ${chargeRes.status}`)
            // Opcional: podrías intentar cancelar o marcar la compra como fallida en backend aquí
            showNotification(msg, "error")
            console.error("Error cobrando compra:", chargeRes.status, chargeBody)
            setIsProcessing(false)
            return
          }

          // Guardar respuesta de cobro para adjuntar si se requiere
          stripeChargeData = chargeBody?.data ?? chargeBody

          // Éxito: ya se creó la compra y se cobró — finalizar flujo
          dispatch({ type: "CLEAR_CART" })
          showNotification("Compra realizada con éxito 🎉", "success")
          handleClose()
          setIsProcessing(false)
          return
        } catch (err) {
          console.error("Error en request de cobro:", err)
          showNotification("Error al conectar con el endpoint de cobro", "error")
          setIsProcessing(false)
          return
        }
      }

      // Payload con los nombres que indicó el backend (añadir referencia de Stripe si existe)
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

      console.log("Compra payload:", payload)

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
                  
                  {/* Selector de PayPal */}
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-2 border rounded-lg flex flex-col items-center transition-colors ${
                      paymentMethod === "paypal" ? "border-primary bg-primary/10" : "border-border hover:border-ring"
                    }`}
                  >
                    <Wallet className={`h-4 w-4 mb-1 ${paymentMethod === "paypal" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs ${paymentMethod === "paypal" ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      PayPal
                    </span>
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

              {/* Form Fields: si es PayPal solo mostrar botón de redirección, si no mostrar formulario normal */}
              <div className="bg-card p-3 rounded-lg border border-border">
                {paymentMethod === "paypal" ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h3 className="text-base font-semibold mb-2 text-card-foreground">Pago con PayPal</h3>
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
                      onClick={async (e) => {
                        e.preventDefault()
                        try {
                          await handlePayPal() // handlePayPal redirige por sí mismo
                        } catch (err) {
                          console.error("Error iniciando PayPal:", err)
                          showNotification("Error iniciando PayPal", "error")
                        }
                      }}
                    >
                      Pagar con PayPal
                    </button>
                    <div className="text-sm text-muted-foreground text-center">
                      Serás redirigido a PayPal para completar el pago.
                    </div>
                  </div>
                ) : (
                  <div>
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

                      {paymentMethod === "card" && stripePromise && (
                        <div className="space-y-2">
                          <Label className="text-card-foreground font-medium text-sm">Datos de Tarjeta</Label>
                          <Elements stripe={stripePromise}>
                            <CardInput />
                          </Elements>
                        </div>
                      )}
                      {paymentMethod === "card" && !stripePromise && (
                        <div className="text-sm text-warning">Clave pública de Stripe no disponible</div>
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

                    {/* El botón de pago original */}
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
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function CardInput() {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [numComplete, setNumComplete] = useState(false)
  const [expComplete, setExpComplete] = useState(false)
  const [cvcComplete, setCvcComplete] = useState(false)

  React.useEffect(() => {
    // exponer para que la función handlePayment pueda acceder a ellos
    // @ts-ignore
    window.__stripe_instance = stripe
    // @ts-ignore
    window.__stripe_elements = elements
    // inicializar flag
    // @ts-ignore
    window.__card_ready = false
    return () => {
      try {
        // limpiar al desmontar
        // @ts-ignore
        delete window.__stripe_instance
        // @ts-ignore
        delete window.__stripe_elements
        // @ts-ignore
        delete window.__card_ready
      } catch {}
    }
  }, [stripe, elements])

  // actualizar estado y flag global cuando cambian los elementos
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
        <label className="block text-sm text-card-foreground mb-1">Número de tarjeta</label>
        <div className="p-2 border rounded-lg bg-white">
          <CardNumberElement options={elementOptions} onChange={handleNumberChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-card-foreground mb-1">Expiración</label>
          <div className="p-2 border rounded-lg bg-white">
            <CardExpiryElement options={elementOptions} onChange={handleExpiryChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-card-foreground mb-1">CVC</label>
          <div className="p-2 border rounded-lg bg-white">
            <CardCvcElement options={elementOptions} onChange={handleCvcChange} />
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  )
}
