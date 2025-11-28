"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function AnnounceBar() {
  const [shouldShow, setShouldShow] = useState(true)
  const streamingAds = [
    {
      brand: "HBO Max",
      title: "🎬 HBO Max",
      content: "Game of Thrones, House of the Dragon y más",
      image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=150&fit=crop",
      href: "https://www.hbomax.com/mx",
      color: "text-white",
      bgColor: "bg-[#FFB800]",
      borderColor: "border-[#FFB800]"
    },
    {
      brand: "Netflix",
      title: "🎭 Netflix",
      content: "Stranger Things, The Crown, series originales",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=150&fit=crop",
      href: "https://www.netflix.com/mx",
      color: "text-white",
      bgColor: "bg-[#FFB800]",
      borderColor: "border-[#FFB800]"
    },
    {
      brand: "Disney+",
      title: "🏰 Disney+",
      content: "Marvel, Star Wars, Pixar y contenido familiar",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=150&fit=crop",
      href: "https://www.disneyplus.com/mx",
      color: "text-white",
      bgColor: "bg-[#FFB800]",
      borderColor: "border-[#FFB800]"
    },
    {
      brand: "Prime Video",
      title: "📺 Prime Video",
      content: "The Boys, The Marvelous Mrs. Maisel y más",
      image: "https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=300&h=150&fit=crop",
      href: "https://www.primevideo.com",
      color: "text-white",
      bgColor: "bg-[#FFB800]",
      borderColor: "border-[#FFB800]"
    },
    {
      brand: "Apple TV+",
      title: "🍎 Apple TV+",
      content: "Ted Lasso, The Morning Show, contenido premium",
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=150&fit=crop",
      href: "https://tv.apple.com/mx",
      color: "text-white",
      bgColor: "bg-[#FFB800]",
      borderColor: "border-[#FFB800]"
    },
    {
      brand: "Paramount+",
      title: "⭐ Paramount+",
      content: "Star Trek, Yellowstone, series exclusivas",
      image: "https://images.unsplash.com/photo-1489599909759-9a0f2b4b0a6b?w=300&h=150&fit=crop",
      href: "https://www.paramountplus.com/mx",
      color: "text-white",
      bgColor: "bg-[#FFB800]",
      borderColor: "border-[#FFB800]"
    }
  ]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    // Verificar el plan del usuario en localStorage
    const checkUserPlan = () => {
      try {
        const plan_id = localStorage.getItem("plan_id")
        // Si el plan_id es "2", no mostrar la barra de anuncios
        if (plan_id === "2") {
          setShouldShow(false)
          return
        }
        setShouldShow(true)
      } catch (error) {
        console.error('Error al verificar el plan del usuario:', error)
        setShouldShow(true)
      }
    }

    checkUserPlan()

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      checkUserPlan()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (!shouldShow) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % streamingAds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [shouldShow])

  // No mostrar la barra de anuncios si el usuario tiene plan ID 2
  if (!shouldShow) {
    return null
  }

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent`}>
        <div className="container mx-auto px-2 md:px-4 py-1 md:py-2">
          <div className="flex items-center justify-center">
            {/* Anuncios de streaming */}
            <a 
              href={streamingAds[current].href} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block bg-gradient-to-r from-[#FF5E00] to-[#FF7A00] border border-[#FFB800] rounded-xl shadow-lg p-2 md:p-3 max-w-4xl w-full hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
            >
              <div className="flex items-center space-x-2 md:space-x-6">
                {/* Imagen de la serie */}
                <div className="flex-shrink-0">
                  <img
                    src={streamingAds[current].image}
                    alt={streamingAds[current].brand}
                    className="w-12 h-8 md:w-16 md:h-10 rounded-lg object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
                
                {/* Contenido del anuncio */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-xs md:text-base ${streamingAds[current].color} mb-0.5 md:mb-1 truncate`}>
                    {streamingAds[current].title}
                  </h3>
                  <p className="text-xs md:text-sm text-white leading-tight md:leading-relaxed mb-0.5 md:mb-1 line-clamp-2">
                    {streamingAds[current].content}
                  </p>
                  <div className={`text-xs md:text-sm font-medium ${streamingAds[current].color} flex items-center`}>
                    <span className="mr-1 md:mr-2">🎬</span>
                    <span className="hidden md:inline">DISFRUTA AHORA</span>
                    <span className="md:hidden">VER</span>
                  </div>
                </div>
                
                {/* Botón de acción */}
                <div className="flex-shrink-0 hidden md:block">
                  <div className={`${streamingAds[current].bgColor} ${streamingAds[current].borderColor} border-2 rounded-lg px-4 md:px-6 py-1.5 md:py-2 text-center`}>
                    <div className={`text-xs md:text-sm font-bold ${streamingAds[current].color}`}>
                      VER
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  )
} 