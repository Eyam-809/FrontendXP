"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface UserData {
  name: string
  email: string
  avatar?: string
}

export default function XPmarketPlusPage() {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const gamingApps = [
    { name: "Steam", color: "bg-[#1B3C53]", icon: "🎮" },
    { name: "Epic", color: "bg-[#456882]", icon: "🎯" },
    { name: "Xbox", color: "bg-green-600", icon: "🎮" },
    { name: "PlayStation", color: "bg-[#1B3C53]", icon: "🎮" },
    { name: "Nintendo", color: "bg-[#E63946]", icon: "🎮" },
    { name: "Discord", color: "bg-purple-600", icon: "💬" },
    { name: "Twitch", color: "bg-purple-500", icon: "📺" },
    { name: "Spotify", color: "bg-green-500", icon: "🎵" },
    { name: "Netflix", color: "bg-[#E63946]", icon: "🎬" }
  ]

  const familyPlan = {
    title: "XPmarket+ Familia",
    price: "Free",
    monthlyPrice: "",
    badge: "El mejor plan para iniciar tus compras",
    features: [
      "Para una a seis personas",
      "Acceso a todas las plataformas de gaming",
      "Úsalo en PC, Mac, teléfonos y tabletas",
      "Hasta 6 TB de almacenamiento en la nube (1 TB por persona)",
      "Envíos gratis en todas las compras",
      "Descuentos exclusivos en tecnología y gaming",
      "Soporte prioritario 24/7",
      "Acceso anticipado a ofertas especiales"
    ]
  }

  const personalPlan = {
    title: "XPmarket+ Personal",
    price: "MXN$199.00/año",
    monthlyPrice: "MXN$1,199.99/mes",
    features: [
      "Para una persona",
      "Acceso a todas las plataformas de gaming",
      "Úsalo en PC, Mac, teléfonos y tabletas",
      "1 TB de almacenamiento en la nube",
      "Envíos gratis en compras superiores a $500",
      "Descuentos exclusivos en tecnología y gaming",
      "Soporte prioritario 24/7",
      "Acceso anticipado a ofertas especiales"
    ]
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
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/profile">
            <Button variant="outline" className="bg-[#E8DDD4] border-[#E8DDD4] hover:bg-[#F9F3EF] text-[#1B3C53]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">XPmarket+</h1>
            <p className="text-gray-600">Suscripción con beneficios en envíos, compras y ventas</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Family Plan */}
          <Card className="bg-white shadow-lg border-2 border-yellow-400 relative">
            {familyPlan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-medium">
                  {familyPlan.badge}
                </Badge>
              </div>
            )}
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
                <Button className="w-full bg-[#1B3C53] hover:bg-[#456882] text-[#F9F3EF]">
                  Iniciar ahora
                </Button>
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
          <Card className="bg-white shadow-lg border border-gray-200">
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
                <Button variant="outline" className="w-full border-[#1B3C53] text-[#1B3C53] hover:bg-[#F9F3EF]">
                  Comprar ahora
                </Button>
                <div className="text-center">
                  <Link href="#" className="text-[#1B3C53] hover:underline text-sm block">
                    O comprar por {personalPlan.monthlyPrice}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Benefits */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Beneficios Exclusivos XPmarket+
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Truck className="h-8 w-8 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Envíos Gratis</h3>
                </div>
                <p className="text-gray-600">Envíos gratuitos en todas tus compras sin mínimo de compra</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Gift className="h-8 w-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Descuentos Exclusivos</h3>
                </div>
                <p className="text-gray-600">Acceso a ofertas especiales y descuentos únicos en tecnología</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="h-8 w-8 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Acceso Anticipado</h3>
                </div>
                <p className="text-gray-600">Sé el primero en conocer nuevos productos y ofertas especiales</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 