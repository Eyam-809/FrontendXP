"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Plus,
  MapPin,
  Edit,
  Trash2,
  Home,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  Shield,
  Star
} from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface UserData {
  name: string
  email: string
  avatar?: string
}

interface Address {
  id: string
  type: "home" | "work" | "other"
  name: string
  street: string
  number: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
  instructions?: string
}

export default function DireccionesPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  // Form states
  const [addressType, setAddressType] = useState<"home" | "work" | "other">("home")
  const [addressName, setAddressName] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [apartment, setApartment] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("México")
  const [phone, setPhone] = useState("")
  const [instructions, setInstructions] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const addressTypes = [
    { value: "home", label: "Casa", icon: <Home className="h-4 w-4" /> },
    { value: "work", label: "Trabajo", icon: <Building className="h-4 w-4" /> },
    { value: "other", label: "Otro", icon: <MapPin className="h-4 w-4" /> }
  ]

  const mexicanStates = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
    "Chihuahua", "Coahuila", "Colima", "Ciudad de México", "Durango", "Estado de México",
    "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
    "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ]

  const formatPhone = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 10) {
      return `(${v.substring(0, 3)}) ${v.substring(3, 6)}-${v.substring(6, 10)}`
    }
    return v
  }

  const formatZipCode = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    return v.substring(0, 5)
  }

  const resetForm = () => {
    setAddressType("home")
    setAddressName("")
    setStreet("")
    setNumber("")
    setApartment("")
    setCity("")
    setState("")
    setZipCode("")
    setCountry("México")
    setPhone("")
    setInstructions("")
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addressName || !street || !number || !city || !state || !zipCode || !phone) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }
    
    setIsAddingAddress(true)
    
    // Simulate API call
    setTimeout(() => {
      const newAddress: Address = {
        id: Date.now().toString(),
        type: addressType,
        name: addressName,
        street,
        number,
        apartment,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault: addresses.length === 0,
        instructions
      }
      
      setAddresses([...addresses, newAddress])
      resetForm()
      setIsAddingAddress(false)
      setShowAddDialog(false)
      alert("Dirección agregada exitosamente")
    }, 2000)
  }

  const handleEditAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAddress || !addressName || !street || !number || !city || !state || !zipCode || !phone) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }
    
    setIsAddingAddress(true)
    
    // Simulate API call
    setTimeout(() => {
      const updatedAddress: Address = {
        ...editingAddress,
        type: addressType,
        name: addressName,
        street,
        number,
        apartment,
        city,
        state,
        zipCode,
        country,
        phone,
        instructions
      }
      
      setAddresses(addresses.map(addr => addr.id === editingAddress.id ? updatedAddress : addr))
      resetForm()
      setIsAddingAddress(false)
      setShowEditDialog(false)
      setEditingAddress(null)
      alert("Dirección actualizada exitosamente")
    }, 2000)
  }

  const handleDeleteAddress = (addressId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta dirección?")) {
      setAddresses(addresses.filter(addr => addr.id !== addressId))
    }
  }

  const handleSetDefault = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })))
  }

  const openEditDialog = (address: Address) => {
    setEditingAddress(address)
    setAddressType(address.type)
    setAddressName(address.name)
    setStreet(address.street)
    setNumber(address.number)
    setApartment(address.apartment || "")
    setCity(address.city)
    setState(address.state)
    setZipCode(address.zipCode)
    setCountry(address.country)
    setPhone(address.phone)
    setInstructions(address.instructions || "")
    setShowEditDialog(true)
  }

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home": return <Home className="h-4 w-4" />
      case "work": return <Building className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "home": return "bg-[#E8DDD4] text-[#1B3C53]"
      case "work": return "bg-green-100 text-green-800"
      default: return "bg-[#E8DDD4] text-[#1B3C53]"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#456882]">Cargando direcciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1B3C53] mb-2">Tus Direcciones</h1>
            <p className="text-[#456882]">Gestiona tus direcciones de envío de forma segura</p>
          </div>
        </div>

        {/* Add Address Button */}
        <div className="mb-8">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B3C53] hover:bg-[#456882] text-[#F9F3EF]">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nueva Dirección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Dirección</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address-type">Tipo de dirección</Label>
                    <Select value={addressType} onValueChange={(value: "home" | "work" | "other") => setAddressType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {addressTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-name">Nombre de la dirección</Label>
                    <Input
                      id="address-name"
                      value={addressName}
                      onChange={(e) => setAddressName(e.target.value)}
                      placeholder="Ej: Casa, Trabajo, etc."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Calle</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Nombre de la calle"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartamento/Oficina (opcional)</Label>
                    <Input
                      id="apartment"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apto 5B"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {mexicanStates.map((stateName) => (
                          <SelectItem key={stateName} value={stateName}>
                            {stateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip-code">Código Postal</Label>
                    <Input
                      id="zip-code"
                      value={zipCode}
                      onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                      placeholder="12345"
                      maxLength={5}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="México"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instrucciones de entrega (opcional)</Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Instrucciones especiales para el repartidor..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isAddingAddress}>
                    {isAddingAddress ? "Agregando..." : "Agregar Dirección"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="bg-white shadow-md">
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 text-[#456882] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1B3C53] mb-2">No tienes direcciones registradas</h3>
              <p className="text-[#456882] mb-6">Agrega tu primera dirección para comenzar a recibir tus pedidos</p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-[#1B3C53] hover:bg-[#456882]">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Dirección
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className="bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getAddressTypeColor(address.type)}`}>
                        {getAddressTypeIcon(address.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1B3C53]">{address.name}</h3>
                        <p className="text-sm text-[#456882] capitalize">{address.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {address.isDefault && (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Predeterminada
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[#1B3C53]">
                      {address.street} {address.number}
                      {address.apartment && `, ${address.apartment}`}
                    </p>
                    <p className="text-[#1B3C53]">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-[#1B3C53]">{address.country}</p>
                    <p className="text-[#456882]">{address.phone}</p>
                    {address.instructions && (
                      <p className="text-sm text-[#456882] italic">
                        Instrucciones: {address.instructions}
                      </p>
                    )}
                  </div>
                  
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="w-full"
                    >
                      Establecer como predeterminada
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Address Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Dirección</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-address-type">Tipo de dirección</Label>
                  <Select value={addressType} onValueChange={(value: "home" | "work" | "other") => setAddressType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {addressTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            {type.icon}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address-name">Nombre de la dirección</Label>
                  <Input
                    id="edit-address-name"
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    placeholder="Ej: Casa, Trabajo, etc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-street">Calle</Label>
                <Input
                  id="edit-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Nombre de la calle"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Número</Label>
                  <Input
                    id="edit-number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-apartment">Apartamento/Oficina (opcional)</Label>
                  <Input
                    id="edit-apartment"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="Apto 5B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Ciudad</Label>
                  <Input
                    id="edit-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ciudad"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {mexicanStates.map((stateName) => (
                        <SelectItem key={stateName} value={stateName}>
                          {stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zip-code">Código Postal</Label>
                  <Input
                    id="edit-zip-code"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                    placeholder="12345"
                    maxLength={5}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-country">País</Label>
                  <Input
                    id="edit-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="México"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input
                    id="edit-phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-instructions">Instrucciones de entrega (opcional)</Label>
                <Textarea
                  id="edit-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instrucciones especiales para el repartidor..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isAddingAddress}>
                  {isAddingAddress ? "Actualizando..." : "Actualizar Dirección"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Security Notice */}
        <Card className="mt-8 bg-[#E8DDD4] border-[#E8DDD4]">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-[#1B3C53] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#1B3C53] mb-2">Seguridad de tus direcciones</h4>
                <ul className="text-sm text-[#1B3C53] space-y-1">
                  <li>• Tus direcciones están protegidas y solo se usan para envíos</li>
                  <li>• Puedes editar o eliminar direcciones en cualquier momento</li>
                  <li>• La dirección predeterminada se usará automáticamente en tus compras</li>
                  <li>• Recomendamos mantener al menos una dirección actualizada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 