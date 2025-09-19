"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Phone, MessageCircle, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerificationPage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    if (option === "whatsapp") {
      // Redirigir a la página de código de verificación
      router.push("/verification/code?method=whatsapp")
    } else if (option === "call") {
      // Redirigir a la página de código de verificación
      router.push("/verification/code?method=call")
    }
  }

  const handleClose = () => {
    router.push("/login")
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
                Opciones de verificación
              </CardTitle>
              <p className="text-gray-600 text-sm">
                ¿Cómo deseas obtener el código?
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <Button
              onClick={() => handleOptionSelect("whatsapp")}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl flex items-center justify-center space-x-3"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">ENVIAR SMS</span>
            </Button>

            <Button
              onClick={() => handleOptionSelect("call")}
              variant="outline"
              className="w-full h-12 rounded-xl flex items-center justify-center space-x-3 border-2 hover:bg-gray-50"
            >
              <Phone className="w-5 h-5" />
              <span className="font-medium">LLÁMAME</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
