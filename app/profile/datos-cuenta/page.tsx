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
import Navbar from "@/components/navbar"

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
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1B3C53] mb-2">Datos de tu cuenta</h1>
            <p className="text-[#456882]">Consulta tus compras, entregas y envíos en progreso</p>
          </div>
        </div>

        {/* Three Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Purchases Card */}
          <Card className="bg-white shadow-md border-[#E8DDD4]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckSquare className="h-5 w-5 text-[#1B3C53]" />
                <span>Últimas compras</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border-b border-[#E8DDD4] pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-[#1B3C53]">{purchase.product}</h4>
                      <p className="text-sm text-[#456882]">{purchase.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1B3C53]">{purchase.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deliveries Card */}
          <Card className="bg-white shadow-md border-[#E8DDD4]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Truck className="h-5 w-5 text-[#456882]" />
                <span>Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="border-b border-[#E8DDD4] pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-[#1B3C53]">{delivery.product}</h4>
                      <p className="text-sm text-[#456882]">{delivery.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-[#E8DDD4] text-[#1B3C53]">
                        {delivery.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipments in Progress Card */}
          <Card className="bg-white shadow-md border-[#E8DDD4]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-[#E63946]" />
                <span>Envíos en progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border-b border-[#E8DDD4] pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-[#1B3C53]">{shipment.product}</h4>
                      <p className="text-sm text-[#456882]">{shipment.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-[#E63946] text-white">
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