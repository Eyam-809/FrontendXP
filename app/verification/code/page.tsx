"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { X, Phone, MessageCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerificationCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // método seguro con estado, por si searchParams no está listo al inicio
  const [method, setMethod] = useState<"whatsapp" | "call">("whatsapp")
  const [verificationCode, setVerificationCode] = useState("778 - 804")

  useEffect(() => {
    // 🔐 leer el método de la URL de forma segura
    try {
      const m = searchParams?.get?.("method")
      if (m === "whatsapp" || m === "call") {
        setMethod(m)
      } else {
        setMethod("whatsapp")
      }
    } catch {
      setMethod("whatsapp")
    }
  }, [searchParams])

  useEffect(() => {
    // Generar un código de verificación aleatorio al montar
    const generateCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000)
      return `${code.toString().slice(0, 3)} - ${code.toString().slice(3)}`
    }
    setVerificationCode(generateCode())
  }, [])

  const handleClose = () => {
    router.push("/login")
  }

  const handleContinue = () => {
    // Aquí puedes agregar la lógica para verificar el código
    router.push("/")
  }

  const getMethodIcon = () => {
    if (method === "whatsapp") {
      return <MessageCircle className="w-4 h-4 text-white" />
    }
    return <Phone className="w-4 h-4 text-white" />
  }

  const getMethodText = () => {
    if (method === "whatsapp") {
      return "Código para WhatsApp"
    }
    return "Código para llamada"
  }

  const regenerateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000)
    setVerificationCode(`${code.toString().slice(0, 3)} - ${code.toString().slice(3)}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="relative bg-white p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  <Phone className="w-6 h-6 text-teal-500" />
                  <Phone className="w-4 h-4 text-teal-400 absolute -top-1 -right-1" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-teal-500 rounded-full"></div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-black mb-2">
                Código para el teléfono nuevo
              </CardTitle>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ingresa este código de verificación en tu teléfono nuevo. Por favor, no lo compartas con nadie. 
                Si no solicitaste un código, puedes ignorar este mensaje.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500">
                    {getMethodIcon()}
                  </span>
                  {getMethodText()}
                </span>
              </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-medium"
              >
                Continuar
              </Button>

              <Button
                onClick={regenerateCode}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 hover:bg-gray-50 flex items-center justify-center space-x-3"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Reenviar Código</span>
              </Button>

              <Button
                onClick={() => router.push("/verification")}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 hover:bg-gray-50"
              >
                Cambiar método
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
