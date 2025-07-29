"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function AnnounceBar() {
  const images = [
    {
      src: "/announce.png",
      alt: "Anuncio Liverpool",
      href: "https://www.liverpool.com.mx"
    },
    {
      src: "/anuncio.png",
      alt: "Anuncio Infinitum",
      href: "https://telmex.com/web/hogar/mkt/home?pqi=PQI43&utm_source=dsp&utm_medium=cpa&utm_campaign=performance&utm_id=ads001&utm_term=150megas_netflix_sincosto_rtg&dclid=CKm43oiaoY4DFV3YGAIdiywFPg&gclid=EAIaIQobChMIp9TPo5mhjgMV0u31Ah13cjJ8EAEYASAAEgKYfvD_BwE"
    },
    {
      src: "/prime.png",
      alt: "Anuncio Prime Video",
      href: "https://www.primevideo.com/detail/0Q0ZD7AIZGM4ISJE4J5T9AF9FA/ref=dvm_pdd_dsp_mx_sc_s_HSOSMXdspaloppostdisp1456h?aref=0BVTxfbXUB"
    }
  ]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className={`fixed left-0 right-0 bottom-0 z-50 transition-all duration-300 bg-white shadow-lg flex flex-col items-center`}>
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between p-2">
          <div className="flex-1 flex items-center justify-center">
            {/* Aquí puedes poner el contenido del anuncio, imagen o texto */}
            <a href={images[current].href} target="_blank" rel="noopener noreferrer">
              <img
                src={images[current].src}
                alt={images[current].alt}
                width={500}
                height={80}
                className="h-12 w-full max-w-xs md:h-20 md:w-[500px] md:max-w-[500px] object-contain"
                style={{
                  animation: 'moveY 1.2s ease-in-out infinite',
                  display: 'block',
                  maxWidth: '500px',
                  maxHeight: '80px',
                }}
              />
            </a>
          </div>
        </div>
      </div>
      <style>{`
      @keyframes moveY {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      `}</style>
    </>
  )
} 