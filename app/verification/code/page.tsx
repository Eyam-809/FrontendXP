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
  const method = searchParams.get("method") || "whatsapp"
  const [verificationCode, setVerificationCode] = useState("778 - 804")

  useEffect(() => {
    // Generar un código de verificación aleatorio
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
    // Por ahora, redirigimos al dashboard
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
                Ingresa este código de verificación en tu teléfono nuevo. Por favor, no lo compartas con nadie. Si no solicitaste un código, puedes ignorar este mensaje.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-4 tracking-wider">
                {verificationCode}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-medium"
              >
                Continuar
              </Button>

              <Button
                onClick={() => {
                  // Generar nuevo código
                  const generateCode = () => {
                    const code = Math.floor(100000 + Math.random() * 900000)
                    return `${code.toString().slice(0, 3)} - ${code.toString().slice(3)}`
                  }
                  setVerificationCode(generateCode())
                }}
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
