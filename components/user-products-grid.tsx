"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Heart, 
  Edit, 
  MoreVertical,
  TrendingUp,
  Calendar,
  Package,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface UserProduct {
  id: number
  name: string
  price: number
  image: string
  category: string
  status: 'active' | 'sold' | 'pending'
  views: number
  likes: number
  createdAt: string
}

interface UserProductsGridProps {
  products: UserProduct[]
  onEdit?: (productId: number) => void
  onDelete?: (productId: number) => void
  onToggleStatus?: (productId: number, status: string) => void
}

export default function UserProductsGrid({ 
  products, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: UserProductsGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'sold':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'sold':
        return 'Vendido'
      case 'pending':
        return 'Pendiente'
      default:
        return 'Desconocido'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes productos</h3>
          <p className="text-gray-500 mb-4">Comienza a vender agregando tu primer producto</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badge de estado */}
            <Badge 
              className={`absolute top-2 left-2 ${getStatusColor(product.status)}`}
            >
              {getStatusText(product.status)}
            </Badge>

            {/* Menú de opciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(product.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus?.(product.id, product.status === 'active' ? 'pending' : 'active')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {product.status === 'active' ? 'Pausar' : 'Activar'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(product.id)}
                  className="text-red-600"
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Overlay con información rápida */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link href={`/product/${product.id}`}>
                  <Button variant="secondary" size="sm">
                    Ver producto
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2">
                {product.name}
              </h3>
            </div>
            
            <p className="text-2xl font-bold text-red-600 mb-3">
              ${product.price.toLocaleString()}
            </p>

            {/* Estadísticas del producto */}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{product.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{product.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(product.created_at)}</span>
              </div>
            </div>

            {/* Categoría */}
            <div className="mb-3">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit?.(product.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Link href={`/product/${product.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </Link>

               {/*Boton de borrar articulo*/}
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onEdit?.(product.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}