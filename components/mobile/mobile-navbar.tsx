"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Heart, Bell, User, Settings, LogOut, UserCircle, CreditCard, MapPin, Crown, AlertTriangle, CheckCircle2, CheckCircle, XCircle, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ApiUrl } from "@/lib/config"
import storage from "@/lib/storage"
import "./mobile-navbar.css"

export default function MobileNavbar() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const [userFoto, setUserFoto] = useState<string | null>(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)

  useEffect(() => {
    const userData = storage.getUserData()
    const foto = localStorage.getItem("foto") || (userData as any)?.foto || state.userSession?.foto || null
    setUserFoto(foto)
    
    // Verificar plan_id para acceso de admin (plan_id 3)
    const planId = state.userSession?.plan_id || storage.getPlanId()
    setHasAdminAccess(planId === "3")
  }, [state.userSession])

  const cartItemsCount = state.cart.length
  const favoritesCount = state.favorites.length

  const handleCartClick = () => {
    if (cartItemsCount > 0) {
      router.push("/checkout")
    }
  }

  const handleLogout = () => {
    storage.clearAll()
    dispatch({ type: "CLEAR_USER_SESSION" })
    setUserFoto(null)
    setIsProfileMenuOpen(false)
    window.location.href = "/login"
  }

  return (
    <nav className="mobile-navbar">
      <div className="mobile-navbar-container">
        {/* Logo */}
        <div className="mobile-navbar-top">
          <Link href="/" className="mobile-navbar-logo">
            <img src="/logonuevo.png" alt="XpMarket Logo" className="mobile-navbar-logo-image" />
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <div className="mobile-navbar-search">
          <div className="mobile-search-wrapper">
            <Search className="mobile-search-icon" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="mobile-search-input"
            />
          </div>
        </div>

        {/* Iconos de acción */}
        <div className="mobile-navbar-actions">
          <Link href="/global-chat" className="mobile-nav-action">
            <Bell className="h-5 w-5" />
          </Link>
          
          <button 
            onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })} 
            className="mobile-nav-action"
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <Badge className="mobile-badge">{favoritesCount}</Badge>
            )}
          </button>

          <button 
            onClick={handleCartClick}
            className="mobile-nav-action"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge className="mobile-badge">{cartItemsCount}</Badge>
            )}
          </button>

          {state.userSession ? (
            <Sheet open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
              <SheetTrigger asChild>
                <button className="mobile-nav-action">
                  {userFoto ? (
                    <Avatar className="mobile-avatar">
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
                      <AvatarFallback className="bg-[#456882] text-white text-xs font-bold">
                        {(state.userSession.name || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] max-w-sm bg-[#F9F3EF] p-0">
                <SheetTitle className="sr-only">Menú de Perfil</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Header del perfil */}
                  <div className="bg-gradient-to-r from-[#1B3C53] to-[#456882] p-6 text-white">
                    <div className="flex items-center space-x-3 mb-2">
                      {userFoto ? (
                        <Avatar className="h-12 w-12 border-2 border-white">
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
                          <AvatarFallback className="bg-[#456882] text-white font-bold">
                            {(state.userSession.name || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-lg">
                          {state.userSession.name || "Usuario"}
                        </p>
                        <p className="text-sm text-white/80">Mi cuenta</p>
                      </div>
                    </div>
                  </div>

                  {/* Opciones del menú */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {/* Sección MI PERFIL */}
                    <div className="px-2 py-2 text-xs font-semibold text-[#456882] uppercase tracking-wide">
                      MI PERFIL
                    </div>
                    
                    <Link href="/profile/personal-info" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <User className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Tu información</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/datos-cuenta" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <UserCircle className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Seguimientos de pedidos</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/xpmarket-plus" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <Crown className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">XPmarket+</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/tarjetas" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <CreditCard className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Tarjetas</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/direcciones" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <MapPin className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Direcciones</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/seguridad" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <AlertTriangle className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Seguridad</span>
                      </div>
                    </Link>
                    
                    {/* Opción Validaciones solo para usuarios con plan_id 3 */}
                    {hasAdminAccess && (
                      <Link href="/profile/validaciones" onClick={() => setIsProfileMenuOpen(false)}>
                        <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-[#1B3C53]" />
                          <span className="text-[#1B3C53] font-medium">Validaciones</span>
                        </div>
                      </Link>
                    )}
                    
                    {/* Opciones de productos */}
                    <Link href="/profile/productos-aprobados" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <CheckCircle className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Aprobados</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/productos-rechazados" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <XCircle className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Rechazados</span>
                      </div>
                    </Link>
                    
                    <Link href="/profile/productos-vendidos" onClick={() => setIsProfileMenuOpen(false)}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                        <ShoppingBag className="h-5 w-5 text-[#1B3C53]" />
                        <span className="text-[#1B3C53] font-medium">Vendidos</span>
                      </div>
                    </Link>
                    
                    {/* Separador */}
                    <div className="border-t border-[#E8DDD4] my-2"></div>
                    
                    {/* Panel administrativo */}
                    {hasAdminAccess && (
                      <>
                        <div className="px-2 py-2 text-xs font-semibold text-[#456882] uppercase tracking-wide">
                          PANEL ADMINISTRATIVO
                        </div>
                        <Link href="/admin/dashboard" onClick={() => setIsProfileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-[#E8DDD4] transition-colors">
                            <Settings className="h-5 w-5 text-[#1B3C53]" />
                            <span className="text-[#1B3C53] font-medium">Panel Administrativo</span>
                          </div>
                        </Link>
                        <div className="border-t border-[#E8DDD4] my-2"></div>
                      </>
                    )}
                    
                    {/* Cerrar Sesión */}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link href="/login" className="mobile-nav-action">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

