"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Gift,
  Copy,
  CheckCircle,
  Clock,
  Star,
  ShoppingBag,
  Truck,
  Package,
  Crown,
  Coins
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/app-context"

interface Coupon {
  id: number
  coupon_type: string
  coupon_name: string
  description: string
  points_spent: number
  coupon_code: string
  is_used: boolean
  used_at: string | null
  discount_amount: number | null
  discount_percentage: number | null
  created_at: string
}

export default function CouponsPage() {
  const { state } = useApp()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!state.userSession?.user_id) {
        setLoading(false)
        return
      }
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8000/api/points/${state.userSession.user_id}/coupons`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCoupons(data)
        }
      } catch (error) {
        console.error('Error al cargar cupones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [state.userSession])

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Error al copiar:', error)
    }
  }

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'descuento': return <Star className="h-5 w-5" />
      case 'envio': return <Truck className="h-5 w-5" />
      case 'producto': return <Package className="h-5 w-5" />
      case 'premium': return <Crown className="h-5 w-5" />
      default: return <Gift className="h-5 w-5" />
    }
  }

  const getCouponColor = (type: string) => {
    switch (type) {
      case 'descuento': return 'bg-green-100 text-green-800 border-green-200'
      case 'envio': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'producto': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'premium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (coupon.is_used) {
      return {
        text: 'Usado',
        color: 'bg-gray-100 text-gray-600',
        icon: <CheckCircle className="h-4 w-4" />
      }
    } else {
      return {
        text: 'Disponible',
        color: 'bg-green-100 text-green-600',
        icon: <Clock className="h-4 w-4" />
      }
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3C53] via-[#456882] to-[#1B3C53] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando tus cupones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3C53] via-[#456882] to-[#1B3C53]">
      {/* Header */}
      <div className="bg-[#1B3C53] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/profile/rewards">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Mis Cupones</h1>
                <p className="text-sm opacity-90">Cupones canjeados con tus puntos</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{coupons.length}</div>
              <div className="text-sm opacity-90">Cupones totales</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {coupons.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes cupones aún</h3>
              <p className="text-gray-500 mb-4">Canjea recompensas con tus puntos para obtener cupones</p>
              <Link href="/profile/rewards">
                <Button className="bg-[#1B3C53] hover:bg-[#456882]">
                  <Star className="h-4 w-4 mr-2" />
                  Ver Recompensas
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon)
              return (
                <Card key={coupon.id} className={`bg-white/95 backdrop-blur-sm border-2 ${getCouponColor(coupon.coupon_type)}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCouponIcon(coupon.coupon_type)}
                        <CardTitle className="text-lg">{coupon.coupon_name}</CardTitle>
                      </div>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.text}</span>
                      </Badge>
                    </div>
                    <CardDescription>{coupon.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Código del cupón */}
                      <div>
                        <label className="text-sm font-medium text-gray-600">Código del cupón:</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono text-sm">
                            {coupon.coupon_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(coupon.coupon_code)}
                            disabled={coupon.is_used}
                          >
                            {copiedCode === coupon.coupon_code ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Detalles del cupón */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Puntos gastados:</span>
                          <span className="font-semibold">{coupon.points_spent}</span>
                        </div>
                        
                        {coupon.discount_percentage && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Descuento:</span>
                            <span className="font-semibold text-green-600">{coupon.discount_percentage}%</span>
                          </div>
                        )}
                        
                        {coupon.discount_amount !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valor:</span>
                            <span className="font-semibold text-green-600">
                              {coupon.discount_amount === 0 ? 'Gratis' : `$${coupon.discount_amount}`}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Canjeado:</span>
                          <span className="font-semibold">
                            {new Date(coupon.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {coupon.is_used && coupon.used_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Usado:</span>
                            <span className="font-semibold">
                              {new Date(coupon.used_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Instrucciones de uso */}
                      {!coupon.is_used && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Instrucciones:</strong> Usa este código durante el checkout para aplicar tu descuento.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Botón para volver a recompensas */}
        <div className="mt-8 text-center">
          <Link href="/profile/rewards">
            <Button variant="outline" className="bg-white/95 hover:bg-white">
              <Star className="h-4 w-4 mr-2" />
              Ver más recompensas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
function setCardType(arg0: string) {
  throw new Error("Function not implemented.")
}

function setCardNumber(arg0: string) {
  throw new Error("Function not implemented.")
}

function setCardHolderName(arg0: string) {
  throw new Error("Function not implemented.")
}

function setCardExpiry(arg0: string) {
  throw new Error("Function not implemented.")
}

function setCards(arg0: (prev: any) => any[]) {
  throw new Error("Function not implemented.")
}

function setCvv(arg0: string) {
  throw new Error("Function not implemented.")
}

function setIsAddingCard(arg0: boolean) {
  throw new Error("Function not implemented.")
}

