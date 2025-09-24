"use client"

import { useEffect } from "react"
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

export default function Home() {
  const { dispatch } = useApp()
  const isMobile = useIsMobile();

  useEffect(() => {
    dispatch({ type: "SET_PRODUCTS", payload: products })
  }, [dispatch])

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <CategoryNavbar />
      <CategoryPanel />
      <main className="container mx-auto px-4">
        <HeroCarousel />
        {/* <PromoBanner /> */}
        <ProductGrid />
      </main>
      <AnnounceBar />
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      <CheckoutModal onClose={() => {}} />
    </div>
  )
}
