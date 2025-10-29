"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Smartphone,
  Mail,
  Key,
  AlertTriangle,
  CheckCircle,
  User,
  Bell
} from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface UserData {
  name: string
  email: string
  avatar?: string
}

export default function SeguridadPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Security settings states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("30")

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones cliente (coincidencia y longitud mínima según backend)
    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres")
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }

    setIsChangingPassword(true)
    // limpiar notificaciones previas
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null

      // Payload compatible con tu controlador (Laravel espera new_password y new_password_confirmation)
      const payload = {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      }

      const res = await fetch("http://localhost:8000/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      // Intentar parsear cuerpo de respuesta
      let body: any = {}
      try { body = await res.json() } catch {}

      if (!res.ok) {
        // Extraer mensaje útil si viene en body
        let msg = "No se pudo actualizar la contraseña"
        if (body?.message) msg = body.message
        else if (body?.errors) {
          const first = Object.values(body.errors)[0]
          if (Array.isArray(first)) msg = first[0]
        }
        setErrorMessage(msg)
        // limpiar inputs también cuando la API responde con error (contraseña incorrecta, etc.)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setErrorMessage(null), 5000)
        return
      }

      // Éxito
      setSuccessMessage(body?.message ?? "Contraseña actualizada correctamente")
      setTimeout(() => setSuccessMessage(null), 4000)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Error al cambiar contraseña:", err)
      setErrorMessage("Error de red al cambiar la contraseña")
      // limpiar inputs en caso de error de red
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const securityFeatures = [
    {
      id: "two-factor",
      title: "Autenticación de dos factores",
      description: "Añade una capa extra de seguridad con códigos de verificación",
      icon: <Smartphone className="h-5 w-5 text-[#1B3C53]" />,
      enabled: twoFactorEnabled,
      onToggle: setTwoFactorEnabled,
      status: "Activado",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      id: "email-notifications",
      title: "Notificaciones por email",
      description: "Recibe alertas por email sobre actividades de tu cuenta",
      icon: <Mail className="h-5 w-5 text-purple-600" />,
      enabled: emailNotifications,
      onToggle: setEmailNotifications,
      status: "Activado",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      id: "login-alerts",
      title: "Alertas de inicio de sesión",
      description: "Notificaciones cuando se accede a tu cuenta desde un nuevo dispositivo",
      icon: <Bell className="h-5 w-5 text-orange-600" />,
      enabled: loginAlerts,
      onToggle: setLoginAlerts,
      status: "Activado",
      statusColor: "bg-green-100 text-green-800"
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F3EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#456882]">Cargando configuración de seguridad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F3EF]">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Top Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguridad</h1>
            <p className="text-gray-600">Configuraciones importantes para mantener tu cuenta segura</p>
          </div>
        </div>

        <div className="flex justify-center">
  <Card className="bg-white shadow-md w-full max-w-md">
    <CardHeader>
      <CardTitle className="flex items-center justify-center space-x-2 text-lg">
        <Key className="h-5 w-5 text-blue-600" />
        <span>Cambiar Contraseña</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Notificaciones */}
      {successMessage && (
        <div className="mb-4 flex items-center justify-between bg-green-50 border border-green-200 text-green-900 px-4 py-2 rounded">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-sm text-green-700 underline">Cerrar</button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-900 px-4 py-2 rounded">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-sm text-red-700 underline">Cerrar</button>
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Contraseña actual</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isChangingPassword}
        >
          {isChangingPassword ? "Actualizando..." : "Cambiar Contraseña"}
        </Button>
      </form>
    </CardContent>
  </Card>
</div>


        {/* Security Tips */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Consejos de Seguridad</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa contraseñas únicas y difíciles de adivinar</li>
                  <li>• Nunca compartas tus credenciales de acceso</li>
                  <li>• Activa la autenticación de dos factores</li>
                  <li>• Revisa regularmente las actividades de tu cuenta</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}