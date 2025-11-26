import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      // Detectar móvil por ancho de pantalla
      const isWidthMobile = width < MOBILE_BREAKPOINT
      
      // Detectar móvil por user agent (incluye modo desarrollador con device toolbar)
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isUserAgentMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      
      // Detectar si está en modo desarrollador con device toolbar activo
      // Los navegadores modernos cambian el user agent cuando se activa el device toolbar
      const isDeviceToolbar = width <= MOBILE_BREAKPOINT || isUserAgentMobile
      
      setIsMobile(isWidthMobile || isDeviceToolbar)
    }

    // Verificar inicialmente
    checkMobile()

    // Usar matchMedia para mejor rendimiento
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = () => {
      checkMobile()
    }
    
    // Escuchar cambios en el tamaño de ventana
    window.addEventListener("resize", checkMobile, { passive: true })
    
    // Escuchar cambios en matchMedia
    if (mql.addEventListener) {
      mql.addEventListener("change", handleChange)
    } else {
      // Fallback para navegadores antiguos
      mql.addListener(handleChange)
    }
    
    // Verificar periódicamente (útil para cambios en modo desarrollador)
    const interval = setInterval(checkMobile, 500)

    return () => {
      window.removeEventListener("resize", checkMobile)
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleChange)
      } else {
        mql.removeListener(handleChange)
      }
      clearInterval(interval)
    }
  }, [])

  return !!isMobile
}
