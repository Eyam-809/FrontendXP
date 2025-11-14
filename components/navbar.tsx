"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search, ShoppingCart, Heart, Bell, Menu, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useApp } from "@/contexts/app-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ApiUrl } from "@/lib/config"
import { Settings, LogOut, Shield, UserCircle, BarChart3, Package, TrendingUp, Warehouse, User, CreditCard, MapPin, Crown, AlertTriangle } from "lucide-react"
import storage from "@/lib/storage"

const categories = [
  { name: "Electronics", subcategories: ["Smartphones", "Laptops", "Headphones", "Cameras"] },
  { name: "Fashion", subcategories: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories"] },
  { name: "Home", subcategories: ["Kitchen", "Bedroom", "Living Room", "Garden"] },
  { name: "Sports", subcategories: ["Fitness", "Outdoor", "Team Sports", "Water Sports"] },
  { name: "Beauty", subcategories: ["Skincare", "Makeup", "Hair Care", "Fragrances"] },
  { name: "Toys", subcategories: ["Educational", "Action Figures", "Board Games", "Outdoor Toys"] },
]

const translateCategory = (category: string) => {
  const translations: Record<string, string> = {
    Electronics: "Electrónicos",
    Fashion: "Moda",
    Home: "Hogar",
    Sports: "Deportes",
    Beauty: "Belleza",
    Toys: "Juguetes",
  }
  return translations[category] || category
}



export default function Navbar() {
  const { state, dispatch } = useApp()
  const [searchInput, setSearchInput] = useState("")
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasGlobalChatAccess, setHasGlobalChatAccess] = useState(false);

  const handleResetFilters = () => {
  dispatch({ type: "SET_SELECTED_CATEGORY", payload: null })
  dispatch({ type: "SET_SELECTED_SUBCATEGORY", payload: null })
  dispatch({ type: "SET_SEARCH_QUERY", payload: "" })
  //dispatch({ type: "TOGGLE_CATEGORY_PANEL", payload: true }) // opcional, cierra panel
}


  const [user, setUser] = useState<{
    email: string
    name: string
    role: "user" | "admin"
    avatar: string
    isLoggedIn: boolean
  } | null>(null)
  const [userFoto, setUserFoto] = useState<string | null>(null)

  useEffect(() => {
    const userData = storage.getUserData()
    if (userData) setUser(userData as any)
    
    // Obtener la foto del usuario
    const foto = localStorage.getItem("foto")
    const userDataWithFoto = userData as any
    const fotoFromUserData = userDataWithFoto?.foto || userDataWithFoto?.avatar || userDataWithFoto?.photo
    
    // Prioridad: foto del localStorage > foto del userData > foto del userSession
    const finalFoto = foto || fotoFromUserData || state.userSession?.foto || null
    setUserFoto(finalFoto)
    
    if (typeof window !== "undefined") {
      // Si guardas role dentro de userData o userSession, ajústalo aquí
      const sess = storage.getUserSession()
      setIsAdmin(sess?.role === "admin" || storage.getUserData()?.role === "admin")
      
      // Verificar plan_id para acceso al chat global
      const planId = storage.getPlanId()
      setHasGlobalChatAccess(planId === "2")
    }
  }, [state.userSession])
  
  useEffect(() => {
    // Verificar plan_id cuando cambie el userSession del contexto
    const planId = state.userSession?.plan_id || storage.getPlanId()
    setHasGlobalChatAccess(planId === "2")
    
    // Actualizar la foto cuando cambie el userSession
    const foto = localStorage.getItem("foto")
    const userData = storage.getUserData() as any
    const fotoFromUserData = userData?.foto || userData?.avatar || userData?.photo
    const finalFoto = foto || fotoFromUserData || state.userSession?.foto || null
    setUserFoto(finalFoto)
  }, [state.userSession])
  
  // Función para actualizar la foto desde múltiples fuentes
  const updateUserFoto = useCallback(() => {
    // Si no hay sesión, limpiar la foto
    if (!state.userSession) {
      setUserFoto(null)
      return
    }
    
    const foto = localStorage.getItem("foto")
    const userData = storage.getUserData() as any
    const fotoFromUserData = userData?.foto || userData?.avatar || userData?.photo
    const fotoFromSession = state.userSession?.foto
    
    // Prioridad: foto del userSession > foto del localStorage > foto del userData
    const finalFoto = fotoFromSession || foto || fotoFromUserData || null
    setUserFoto(finalFoto)
  }, [state.userSession])
  
  // Escuchar cambios en localStorage y eventos personalizados
  useEffect(() => {
    // Función para manejar cambios de storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'foto' || e.key === 'userData' || e.key === 'userSession') {
        updateUserFoto()
      }
    }
    
    // Función para manejar el evento personalizado de actualización de foto
    const handleFotoUpdated = (e: CustomEvent) => {
      if (e.detail?.foto) {
        setUserFoto(e.detail.foto)
      } else {
        updateUserFoto()
      }
    }
    
    // Escuchar cambios en localStorage (entre pestañas)
    window.addEventListener('storage', handleStorageChange)
    
    // Escuchar evento personalizado (misma pestaña)
    window.addEventListener('fotoUpdated', handleFotoUpdated as EventListener)
    
    // También verificar periódicamente (por si el cambio es en la misma pestaña)
    const interval = setInterval(updateUserFoto, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('fotoUpdated', handleFotoUpdated as EventListener)
      clearInterval(interval)
    }
  }, [updateUserFoto])

  const handleLogout = () => {
  storage.clearAll()
  dispatch({ type: "CLEAR_USER_SESSION" })
  setUser(null)
  setUserFoto(null) // Limpiar la foto al cerrar sesión
  window.location.href = "/login"
}


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: "SET_SEARCH_QUERY", payload: searchInput })
  }

  const handleCategoryClick = (categoryName: string) => {
    dispatch({ type: "SET_SELECTED_CATEGORY", payload: { id: 0, name: categoryName } })
    dispatch({ type: "SET_SELECTED_SUBCATEGORY", payload: null })
    dispatch({ type: "TOGGLE_CATEGORY_PANEL" })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1B3C53] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-[#F9F3EF]">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#1B3C53] p-0 w-1/2 max-w-xs">
                <nav className="flex flex-col gap-2 text-[#F9F3EF] px-4 py-6">
                  <Link href="/" className="text-base md:text-lg font-medium hover:text-[#D2C1B6] transition-colors py-2">
                    Inicio
                  </Link>
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className="text-base md:text-lg font-medium hover:text-[#D2C1B6] transition-colors text-left py-2"
                    >
                      {translateCategory(category.name)}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center" onClick={handleResetFilters}>
              <img src="/logonuevo.png" alt="XpMarket Logo" className="h-16 w-auto ml-2 md:h-32 md:ml-0 transition-all duration-200" />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 mx-6">
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
              <Input
                type="search"
                placeholder="Buscar productos, marcas y más..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-md border-0 focus-visible:ring-[#D2C1B6]"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-0 top-0 h-full bg-[#456882] hover:bg-[#1B3C53] rounded-l-none"
              >
                <Search className="h-4 w-4 text-[#F9F3EF]" />
                <span className="sr-only">Buscar</span>
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-2">
            {state.userSession ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex text-[#F9F3EF] hover:text-[#D2C1B6] transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notificaciones</span>
                </Button>
                {/* Botón Chat Global solo si NO es admin y tiene plan_id = 2 */}
                {!isAdmin && hasGlobalChatAccess && (
                  <Link href="/global-chat">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#F9F3EF] hover:text-[#D2C1B6] transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="sr-only">Chat Global</span>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#F9F3EF] hover:text-[#D2C1B6] transition-colors relative"
                  onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
                >
                  <Heart className="h-5 w-5" />
                  {state.favorites.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#456882] text-[#F9F3EF] text-xs">
                      {state.favorites.length}
                    </Badge>
                  )}
                  <span className="sr-only">Favoritos</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#F9F3EF] hover:text-[#D2C1B6] transition-colors relative"
                  onClick={() => dispatch({ type: "TOGGLE_CART" })}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {state.cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#456882] text-[#F9F3EF] text-xs">
                      {state.cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                  <span className="sr-only">Carrito</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-[#F9F3EF] hover:text-[#456882] transition-colors h-auto p-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          {userFoto ? (
                            <AvatarImage
                              src={
                                userFoto.startsWith("data:image")
                                  ? userFoto
                                  : userFoto.startsWith("http")
                                  ? userFoto
                                  : `${ApiUrl}/storage/${userFoto}`
                              }
                              alt={state.userSession.name || "Usuario"}
                            />
                          ) : null}
                          <AvatarFallback className="bg-[#456882] text-[#F9F3EF] text-sm font-bold">
                            {(state.userSession.name || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">
                            {state.userSession.name ? state.userSession.name : "Usuario"}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    {/* Opciones del perfil */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      MI PERFIL
                    </div>
                    
                    <Link href="/profile/personal-info">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Tu información</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/profile/datos-cuenta">
                      <DropdownMenuItem>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Seguimientos de pedidos</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/profile/xpmarket-plus">
                      <DropdownMenuItem>
                        <Crown className="mr-2 h-4 w-4" />
                        <span>XPmarket+</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/profile/tarjetas">
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Tarjetas</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/profile/direcciones">
                      <DropdownMenuItem>
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Direcciones</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/profile/seguridad">
                      <DropdownMenuItem>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Seguridad</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Panel administrativo */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      PANEL ADMINISTRATIVO
                    </div>
                    
                    <Link href="/admin/dashboard">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Panel Administrativo</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="text-[#F9F3EF] hover:text-[#D2C1B6] transition-colors">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Cuenta</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="md:hidden flex mt-2 pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="search"
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-4 pr-10 py-1 rounded-md border-0 focus-visible:ring-[#D2C1B6]"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-0 top-0 h-full bg-[#456882] hover:bg-[#1B3C53] rounded-l-none"
            >
              <Search className="h-4 w-4 text-[#F9F3EF]" />
              <span className="sr-only">Buscar</span>
            </Button>
          </form>
        </div>

        <nav className="hidden md:flex space-x-6 pb-2 text-sm text-[#F9F3EF]">
        </nav>
      </div>
    </header>
  )
}
