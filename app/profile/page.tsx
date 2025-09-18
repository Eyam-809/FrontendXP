"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  CreditCard, 
  MapPin, 
  Crown,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const profileSections = [
    {
      id: "personal-info",
      title: "Tu información",
      description: "Nombre elegido y datos para identificarte.",
      icon: <User className="h-5 w-5" />,
      hasAlert: true,
      href: "/profile/personal-info"
    },
    {
      id: "account-data",
      title: "Datos de tu cuenta",
      description: "Datos que representan tus ultimos movimientos en tu cuenta.",
      icon: <User className="h-5 w-5" />,
      hasAlert: true,
      href: "/profile/datos-cuenta"
    },
    {
      id: "meli-plus",
      title: "XPmarket+",
      description: "Suscripción con beneficios en envíos, compras y ventas.",
      icon: <Crown className="h-5 w-5" />,
      hasAlert: false,
      href: "/profile/xpmarket-plus"
    },
    {
      id: "cards",
      title: "Tarjetas",
      description: "Tarjetas guardadas en tu cuenta.",
      icon: <CreditCard className="h-5 w-5" />,
      hasAlert: false,
      href: "/profile/tarjetas"
    },
    {
      id: "addresses",
      title: "Direcciones",
      description: "Direcciones guardadas en tu cuenta.",
      icon: <MapPin className="h-5 w-5" />,
      hasAlert: false,
      href: "/profile/direcciones"
    },
    {
      id: "security",
      title: "Seguridad",
      description: "Configura tu contraseña y opciones de seguridad.",
      icon: <AlertTriangle className="h-5 w-5" />,
      hasAlert: false,
      href: "/profile/security"
    }
  ]

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileSections.map((section) => (
            <Link key={section.id} href={section.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer bg-white border-[#E8DDD4]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#E8DDD4] rounded-lg">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-[#1B3C53]">
                          {section.title}
                        </CardTitle>
                      </div>
                    </div>
                    {section.hasAlert && (
                      <Badge variant="destructive" className="bg-[#E63946] hover:bg-[#D62828]">
                        <AlertTriangle className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm text-[#456882]">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
          <p className="text-[#456882] text-sm">
            Puedes{" "}
            <button className="text-[#1B3C53] font-medium hover:underline">
              cancelar tu cuenta
            </button>{" "}
            siempre que lo desees.
          </p>
        </div>
      </div>
    </div>
  )
}