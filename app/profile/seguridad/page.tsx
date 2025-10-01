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

interface UserData {
  name: string
  email: string
  avatar?: string
}

export default function SeguridadPage() {
  const [user, setUser] = useState<UserData | null>(null)
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    if (newPassword.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres")
      return
    }
    
    setIsChangingPassword(true)
    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      alert("Contraseña actualizada exitosamente")
    }, 2000)
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
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/profile">
            <Button variant="outline" className="bg-gray-100 border-gray-300 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguridad</h1>
            <p className="text-gray-600">Configuraciones importantes para mantener tu cuenta segura</p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Key className="h-5 w-5 text-blue-600" />
                <span>Cambiar Contraseña</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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

          {/* Security Settings Card */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Configuraciones de Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {securityFeatures.map((feature) => (
                <div key={feature.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {feature.icon}
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={feature.statusColor}>
                        {feature.status}
                      </Badge>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={feature.onToggle}
                      />
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}

              {/* Session Timeout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Tiempo de sesión</h4>
                      <p className="text-sm text-gray-600">Tiempo de inactividad antes de cerrar sesión</p>
                    </div>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>
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