"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { setNotificationCallback } from "@/lib/notifications"

type NotificationType = "success" | "error" | "warning" | "info"

interface Notification {
  id: string
  message: string
  type: NotificationType
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).substring(7)
    setNotifications((prev) => [...prev, { id, message, type }])

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }, [])

  // Register global callback
  useEffect(() => {
    setNotificationCallback(showNotification)
    return () => {
      setNotificationCallback(null)
    }
  }, [showNotification])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

function NotificationToast({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: {
      bg: "bg-gradient-to-r from-green-50 to-emerald-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-600",
      button: "hover:bg-green-100",
    },
    error: {
      bg: "bg-gradient-to-r from-red-50 to-rose-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
      button: "hover:bg-red-100",
    },
    warning: {
      bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      button: "hover:bg-yellow-100",
    },
    info: {
      bg: "bg-gradient-to-r from-[#F9F3EF] to-[#E8DDD4]",
      border: "border-[#456882]",
      text: "text-[#1B3C53]",
      icon: "text-[#456882]",
      button: "hover:bg-[#E8DDD4]",
    },
  }

  const Icon = icons[notification.type]
  const colorScheme = colors[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-lg shadow-xl p-4 min-w-[320px] max-w-[420px] pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        <div className={`${colorScheme.icon} flex-shrink-0 mt-0.5`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className={`${colorScheme.text} text-sm font-medium leading-relaxed`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${colorScheme.button} ${colorScheme.text} flex-shrink-0 p-1 rounded transition-colors`}
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}

