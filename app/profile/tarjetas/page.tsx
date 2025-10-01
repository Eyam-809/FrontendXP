"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Plus,
  CreditCard,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react"
import Link from "next/link"

interface UserData {
  name: string
  email: string
  avatar?: string
}

interface CardData {
  id: string
  type: string
  number: string
  name: string
  expiration: string
  isDefault: boolean
  brand: string
}

export default function TarjetasPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [cards, setCards] = useState<CardData[]>([])
  const [showCardNumber, setShowCardNumber] = useState<{[key: string]: boolean}>({})
  const [isAddingCard, setIsAddingCard] = useState(false)
  
  // Form states
  const [cardType, setCardType] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiration, setCardExpiration] = useState("")
  const [cardCVV, setCardCVV] = useState("")
  const [showCVV, setShowCVV] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const cardTypes = [
    { value: "credit", label: "Tarjeta de Crédito", icon: "💳" },
    { value: "debit", label: "Tarjeta de Débito", icon: "💳" },
    { value: "prepaid", label: "Tarjeta Prepago", icon: "💳" },
    { value: "business", label: "Tarjeta Empresarial", icon: "💼" }
  ]

  const cardBrands = [
    { value: "visa", label: "Visa", color: "bg-[#1B3C53]" },
    { value: "mastercard", label: "Mastercard", color: "bg-[#E63946]" },
    { value: "amex", label: "American Express", color: "bg-green-600" },
    { value: "discover", label: "Discover", color: "bg-orange-600" }
  ]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiration = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardType || !cardNumber || !cardName || !cardExpiration || !cardCVV) {
      alert("Por favor completa todos los campos")
      return
    }
    
    setIsAddingCard(true)
    
    // Simulate API call
    setTimeout(() => {
      const newCard: CardData = {
        id: Date.now().toString(),
        type: cardType,
        number: cardNumber,
        name: cardName,
        expiration: cardExpiration,
        isDefault: cards.length === 0,
        brand: "visa" // Default brand
      }
      
      setCards([...cards, newCard])
      setCardType("")
      setCardNumber("")
      setCardName("")
      setCardExpiration("")
      setCardCVV("")
      setIsAddingCard(false)
      alert("Tarjeta agregada exitosamente")
    }, 2000)
  }

  const handleDeleteCard = (cardId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      setCards(cards.filter(card => card.id !== cardId))
    }
  }

  const handleSetDefault = (cardId: string) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })))
  }

  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '')
    if (cleanNumber.startsWith('4')) return 'visa'
    if (cleanNumber.startsWith('5')) return 'mastercard'
    if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) return 'amex'
    return 'discover'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#456882]">Cargando tarjetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/profile">
            <Button variant="outline" className="bg-gray-100 border-gray-300 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tus Tarjetas</h1>
            <p className="text-gray-600">Gestiona tus métodos de pago de forma segura</p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Card */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Plus className="h-5 w-5 text-green-600" />
                <span>Agregar nueva tarjeta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-type">Tipo de tarjeta</Label>
                  <Select value={cardType} onValueChange={setCardType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de tarjeta" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-number">Número de tarjeta</Label>
                  <div className="relative">
                    <Input
                      id="card-number"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Shield className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                    <Input
                      id="card-name"
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="JOHN DOE"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-expiration">Vencimiento</Label>
                    <Input
                      id="card-expiration"
                      type="text"
                      value={cardExpiration}
                      onChange={(e) => setCardExpiration(formatExpiration(e.target.value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-cvv">CVV</Label>
                  <div className="relative">
                    <Input
                      id="card-cvv"
                      type={showCVV ? "text" : "password"}
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCVV(!showCVV)}
                    >
                      {showCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={isAddingCard}
                >
                  {isAddingCard ? "Agregando..." : "Agregar tarjeta"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registered Cards */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Tarjetas registradas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes tarjetas registradas.</p>
                  <p className="text-sm text-gray-400 mt-2">Agrega tu primera tarjeta para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-5 rounded ${cardBrands.find(b => b.value === getCardBrand(card.number))?.color || 'bg-gray-600'}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{card.name}</p>
                            <p className="text-sm text-gray-500">{card.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {card.isDefault && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Predeterminada
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowCardNumber({...showCardNumber, [card.id]: !showCardNumber[card.id]})}
                          >
                            {showCardNumber[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-mono text-gray-700">
                          {showCardNumber[card.id] ? card.number : `**** **** **** ${card.number.slice(-4)}`}
                        </p>
                        <p className="text-sm text-gray-500">Vence: {card.expiration}</p>
                      </div>
                      
                      {!card.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(card.id)}
                          className="mt-3"
                        >
                          Establecer como predeterminada
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Seguridad de tus tarjetas</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tus datos están encriptados y protegidos con los más altos estándares de seguridad</li>
                  <li>• Nunca compartimos información de tarjetas con terceros</li>
                  <li>• Puedes eliminar tus tarjetas en cualquier momento</li>
                  <li>• Todas las transacciones están protegidas por SSL</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 