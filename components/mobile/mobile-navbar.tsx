"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Heart, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import storage from "@/lib/storage"
import "./mobile-navbar.css"

export default function MobileNavbar() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const [userFoto, setUserFoto] = useState<string | null>(null)

  useEffect(() => {
    const userData = storage.getUserData()
    const foto = localStorage.getItem("foto") || (userData as any)?.foto || state.userSession?.foto || null
    setUserFoto(foto)
  }, [state.userSession])

  const cartItemsCount = state.cart.length
  const favoritesCount = state.favorites.length

  const handleCartClick = () => {
    if (cartItemsCount > 0) {
      router.push("/checkout")
    }
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

          <Link href="/profile/personal-info" className="mobile-nav-action">
            {userFoto ? (
              <Avatar className="mobile-avatar">
                <AvatarImage src={userFoto} alt="User" />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}

