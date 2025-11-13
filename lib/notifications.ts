// Helper function to show notifications globally
// This replaces window.alert() with our custom notification system

let notificationCallback: ((message: string, type?: "success" | "error" | "warning" | "info") => void) | null = null

export function setNotificationCallback(
  callback: (message: string, type?: "success" | "error" | "warning" | "info") => void
) {
  notificationCallback = callback
}

export function showNotification(message: string, type?: "success" | "error" | "warning" | "info") {
  if (notificationCallback) {
    notificationCallback(message, type || "info")
  } else {
    // Fallback to console if notification system is not initialized
    console.log(`[${type || "info"}] ${message}`)
  }
}

// Global alert replacement
if (typeof window !== "undefined") {
  const originalAlert = window.alert
  window.alert = function (message: string) {
    // Try to use our notification system
    if (notificationCallback) {
      notificationCallback(message, "info")
    } else {
      // Fallback to original alert if notification system is not ready
      originalAlert.call(window, message)
    }
  }
}

