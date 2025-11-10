"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Package, Users, DollarSign, ShoppingCart, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import Link from "next/link"

export default function AdminDashboard() {

  const stats = [
    {
      title: "Ventas Totales",
      value: "1,234",
      change: "+12.5%",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Ganancias del Año",
      value: "$45,231",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Productos en Stock",
      value: "856",
      change: "-2.1%",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Usuarios Activos",
      value: "2,847",
      change: "+15.3%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const recentSales = [
    { id: 1, product: "iPhone 15 Pro", customer: "Juan Pérez", amount: "$999.99", status: "Completado" },
    { id: 2, product: "MacBook Air", customer: "María García", amount: "$1,299.99", status: "Procesando" },
    { id: 3, product: "AirPods Pro", customer: "Carlos López", amount: "$249.99", status: "Completado" },
    { id: 4, product: "iPad Pro", customer: "Ana Martínez", amount: "$799.99", status: "Enviado" },
    { id: 5, product: "Apple Watch", customer: "Luis Rodríguez", amount: "$399.99", status: "Completado" },
  ]

  const quickActions = [
    {
      title: "Análisis de Ventas",
      description: "Ver gráficos y estadísticas detalladas",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-blue-500",
    },
    {
      title: "Gestión de Inventario",
      description: "Administrar stock por categorías",
      icon: Package,
      href: "/admin/inventory",
      color: "bg-green-500",
    },
    {
      title: "Reportes de Ganancias",
      description: "Ver reportes financieros anuales",
      icon: TrendingUp,
      href: "/admin/reports",
      color: "bg-purple-500",
    },
    {
      title: "Gestión de Productos",
      description: "Agregar, editar y eliminar productos",
      icon: Eye,
      href: "/admin/products",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Bienvenido de vuelta</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Accede a las funciones principales del panel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Link href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                <action.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">{action.title}</h3>
                                <p className="text-sm text-gray-500">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ventas Recientes</CardTitle>
                <CardDescription>Últimas transacciones realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{sale.product}</p>
                        <p className="text-xs text-gray-500">{sale.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{sale.amount}</p>
                        <Badge variant={sale.status === "Completado" ? "default" : "secondary"} className="text-xs">
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Todas las Ventas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nuevo producto agregado: "Smartphone Galaxy S24"</p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pedido #1234 completado</p>
                    <p className="text-xs text-gray-500">Hace 4 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stock bajo en categoría "Electronics"</p>
                    <p className="text-xs text-gray-500">Hace 6 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
