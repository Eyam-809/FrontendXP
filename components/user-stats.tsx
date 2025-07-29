"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Package, 
  Star, 
  Users,
  ShoppingCart,
  DollarSign
} from "lucide-react"

interface UserStatsProps {
  totalProducts: number
  totalSales: number
  rating: number
  followers: number
  following: number
  totalViews: number
  totalLikes: number
  activeProducts: number
  soldProducts: number
}

export default function UserStats({
  totalProducts,
  totalSales,
  rating,
  followers,
  following,
  totalViews,
  totalLikes,
  activeProducts,
  soldProducts
}: UserStatsProps) {
  const stats = [
    {
      title: "Productos activos",
      value: activeProducts,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Productos vendidos",
      value: soldProducts,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total de vistas",
      value: totalViews,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total de likes",
      value: totalLikes,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ]

  const socialStats = [
    {
      title: "Seguidores",
      value: followers,
      icon: Users,
      color: "text-indigo-600"
    },
    {
      title: "Siguiendo",
      value: following,
      icon: Users,
      color: "text-indigo-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Estadísticas de ventas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                <div className="text-sm text-gray-500">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Red social</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {socialStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                <div className="text-sm text-gray-500">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Rendimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">Calificación promedio</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{rating}</span>
                <span className="text-sm text-gray-500">/ 5.0</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Total de ventas</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                {totalSales}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total de productos</span>
              </div>
              <Badge variant="secondary" className="text-lg">
                {totalProducts}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 