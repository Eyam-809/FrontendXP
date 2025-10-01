"use client"

import { useState, useRef, useEffect } from "react"
import { ZoomIn } from "lucide-react"

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

export default function ImageZoom({ src, alt, className = "", style = {} }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showZoomIcon, setShowZoomIcon] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setShowZoomIcon(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
    setShowZoomIcon(false)
  }

  const handleClick = () => {
    setIsZoomed(!isZoomed)
  }

  return (
    <div className="relative group">
      <div
        ref={imageRef}
        className={`relative overflow-hidden cursor-zoom-in transition-all duration-300 ${
          isZoomed ? "cursor-zoom-out" : ""
        } ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={style}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-auto object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={{
            transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : "center center",
            maxHeight: "400px"
          }}
        />
        
        {/* Overlay con lupa */}
        {showZoomIcon && !isZoomed && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <ZoomIn className="h-6 w-6 text-gray-700" />
            </div>
          </div>
        )}

        {/* Indicador de zoom activo */}
        {isZoomed && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
            Zoom activo
          </div>
        )}
      </div>

      {/* Instrucciones */}
      {!isZoomed && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pasa el mouse sobre la imagen y haz clic para hacer zoom
        </p>
      )}
    </div>
  )
}
