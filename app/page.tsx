"use client"

import { useEffect, useState } from "react"
import HeroCarousel from "@/components/hero-carousel"
import Navbar from "@/components/navbar"
import CategoryNavbar from "@/components/category-navbar"
import CategorySection from "@/components/category-section"
import ProductGrid from "@/components/product-grid"
import PromoBanner from "@/components/promo-banner"
import Footer from "@/components/footer"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CategoryPanel from "@/components/category-panel"
import CheckoutModal from "@/components/checkout-modal"
import AnnounceBar from "@/components/announce-bar"
import { useApp } from "@/contexts/app-context"
import { products } from "@/data/products"
import { useIsMobile } from "@/hooks/use-mobile"
import FilteredProductsGrid from "@/components/filtered-products-grid"
import AdminView from "@/components/admin-view"
import storage from "@/lib/storage"

export default function Home() {
  const { state, dispatch } = useApp()
  const isMobile = useIsMobile()
  const [planId, setPlanId] = useState<string | null>(null)

  useEffect(() => {
    dispatch({ type: "SET_PRODUCTS", payload: products })
  }, [dispatch])

  // Verificar el plan_id del usuario
  useEffect(() => {
    const getPlanId = () => {
      // Intentar obtener del contexto primero
      const sessionPlanId = state.userSession?.plan_id
      if (sessionPlanId) {
        setPlanId(String(sessionPlanId))
        return
      }
      
      // Si no está en el contexto, obtener de localStorage
      const storedPlanId = storage.getPlanId() || localStorage.getItem("plan_id")
      if (storedPlanId) {
        setPlanId(storedPlanId)
        return
      }
      
      // También verificar en userData
      try {
        const userData = storage.getUserData()
        if (userData && (userData as any).plan_id) {
          setPlanId(String((userData as any).plan_id))
          return
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
      
      setPlanId(null)
    }

    getPlanId()

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      getPlanId()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Verificar periódicamente
    const interval = setInterval(getPlanId, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [state.userSession])

  // Si el usuario tiene plan_id 3, mostrar la vista de admin
  if (planId === "3") {
    return <AdminView />
  }

  // Vista normal para todos los demás usuarios
  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      {/* <CategoryPanel /> */}
      <main className="container mx-auto px-4">
        {state.selectedSubcategory?.id ? (
          <FilteredProductsGrid subcategoryId={state.selectedSubcategory.id} />
        ) : (
          <>
            <HeroCarousel />
            {/* <PromoBanner /> */}
            <ProductGrid />
          </>
        )}
      </main>
      <AnnounceBar />
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      <CheckoutModal onClose={() => {}} />
    </div>
  )
}
