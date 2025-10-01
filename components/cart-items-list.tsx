"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ShoppingCart, 
  Eye, 
  Trash2, 
  Plus, 
  Minus,
  Package,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/app-context"

interface CartItemsListProps {
  items: any[]
}

export default function CartItemsList({ items }: CartItemsListProps) {
  const { dispatch } = useApp()

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: productId })
    } else {
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id: productId, quantity } })
    }
  }

  const removeFromCart = (productId: number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId })
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500 mb-4">Agrega productos a tu carrito para verlos aquí</p>
          <Link href="/">
            <Button>
              Explorar productos
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen del carrito */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Resumen del carrito</h3>
            <Badge variant="secondary">
              {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Package className="h-5 w-5 text-[#E63946]" />
              <div>
                <div className="text-sm text-gray-500">Productos</div>
                <div className="font-semibold">{items.length}</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-[#1B3C53]" />
              <div>
                <div className="text-sm text-gray-500">Cantidad total</div>
                <div className="font-semibold">{getTotalItems()}</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-semibold">${getTotalPrice().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {/* Imagen del producto */}
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  {item.discount > 0 && (
                    <Badge className="absolute -top-1 -right-1 text-xs">
                      -{item.discount}%
                    </Badge>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg truncate">{item.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    {item.isNew && (
                      <Badge className="text-xs bg-green-500">Nuevo</Badge>
                    )}
                  </div>
                </div>

                {/* Precio */}
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-xl font-bold text-red-600">
                      ${item.price.toLocaleString()}
                    </p>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ${item.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    ${(item.price * item.quantity).toLocaleString()} total
                  </p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center"
                    min="1"
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col space-y-2">
                  <Link href={`/product/${item.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acciones del carrito */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold">Total del carrito</p>
              <p className="text-2xl font-bold text-red-600">${getTotalPrice().toLocaleString()}</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => dispatch({ type: "CLEAR_CART" })}
              >
                Vaciar carrito
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                Proceder al pago
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 