"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Eliminar elemento?",
  description = "Esta acción no se puede deshacer. El elemento será eliminado permanentemente.",
  itemName,
  isLoading = false
}: DeleteConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      // Restaurar scroll del body
      document.body.style.overflow = 'unset'
      // Esperar a que termine la animación antes de ocultar
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-all duration-200 ease-in-out",
        isAnimating 
          ? "opacity-100 backdrop-blur-sm" 
          : "opacity-0 backdrop-blur-none"
      )}
      onClick={handleOverlayClick}
    >
      {/* Overlay con gradiente */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md transform transition-all duration-200 ease-out",
          "bg-card border border-border rounded-xl shadow-2xl",
          isAnimating 
            ? "scale-100 translate-y-0 opacity-100" 
            : "scale-95 translate-y-4 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {title}
              </h3>
              {itemName && (
                <p className="text-sm text-muted-foreground">
                  "{itemName}"
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground hover:bg-muted"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 p-6 pt-4 bg-muted/30 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border-border text-muted-foreground hover:bg-muted hover:text-card-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                <span>Eliminando...</span>
              </div>
            ) : (
              "Eliminar"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

