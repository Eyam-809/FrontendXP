"use client"

import Navbar from "@/components/navbar"
import CartSidebar from "@/components/cart-sidebar"
import FavoritesSidebar from "@/components/favorites-sidebar"
import CheckoutModal from "@/components/checkout-modal"

export default function AdminView() {
  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <CartSidebar />
      <FavoritesSidebar />
      <CheckoutModal onClose={() => {}} />
    </div>
  )
}

