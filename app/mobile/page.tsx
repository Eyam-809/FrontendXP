"use client"

import { useEffect } from "react"
import MobileNavbar from "@/components/mobile/mobile-navbar"
import MobileProductGrid from "@/components/mobile/mobile-product-grid"
import MobileHeroCarousel from "@/components/mobile/mobile-hero-carousel"
import { useApp } from "@/contexts/app-context"
import { products } from "@/data/products"
import FilteredProductsGrid from "@/components/filtered-products-grid"
import AnnounceBar from "@/components/announce-bar"
import Footer from "@/components/footer"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
// import CheckoutModal from "@/components/checkout-modal" // Importante para la API, no eliminar
import "./mobile-page.css"

export default function MobileHomePage() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    dispatch({ type: "SET_PRODUCTS", payload: products })
  }, [dispatch])

  return (
    <div className="mobile-page">
      <MobileNavbar />
      <main className="mobile-main">
        {state.selectedSubcategory?.id ? (
          <FilteredProductsGrid subcategoryId={state.selectedSubcategory.id} />
        ) : (
          <>
            <MobileHeroCarousel />
            <MobileProductGrid />
          </>
        )}
      </main>
      <AnnounceBar />
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      {/* <CheckoutModal onClose={() => {}} /> */}
      {/* CheckoutModal comentado - ahora se usa la página /checkout en su lugar. Importante para la API, no eliminar */}
    </div>
  )
}

