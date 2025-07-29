"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  CheckSquare, 
  Truck, 
  Package
} from "lucide-react"
import Link from "next/link"

interface Purchase {
  id: string
  product: string
  date: string
  total: string
}

interface Delivery {
  id: string
  product: string
  date: string
  status: string
}

interface Shipment {
  id: string
  product: string
  date: string
  status: string
}

export default function DatosCuentaPage() {
  // Ya no se usa user ni seguridad aquí

  // Mock data for purchases, deliveries, and shipments
  const purchases: Purchase[] = [
    {
      id: "1",
      product: "Nintendo Switch OLED",
      date: "2024-06-01",
      total: "$7,999.00"
    },
    {
      id: "2", 
      product: "Control Xbox Series X",
      date: "2024-05-28",
      total: "$1,499.00"
    },
    {
      id: "3",
      product: "Pokémon Escarlata",
      date: "2024-05-20", 
      total: "$1,299.00"
    }
  ]

  const deliveries: Delivery[] = [
    {
      id: "1",
      product: "Nintendo Switch OLED",
      date: "2024-06-03",
      status: "Entregado"
    },
    {
      id: "2",
      product: "Control Xbox Series X", 
      date: "2024-05-30",
      status: "Entregado"
    }
  ]

  const shipments: Shipment[] = [
    {
      id: "1",
      product: "Pokémon Escarlata",
      date: "2024-06-04",
      status: "En camino"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/profile">
            <Button variant="outline" className="bg-gray-100 border-gray-300 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Datos de tu cuenta</h1>
            <p className="text-gray-600">Consulta tus compras, entregas y envíos en progreso</p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Three Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Purchases Card */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <span>Últimas compras</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{purchase.product}</h4>
                      <p className="text-sm text-gray-500">{purchase.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{purchase.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deliveries Card */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{delivery.product}</h4>
                      <p className="text-sm text-gray-500">{delivery.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {delivery.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipments in Progress Card */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-orange-600" />
                <span>Envíos en progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{shipment.product}</h4>
                      <p className="text-sm text-gray-500">{shipment.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {shipment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}