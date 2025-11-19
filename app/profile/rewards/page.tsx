"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // ← agregar
import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft,
  Star,
  Gift,
  Trophy,
  Target,
  Zap,
  ShoppingBag,
  Coins,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react"
import Link from "next/link"

interface Reward {
  id: number
  name: string
  description: string
  pointsRequired: number
  pointsCurrent: number
  image: string
  category: string
  isAvailable: boolean
  isRedeemed: boolean
}

interface UserPoints {
  current: number
  totalEarned: number
  level: string
  levelProgress: number
  nextLevelPoints: number
  monthlyGoal: number
  monthlyProgress: number
}

export default function RewardsPage() {
  const { state } = useApp()
  const router = useRouter() // ← agregar

  const [userPoints, setUserPoints] = useState<UserPoints>({
    current: 0,
    totalEarned: 0,
    level: "Bronce",
    levelProgress: 0,
    nextLevelPoints: 2000,
    monthlyGoal: 1000,
    monthlyProgress: 0
  })
  const [loading, setLoading] = useState(true)

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "Descuento del 10%",
      description: "Obtén un descuento del 10% en tu próxima compra",
      pointsRequired: 500,
      pointsCurrent: 1250,
      image: "/placeholder.svg",
      category: "descuento",
      isAvailable: true,
      isRedeemed: false
    },
    {
      id: 2,
      name: "Envío Gratis",
      description: "Envío gratuito en tu próxima compra",
      pointsRequired: 300,
      pointsCurrent: 1250,
      image: "/placeholder.svg",
      category: "envio",
      isAvailable: true,
      isRedeemed: false
    },
    {
      id: 3,
      name: "Producto Gratis",
      description: "Selecciona un producto gratis hasta $50",
      pointsRequired: 1000,
      pointsCurrent: 1250,
      image: "/placeholder.svg",
      category: "producto",
      isAvailable: true,
      isRedeemed: false
    },
    {
      id: 4,
      name: "Acceso Premium",
      description: "1 mes de acceso premium a XPmarket+",
      pointsRequired: 2000,
      pointsCurrent: 1250,
      image: "/placeholder.svg",
      category: "premium",
      isAvailable: false,
      isRedeemed: false
    }
  ])

  const [recentEarnings, setRecentEarnings] = useState([
    { id: 1, description: "Compra de $150", points: 150, date: "2025-01-15" },
    { id: 2, description: "Compra de $75", points: 75, date: "2025-01-12" },
    { id: 3, description: "Compra de $200", points: 200, date: "2025-01-10" }
  ])

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserPoints = async () => {
      // Timeout de 3 segundos para evitar carga infinita
      const timeoutId = setTimeout(() => {
        console.warn('Timeout al cargar puntos, usando datos de prueba')
        setUserPoints({
          current: 1250,
          totalEarned: 5420,
          level: "Bronce",
          levelProgress: 65,
          nextLevelPoints: 2000,
          monthlyGoal: 1000,
          monthlyProgress: 45
        })
        setLoading(false)
      }, 3000)

      if (!state.userSession?.user_id) {
        // Si no hay usuario logueado, usar datos de prueba
        clearTimeout(timeoutId)
        setUserPoints({
          current: 1250,
          totalEarned: 5420,
          level: "Bronce",
          levelProgress: 65,
          nextLevelPoints: 2000,
          monthlyGoal: 1000,
          monthlyProgress: 45
        })
        setLoading(false)
        return
      }
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8000/api/points/${state.userSession.user_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          setUserPoints({
            current: data.current_points,
            totalEarned: data.total_earned,
            level: data.level,
            levelProgress: data.level_progress,
            nextLevelPoints: data.next_level_points,
            monthlyGoal: data.monthly_goal,
            monthlyProgress: data.monthly_progress
          })
        } else {
          // Si hay error en la respuesta, usar datos de prueba
          console.warn('Error en la respuesta del servidor, usando datos de prueba')
          setUserPoints({
            current: 1250,
            totalEarned: 5420,
            level: "Bronce",
            levelProgress: 65,
            nextLevelPoints: 2000,
            monthlyGoal: 1000,
            monthlyProgress: 45
          })
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('Error al cargar puntos, usando datos de prueba:', error)
        // Usar datos de prueba en caso de error
        setUserPoints({
          current: 1250,
          totalEarned: 5420,
          level: "Bronce",
          levelProgress: 65,
          nextLevelPoints: 2000,
          monthlyGoal: 1000,
          monthlyProgress: 45
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserPoints()
  }, [state.userSession])

  // Cargar historial de puntos
  useEffect(() => {
    const fetchPointsHistory = async () => {
      if (!state.userSession?.user_id) {
        // Usar datos de prueba si no hay usuario
        setRecentEarnings([
          { id: 1, description: "Compra de $150", points: 150, date: "2025-01-15" },
          { id: 2, description: "Compra de $75", points: 75, date: "2025-01-12" },
          { id: 3, description: "Compra de $200", points: 200, date: "2025-01-10" }
        ])
        return
      }
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8000/api/points/${state.userSession.user_id}/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setRecentEarnings(data.map((item: any) => ({
            id: item.id,
            description: item.description,
            points: item.points,
            date: item.created_at
          })))
        } else {
          // Usar datos de prueba si hay error
          setRecentEarnings([
            { id: 1, description: "Compra de $150", points: 150, date: "2025-01-15" },
            { id: 2, description: "Compra de $75", points: 75, date: "2025-01-12" },
            { id: 3, description: "Compra de $200", points: 200, date: "2025-01-10" }
          ])
        }
      } catch (error) {
        console.error('Error al cargar historial, usando datos de prueba:', error)
        // Usar datos de prueba en caso de error
        setRecentEarnings([
          { id: 1, description: "Compra de $150", points: 150, date: "2025-01-15" },
          { id: 2, description: "Compra de $75", points: 75, date: "2025-01-12" },
          { id: 3, description: "Compra de $200", points: 200, date: "2025-01-10" }
        ])
      }
    }

    fetchPointsHistory()
  }, [state.userSession])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Bronce": return "bg-amber-600"
      case "Plata": return "bg-gray-400"
      case "Oro": return "bg-yellow-500"
      case "Diamante": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Bronce": return <Trophy className="h-5 w-5" />
      case "Plata": return <Award className="h-5 w-5" />
      case "Oro": return <Star className="h-5 w-5" />
      case "Diamante": return <Sparkles className="h-5 w-5" />
      default: return <Trophy className="h-5 w-5" />
    }
  }

  const handleRedeemReward = async (rewardId: number) => {
    const reward = rewards.find(r => r.id === rewardId)
    if (!reward || !state.userSession?.user_id) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/points/redeem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: state.userSession.user_id,
          reward_id: rewardId,
          points_required: reward.pointsRequired,
          description: `Canjeado: ${reward.name}`,
          coupon_name: reward.name,
          coupon_type: reward.category
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Actualizar estado local
        setRewards(prev => prev.map(r => 
          r.id === rewardId 
            ? { ...r, isRedeemed: true, pointsCurrent: r.pointsCurrent - r.pointsRequired }
            : r
        ))
        setUserPoints(prev => ({
          ...prev,
          current: data.current_points
        }))
        
        // Mostrar mensaje de éxito con código de cupón
        alert(`¡Recompensa canjeada exitosamente!\n\nCódigo de cupón: ${data.coupon_code}\nPuntos restantes: ${data.current_points}`)
        
        // Redirigir a la vista de cupones para que se muestre el cupón recién creado
        router.push('/profile/coupons')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al canjear recompensa:', error)
      alert('Error al canjear la recompensa')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3C53] via-[#456882] to-[#1B3C53] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando tus puntos...</p>
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
              <Link href="/profile/personal-info">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">XPmarket Rewards</h1>
                <p className="text-sm opacity-90">Gana puntos con tus compras</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile/coupons">
                <Button variant="outline" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                  <Gift className="h-4 w-4 mr-2" />
                  Mis Cupones
                </Button>
              </Link>
              <div className="text-right">
                <div className="text-3xl font-bold">{userPoints.current.toLocaleString()}</div>
                <div className="text-sm opacity-90">Puntos disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Nivel y Progreso */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${getLevelColor(userPoints.level)} text-white`}>
                  {getLevelIcon(userPoints.level)}
                </div>
                <div>
                  <CardTitle className="text-2xl">Nivel {userPoints.level}</CardTitle>
                  <CardDescription>
                    {userPoints.levelProgress}% completado hacia el siguiente nivel
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Siguiente nivel</div>
                <div className="text-lg font-semibold">{userPoints.nextLevelPoints} puntos</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso del nivel</span>
                  <span>{userPoints.levelProgress}%</span>
                </div>
                <Progress value={userPoints.levelProgress} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Objetivo mensual</span>
                  <span>{userPoints.monthlyProgress}%</span>
                </div>
                <Progress value={userPoints.monthlyProgress} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userPoints.totalEarned.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Puntos ganados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">Compras realizadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">$1,250</div>
                  <div className="text-sm text-gray-600">Total gastado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recompensas Disponibles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Canjea tus puntos</h2>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {rewards.filter(r => r.isAvailable && !r.isRedeemed).length} disponibles
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="bg-white overflow-hidden">
                {/* ...existing image... */}
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Nombre y descripción */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{reward.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                    </div>

                    {/* Puntos requeridos vs Puntos actuales */}
                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Puntos requeridos:</span>
                        <span className="font-semibold text-gray-900">{reward.pointsRequired}</span>
                      </div>
                      
                      {/* CAMBIO PRINCIPAL: Mostrar puntos actuales con badge */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tus puntos:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-[#1B3C53]">{userPoints.current}</span>
                          {userPoints.current >= reward.pointsRequired && !reward.isRedeemed && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              ✓ Disponible
                            </Badge>
                          )}
                          {userPoints.current < reward.pointsRequired && !reward.isRedeemed && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              Faltan {reward.pointsRequired - userPoints.current}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Mostrar puntos que quedarían después del canje */}
                      {!reward.isRedeemed && (
                        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2">
                          <span>Te quedarían:</span>
                          <span className="font-semibold text-gray-700">
                            {Math.max(0, userPoints.current - reward.pointsRequired)} puntos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div>
                      {userPoints.current >= reward.pointsRequired && !reward.isRedeemed ? (
                        <Button 
                          onClick={() => handleRedeemReward(reward.id)}
                          className="w-full bg-[#1B3C53] hover:bg-[#456882] text-white"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Canjear
                        </Button>
                      ) : reward.isRedeemed ? (
                        <Button disabled className="w-full bg-green-100 text-green-800 border border-green-300">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ya canjeado
                        </Button>
                      ) : (
                        <Button disabled className="w-full bg-gray-100 text-gray-500 border border-gray-300">
                          <Clock className="h-4 w-4 mr-2" />
                          Puntos insuficientes
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Historial de Puntos */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Historial de puntos</span>
            </CardTitle>
            <CardDescription>
              Tus ganancias de puntos más recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEarnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{earning.description}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(earning.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+{earning.points} puntos</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
