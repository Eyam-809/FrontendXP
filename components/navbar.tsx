"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, User, Heart, Bell, Menu, Globe } from "lucide-react"
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
import { Settings, LogOut, Shield, UserCircle, BarChart3, Package, TrendingUp, Warehouse } from "lucide-react"

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

  const [user, setUser] = useState<{
    email: string
    name: string
    role: "user" | "admin"
    avatar: string
    isLoggedIn: boolean
  } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("role") === "admin");
    }
  }, [])

  const handleLogout = () => {
  localStorage.clear()  // Limpia todo el localStorage
  dispatch({ type: "CLEAR_USER_SESSION" })
  setUser(null)
  window.location.href = "/login" // Redirige a login
}


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: "SET_SEARCH_QUERY", payload: searchInput })
  }

  const handleCategoryClick = (categoryName: string) => {
    dispatch({ type: "SET_SELECTED_CATEGORY", payload: categoryName })
    dispatch({ type: "TOGGLE_CATEGORY_PANEL" })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#be0c0c] to-[#8B0000] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-gradient-to-b from-[#be0c0c] to-[#8B0000] p-0 w-1/2 max-w-xs">
                <nav className="flex flex-col gap-2 text-white px-4 py-6">
                  <Link href="/" className="text-base md:text-lg font-medium hover:text-yellow-300 transition-colors py-2">
                    Inicio
                  </Link>
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className="text-base md:text-lg font-medium hover:text-yellow-300 transition-colors text-left py-2"
                    >
                      {translateCategory(category.name)}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center">
              <img src="/sinfondo.png" alt="XpMarket Logo" className="h-12 w-auto ml-2 md:h-24 md:ml-0 transition-all duration-200" />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 mx-6">
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
              <Input
                type="search"
                placeholder="Buscar productos, marcas y más..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-md border-0 focus-visible:ring-yellow-400"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-0 top-0 h-full bg-yellow-400 hover:bg-yellow-500 rounded-l-none"
              >
                <Search className="h-4 w-4 text-gray-800" />
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
                  className="hidden md:flex text-white hover:text-yellow-300 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notificaciones</span>
                </Button>
                {/* Botón Chat Global solo si NO es admin */}
                {!isAdmin && (
                  <Link href="/global-chat">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-yellow-300 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="sr-only">Chat Global</span>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-yellow-300 transition-colors relative"
                  onClick={() => dispatch({ type: "TOGGLE_FAVORITES" })}
                >
                  <Heart className="h-5 w-5" />
                  {state.favorites.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                      {state.favorites.length}
                    </Badge>
                  )}
                  <span className="sr-only">Favoritos</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-yellow-300 transition-colors relative"
                  onClick={() => dispatch({ type: "TOGGLE_CART" })}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {state.cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                      {state.cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                  <span className="sr-only">Carrito</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-yellow-300 transition-colors h-auto p-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-yellow-400 text-black text-sm font-bold">
                          {(state.userSession.name || "U")[0].toUpperCase()}
                        </div>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">
                            {state.userSession.name ? state.userSession.name : (state.userSession.email || "Usuario")}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </DropdownMenuItem>
                    </Link>
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
                <Button variant="ghost" size="icon" className="text-white hover:text-yellow-300 transition-colors">
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
              className="w-full pl-4 pr-10 py-1 rounded-md border-0 focus-visible:ring-yellow-400"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-0 top-0 h-full bg-yellow-400 hover:bg-yellow-500 rounded-l-none"
            >
              <Search className="h-4 w-4 text-gray-800" />
              <span className="sr-only">Buscar</span>
            </Button>
          </form>
        </div>

        <nav className="hidden md:flex space-x-6 pb-2 text-sm text-white">
        </nav>
      </div>
    </header>
  )
}
