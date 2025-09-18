"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function AnnounceBar() {
  const streamingAds = [
    {
      brand: "HBO Max",
      title: "🎬 HBO Max",
      content: "Game of Thrones, House of the Dragon y más",
      image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=150&fit=crop",
      href: "https://www.hbomax.com/mx",
      color: "text-[#1B3C53]",
      bgColor: "bg-[#E8DDD4]",
      borderColor: "border-[#456882]"
    },
    {
      brand: "Netflix",
      title: "🎭 Netflix",
      content: "Stranger Things, The Crown, series originales",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=150&fit=crop",
      href: "https://www.netflix.com/mx",
      color: "text-[#1B3C53]",
      bgColor: "bg-[#E8DDD4]",
      borderColor: "border-[#456882]"
    },
    {
      brand: "Disney+",
      title: "🏰 Disney+",
      content: "Marvel, Star Wars, Pixar y contenido familiar",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=150&fit=crop",
      href: "https://www.disneyplus.com/mx",
      color: "text-[#1B3C53]",
      bgColor: "bg-[#E8DDD4]",
      borderColor: "border-[#456882]"
    },
    {
      brand: "Prime Video",
      title: "📺 Prime Video",
      content: "The Boys, The Marvelous Mrs. Maisel y más",
      image: "https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=300&h=150&fit=crop",
      href: "https://www.primevideo.com",
      color: "text-[#1B3C53]",
      bgColor: "bg-[#E8DDD4]",
      borderColor: "border-[#456882]"
    },
    {
      brand: "Apple TV+",
      title: "🍎 Apple TV+",
      content: "Ted Lasso, The Morning Show, contenido premium",
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=150&fit=crop",
      href: "https://tv.apple.com/mx",
      color: "text-[#1B3C53]",
      bgColor: "bg-[#E8DDD4]",
      borderColor: "border-[#456882]"
    },
    {
      brand: "Paramount+",
      title: "⭐ Paramount+",
      content: "Star Trek, Yellowstone, series exclusivas",
      image: "https://images.unsplash.com/photo-1489599909759-9a0f2b4b0a6b?w=300&h=150&fit=crop",
      href: "https://www.paramountplus.com/mx",
      color: "text-[#1B3C53]",
      bgColor: "bg-[#E8DDD4]",
      borderColor: "border-[#456882]"
    }
  ]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % streamingAds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            {/* Anuncios de streaming */}
            <a 
              href={streamingAds[current].href} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block bg-[#F9F3EF] border border-[#E8DDD4] rounded-xl shadow-lg p-3 max-w-4xl w-full hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
            >
              <div className="flex items-center space-x-6">
                {/* Imagen de la serie */}
                <div className="flex-shrink-0">
                  <img
                    src={streamingAds[current].image}
                    alt={streamingAds[current].brand}
                    className="w-16 h-10 rounded-lg object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
                
                {/* Contenido del anuncio */}
                <div className="flex-1">
                  <h3 className={`font-bold text-base ${streamingAds[current].color} mb-1`}>
                    {streamingAds[current].title}
                  </h3>
                  <p className="text-sm text-[#456882] leading-relaxed mb-1">
                    {streamingAds[current].content}
                  </p>
                  <div className={`text-sm font-medium ${streamingAds[current].color} flex items-center`}>
                    <span className="mr-2">🎬</span>
                    DISFRUTA AHORA
                  </div>
                </div>
                
                {/* Botón de acción */}
                <div className="flex-shrink-0">
                  <div className={`${streamingAds[current].bgColor} ${streamingAds[current].borderColor} border-2 rounded-lg px-6 py-2 text-center`}>
                    <div className={`text-sm font-bold ${streamingAds[current].color}`}>
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