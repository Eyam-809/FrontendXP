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
import { ApiUrl } from "@/lib/config"

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Address {
  id: string
  tipo: "home" | "work" | "other"
  nombre_direccion: string
  calle: string
  numero: string
  apartamento_oficina?: string
  ciudad: string
  estado: string
  codigo_postal: string
  pais: string
  telefono: string
  isDefault?: boolean
  instrucciones?: string
}

export default function DireccionesPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
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

  // Cargar datos del usuario y sus direcciones
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem("userData")
        const token = localStorage.getItem("token")
        
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)

          // Cargar direcciones del usuario
          if (parsedUser.id && token) {
            setIsLoadingAddresses(true)
            const res = await fetch(`${ApiUrl}/api/direcciones/${parsedUser.id}`, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            })

            if (!res.ok) {
              console.error("Error cargando direcciones:", res.statusText)
              setAddresses([])
            } else {
              const data = await res.json()
              setAddresses(Array.isArray(data) ? data : [])
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setAddresses([])
      } finally {
        setIsLoadingAddresses(false)
      }
    }

    loadUserData()
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

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!addressName || !street || !number || !city || !state || !zipCode || !phone) {
      alert("Completa los campos obligatorios")
      return
    }

    const payload = {
      tipo: addressType || "home",
      nombre_direccion: addressName,
      calle: street,
      numero: number,
      apartamento_oficina: apartment || null,
      ciudad: city,
      estado: state,
      codigo_postal: zipCode,
      pais: country || "México",
      telefono: phone.replace(/\D/g, ""),
      instrucciones: instructions || ""
    }

    try {
      setIsAddingAddress(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${ApiUrl}/api/direcciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText)
        throw new Error(errText || `Error ${res.status}`)
      }

      const created = await res.json()
      setAddresses(prev => [created, ...prev])
      resetForm()
      setShowAddDialog(false)
      alert("Dirección guardada correctamente")
    } catch (err: any) {
      console.error("Error guardando dirección:", err)
      alert(err.message || "Error al guardar la dirección")
    } finally {
      setIsAddingAddress(false)
    }
  }

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAddress) return

    if (!addressName || !street || !number || !city || !state || !zipCode || !phone) {
      alert("Completa los campos obligatorios")
      return
    }

    const payload = {
      tipo: addressType,
      nombre_direccion: addressName,
      calle: street,
      numero: number,
      apartamento_oficina: apartment || null,
      ciudad: city,
      estado: state,
      codigo_postal: zipCode,
      pais: country,
      telefono: phone.replace(/\D/g, ""),
      instrucciones: instructions || ""
    }

    try {
      setIsAddingAddress(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${ApiUrl}/api/direcciones/${editingAddress.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText)
        throw new Error(errText || `Error ${res.status}`)
      }

      const updated = await res.json()
      setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a))
      resetForm()
      setShowEditDialog(false)
      setEditingAddress(null)
      alert("Dirección actualizada correctamente")
    } catch (err: any) {
      console.error("Error actualizando dirección:", err)
      alert(err.message || "Error al actualizar la dirección")
    } finally {
      setIsAddingAddress(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta dirección?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${ApiUrl}/api/direcciones/${addressId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText)
        throw new Error(errText || `Error ${res.status}`)
      }

      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      alert("Dirección eliminada correctamente")
    } catch (err: any) {
      console.error("Error eliminando dirección:", err)
      alert(err.message || "Error al eliminar la dirección")
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
    setAddressType(address.tipo)
    setAddressName(address.nombre_direccion)
    setStreet(address.calle)
    setNumber(address.numero)
    setApartment(address.apartamento_oficina || "")
    setCity(address.ciudad)
    setState(address.estado)
    setZipCode(address.codigo_postal)
    setCountry(address.pais)
    setPhone(address.telefono)
    setInstructions(address.instrucciones || "")
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

  if (!user || isLoadingAddresses) {
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
                <DialogTitle className="text-[#1B3C53]">Agregar Nueva Dirección</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address-type" className="text-[#1B3C53]">Tipo de dirección</Label>
                     <Select value={addressType} onValueChange={(value: "home" | "work" | "other") => setAddressType(value)}>
                      <SelectTrigger className="text-[#1B3C53] placeholder:text-[#456882]">
                        <SelectValue className="text-[#1B3C53] placeholder:text-[#456882]" placeholder="Selecciona el tipo" />
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
                    <Label htmlFor="address-name" className="text-[#1B3C53]">Nombre de la dirección</Label>
                     <Input
                      id="address-name"
                      value={addressName}
                      onChange={(e) => setAddressName(e.target.value)}
                      placeholder="Ej: Casa, Trabajo, etc."
                      required
                      className="text-[#1B3C53] placeholder:text-[#456882]"
                    />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                  <Label htmlFor="street" className="text-[#1B3C53]">Calle</Label>
                   <Input
                     id="street"
                     value={street}
                     onChange={(e) => setStreet(e.target.value)}
                     placeholder="Nombre de la calle"
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="number" className="text-[#1B3C53]">Número</Label>
                     <Input
                       id="number"
                       value={number}
                       onChange={(e) => setNumber(e.target.value)}
                       placeholder="123"
                       required
                       className="text-[#1B3C53] placeholder:text-[#456882]"
                     />
                   </div>
                   <div className="space-y-2">
                    <Label htmlFor="apartment" className="text-[#1B3C53]">Apartamento/Oficina (opcional)</Label>
                     <Input
                       id="apartment"
                       value={apartment}
                       onChange={(e) => setApartment(e.target.value)}
                       placeholder="Apto 5B"
                       className="text-[#1B3C53] placeholder:text-[#456882]"
                     />
                   </div>
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[#1B3C53]">Ciudad</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad"
                      required
                      className="text-[#1B3C53] placeholder:text-[#456882]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-[#1B3C53]">Estado</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="text-[#1B3C53] placeholder:text-[#456882]">
                        <SelectValue className="text-[#1B3C53] placeholder:text-[#456882]" placeholder="Selecciona estado" />
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
                    <Label htmlFor="zip-code" className="text-[#1B3C53]">Código Postal</Label>
                    <Input
                      id="zip-code"
                      value={zipCode}
                      onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                      placeholder="12345"
                      maxLength={5}
                      required
                      className="text-[#1B3C53] placeholder:text-[#456882]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-[#1B3C53]">País</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="México"
                      required
                      className="text-[#1B3C53] placeholder:text-[#456882]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#1B3C53]">Teléfono</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(555) 123-4567"
                      required
                      className="text-[#1B3C53] placeholder:text-[#456882]"
                    />
                  </div>
                </div>
 
                 <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-[#1B3C53]">Instrucciones de entrega (opcional)</Label>
                   <Textarea
                     id="instructions"
                     value={instructions}
                     onChange={(e) => setInstructions(e.target.value)}
                     placeholder="Instrucciones especiales para el repartidor..."
                     rows={3}
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
 
                 <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    className="bg-[#1B3C53] hover:bg-[#123246] text-white"
                    onClick={() => setShowAddDialog(false)}
                  >
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
                      <div className={`p-2 rounded-lg ${getAddressTypeColor(address.tipo)}`}>
                        {getAddressTypeIcon(address.tipo)}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1B3C53]">{address.nombre_direccion}</h3>
                        <p className="text-sm text-[#456882] capitalize">{address.tipo}</p>
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
                      {address.calle} {address.numero}
                      {address.apartamento_oficina && `, ${address.apartamento_oficina}`}
                    </p>
                    <p className="text-[#1B3C53]">
                      {address.ciudad}, {address.estado} {address.codigo_postal}
                    </p>
                    <p className="text-[#1B3C53]">{address.pais}</p>
                    <p className="text-[#456882]">{address.telefono}</p>
                    {address.instrucciones && (
                      <p className="text-sm text-[#456882] italic">
                        Instrucciones: {address.instrucciones}
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
              <DialogTitle className="text-[#1B3C53]">Editar Dirección</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-address-type" className="text-[#1B3C53]">Tipo de dirección</Label>
                   <Select value={addressType} onValueChange={(value: "home" | "work" | "other") => setAddressType(value)}>
                     <SelectTrigger className="text-[#1B3C53]">
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
                  <Label htmlFor="edit-address-name" className="text-[#1B3C53]">Nombre de la dirección</Label>
                   <Input
                     id="edit-address-name"
                     value={addressName}
                     onChange={(e) => setAddressName(e.target.value)}
                     placeholder="Ej: Casa, Trabajo, etc."
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                <Label htmlFor="edit-street" className="text-[#1B3C53]">Calle</Label>
                 <Input
                   id="edit-street"
                   value={street}
                   onChange={(e) => setStreet(e.target.value)}
                   placeholder="Nombre de la calle"
                   required
                   className="text-[#1B3C53] placeholder:text-[#456882]"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="edit-number" className="text-[#1B3C53]">Número</Label>
                   <Input
                     id="edit-number"
                     value={number}
                     onChange={(e) => setNumber(e.target.value)}
                     placeholder="123"
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
                 <div className="space-y-2">
                  <Label htmlFor="edit-apartment" className="text-[#1B3C53]">Apartamento/Oficina (opcional)</Label>
                   <Input
                     id="edit-apartment"
                     value={apartment}
                     onChange={(e) => setApartment(e.target.value)}
                     placeholder="Apto 5B"
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="edit-city" className="text-[#1B3C53]">Ciudad</Label>
                   <Input
                     id="edit-city"
                     value={city}
                     onChange={(e) => setCity(e.target.value)}
                     placeholder="Ciudad"
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
                 <div className="space-y-2">
                  <Label htmlFor="edit-state" className="text-[#1B3C53]">Estado</Label>
                   <Select value={state} onValueChange={setState}>
                     <SelectTrigger className="text-[#1B3C53]">
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
                  <Label htmlFor="edit-zip-code" className="text-[#1B3C53]">Código Postal</Label>
                   <Input
                     id="edit-zip-code"
                     value={zipCode}
                     onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                     placeholder="12345"
                     maxLength={5}
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="edit-country" className="text-[#1B3C53]">País</Label>
                   <Input
                     id="edit-country"
                     value={country}
                     onChange={(e) => setCountry(e.target.value)}
                     placeholder="México"
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
                 <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-[#1B3C53]">Teléfono</Label>
                   <Input
                     id="edit-phone"
                     value={phone}
                     onChange={(e) => setPhone(formatPhone(e.target.value))}
                     placeholder="(555) 123-4567"
                     required
                     className="text-[#1B3C53] placeholder:text-[#456882]"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                <Label htmlFor="edit-instructions" className="text-[#1B3C53]">Instrucciones de entrega (opcional)</Label>
                 <Textarea
                   id="edit-instructions"
                   value={instructions}
                   onChange={(e) => setInstructions(e.target.value)}
                   placeholder="Instrucciones especiales para el repartidor..."
                   rows={3}
                   className="text-[#1B3C53] placeholder:text-[#456882]"
                 />
               </div>

               <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  className="bg-[#1B3C53] hover:bg-[#123246] text-white"
                  onClick={() => setShowEditDialog(false)}
                >
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