"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Facebook, Github, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useApp } from "@/contexts/app-context"
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { storage } from "@/lib/storage"

export default function LoginPage() {
  const router = useRouter()
  const { dispatch } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [emailR, setEmailR] = useState("");
  const [passwordR, setPasswordR] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [telefono, setTelefono] = useState(""); // Nuevo estado para teléfono
  const [direccion, setDireccion] = useState(""); // Nuevo estado para dirección
  const [message, setMessage] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  //const [errors, setErrors] = useState({});
   //PLANES
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [planes, setPlanes] = useState<Array<{id: number, nombre: string, descripcion: string}>>([]);// Inicializa useNavigate

  // Función para abrir el modal de términos y condiciones
  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  // Form validation state
  const [errors, setErrors] = useState({
    login: {
      email: "",
      password: "",
    },
    register: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: "",
    },
  })
 //Login
const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    axios
  .post("https://backendxp-1.onrender.com/api/login", { email, password })
  .then((response) => {
    console.log("Usuario autenticado:", response.data); // Verifica la respuesta completa
    
    const { token, user: apiUser } = response.data; // Desestructuración para mayor claridad

    // Guarda el token
    localStorage.setItem("token", token);
    
    // Guarda todos los datos del usuario
    const userData = response.data.user;
    localStorage.setItem("userData", JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.telefono,
      address: userData.direccion,
      plan_id: userData.plan_id,
      foto: userData.foto,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      email_verified_at: userData.email_verified_at,
      // Datos por defecto para campos que no existen en la BD
      rating: 4.8,
      totalProducts: 12,
      totalSales: 45,
      joinDate: userData.created_at
      
    }));

    // También guarda datos individuales para compatibilidad
    localStorage.setItem("user_id", userData.id);
    localStorage.setItem("plan_id", userData.plan_id);
    localStorage.setItem("name", userData.name);

    console.log("Datos guardados en localStorage:", localStorage.getItem('userData'));
    
    // Actualizar el contexto inmediatamente
    storage.setToken(token)
    storage.setUserData(apiUser)
    storage.setUserSession({
      token,
      user_id: apiUser.id,
      name: apiUser.name,
      role: apiUser.role,
      foto: apiUser.foto
    })
    dispatch({ type: "SET_USER_SESSION", payload: { token, user_id: apiUser.id, name: apiUser.name, foto: apiUser.foto, plan_id: apiUser.plan_id } })
    
    setIsLoading(false);

    setTimeout(() => {
      router.push("/");
    }, 2000); // Reducido de 20 segundos a 2 segundos
  })
    .catch((error) => {
       setIsLoading(false);
    console.error("❌ Error en login:", error);
    if (error.response) {
      console.error("📨 Mensaje del backend:", error.response.data.message);
      setError("Correo Electrónico o Contraseña incorrecta, inténtalo de nuevo");
      // Limpiar los campos de entrada
      setEmail("");
      setPassword("");
    } else {
      console.error("⚠️ Error inesperado:", error.message);
      setError("Correo Electrónico o Contraseña incorrecta, inténtalo de nuevo");
      // Limpiar los campos de entrada
      setEmail("");
      setPassword("");
    }
  });
  };

  // Maneja el envío del formulario
  const handleRegister = async (e:React.FormEvent) => {
    e.preventDefault();
    setIsRegister(true);

    // Verificar si los campos están vacíos
    if (!name || !emailR || !passwordR || !password_confirmation) {
        //setErrors({ general: 'Por favor, complete todos los campos obligatorios' });
        return;
    }

    // Verificar que se hayan aceptado los términos y condiciones
    if (!registerForm.agreeTerms) {
        setErrors(prev => ({
            ...prev,
            register: {
                ...prev.register,
                agreeTerms: 'Debe aceptar los términos y condiciones para continuar'
            }
        }));
        setIsRegister(false);
        return;
    }

    const datos = {
        name,
        email: emailR,
        password: passwordR,
        password_confirmation,
        telefono, // Ahora está definido
        direccion,  // Ahora está definido
        plan_id: parseInt(planSeleccionado)

    };
    setIsRegister(false);
    try {
      const response = await axios.post('https://backendxp-1.onrender.com/api/registros', datos);

        setMessage(response.data.message);
        //setErrors({});
        
        // Redirigir a la página de verificación con el número de teléfono
        router.push(`/verification?phone=${encodeURIComponent(telefono)}&email=${encodeURIComponent(emailR)}`);
    } catch (error) {
        setIsRegister(false);
    }
};

useEffect(() => {
    // Llama al backend para obtener los planes
    fetch('https://backendxp-1.onrender.com/api/plan')
      .then((response) => response.json())
      .then((data) => {
        setPlanes(data); // Guardamos los planes en el estado
      })
      .catch((error) => {
        console.error("Error al obtener los planes:", error);
      });
  }, []);

  // Detectar si viene de verificación exitosa
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setVerificationSuccess(true);
      setSuccessMessage('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F3EF] to-[#E8DDD4] flex flex-col">
      <header className="bg-gradient-to-r from-[#1B3C53] to-[#456882] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-center"> {/* Centrado y más alto */}
            <Link href="/" className="flex items-center">
              <img
                src="/logonuevo.png"
                alt="XpMarket Logo"
                className="h-40 w-auto" // Más grande: h-20
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#1B3C53] to-[#456882] p-6 text-center">
              <h1 className="text-2xl font-bold text-white">Bienvenido de Nuevo</h1>
              <p className="text-white/90 mt-2">Inicia sesión para acceder a tu cuenta</p>
            </div>

            <Tabs defaultValue="login" className="p-6">
              <TabsList className="grid grid-cols-2 mb-6 bg-[#E8DDD4]">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53] font-medium"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-[#1B3C53] data-[state=active]:text-[#F9F3EF] text-[#1B3C53] font-medium"
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="email" className="text-[#1B3C53] font-medium">Correo Electrónico</Label>
                    <Input
                      className="text-[#1B3C53] placeholder:text-[#456882]"
                      type="email"
                      value={email}
                      placeholder="user@gmail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {errors.login.email && <p className="text-red-500 text-sm">{errors.login.email}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="password" className="text-[#1B3C53] font-medium">Contraseña</Label>
                    <div className="relative">
                      <Input
                         className="text-[#1B3C53] placeholder:text-[#456882]"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          placeholder="*******"
                          onChange={(e) => setPassword(e.target.value)}
                          required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#456882] hover:text-[#1B3C53]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.login.password && <p className="text-red-500 text-sm">{errors.login.password}</p>}
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-1">{error}</span>
                      </div>
                    )}
                    {verificationSuccess && successMessage && (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">¡Éxito!</strong>
                        <span className="block sm:inline ml-1">{successMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm({ ...loginForm, rememberMe: checked as boolean })}
                      />
                       <Label htmlFor="remember-me" className="text-sm text-[#1B3C53] font-medium">
                         Recordarme
                       </Label>
                    </div>
                    <Link href="#" className="text-sm text-[#1B3C53] hover:text-[#456882]">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#456882] hover:to-[#1B3C53] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-[#456882]">O continuar con</span>
                    </div>
                  </div>

                   <div className="grid grid-cols-3 gap-3">
                    {/*GitHub*/}
                     <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-[#E8DDD4] border-2 border-[#E8DDD4] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-[#F9F3EF] font-medium transition-all duration-200"
                      onClick={() => {
                        window.location.href = "https://backendxp-1.onrender.com/api/login/github";
                      }}
                    >
                      <Github size={18} className="mr-2 text-[#181717] group-hover:text-[#F9F3EF]" />
                      <span className="sr-only md:not-sr-only md:text-xs md:truncate">GitHub</span>
                    </Button>



                     {/*Google*/}
                     <Button 
                      type="button"
                      variant="outline" 
                      className="w-full bg-[#E8DDD4] border-2 border-[#E8DDD4] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-[#F9F3EF] font-medium transition-all duration-200" 
                      onClick={() => {
                          // Abre el endpoint de login de Google
                          window.location.href = "https://backendxp-1.onrender.com/api/login/google";
                      }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        width="20"
                        height="20"
                        className="mr-2"
                      >
                        <path fill="#4285F4" d="M24 9.5c3.54 0 6 1.54 7.38 2.83l5.4-5.4C33.64 4.5 29.18 2 24 2 14.82 2 7.09 7.92 4.3 16.01l6.91 5.36C12.64 14.94 17.88 9.5 24 9.5z"/>
                        <path fill="#34A853" d="M46.14 24.5c0-1.57-.14-3.08-.41-4.5H24v8.51h12.42c-.54 2.77-2.15 5.1-4.6 6.65l7.09 5.5c4.14-3.82 7.23-9.43 7.23-16.16z"/>
                        <path fill="#FBBC05" d="M11.21 28.86c-.48-1.41-.76-2.92-.76-4.36s.27-2.95.76-4.36l-6.91-5.36C2.77 17.58 2 20.7 2 24s.77 6.42 2.3 9.22l6.91-5.36z"/>
                        <path fill="#EA4335" d="M24 46c6.48 0 11.91-2.14 15.88-5.82l-7.09-5.5c-2 1.35-4.56 2.17-8.79 2.17-6.12 0-11.36-5.44-12.79-12.35l-6.91 5.36C7.09 40.08 14.82 46 24 46z"/>
                      </svg>
                       <span className="sr-only md:not-sr-only md:text-xs md:truncate">Google</span>
                     </Button>

                    {/*Microsoft*/}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-[#E8DDD4] border-2 border-[#E8DDD4] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-[#F9F3EF] font-medium transition-all duration-200"
                      onClick={() => {
                        window.location.href = "https://backendxp-1.onrender.com/api/login/microsoft"
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 23 23"
                        width="18"
                        height="18"
                        className="mr-2"
                      >
                        <rect width="10" height="10" x="1" y="1" fill="#f25022" />
                        <rect width="10" height="10" x="12" y="1" fill="#7fba00" />
                        <rect width="10" height="10" x="1" y="12" fill="#00a4ef" />
                        <rect width="10" height="10" x="12" y="12" fill="#ffb900" />
                      </svg>
                      <span className="sr-only md:not-sr-only md:text-xs md:truncate">Microsoft</span>
                    </Button>

                   </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="name" className="text-[#1B3C53] font-medium">Nombre Completo</Label>
                    <Input
                      id="name"
                     type="text" 
                     placeholder="Nombre" 
                     value={name} onChange={(e) => setName(e.target.value)}
                      className={`text-[#1B3C53] placeholder:text-[#456882] ${errors.register.name ? "border-red-500" : ""}`}
                    />
                    {errors.register.name && <p className="text-red-500 text-sm">{errors.register.name}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="register-email" className="text-[#1B3C53] font-medium">Correo Electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Email" 
                      value={emailR} onChange={(e) => setEmailR(e.target.value)}
                      className={`text-[#1B3C53] placeholder:text-[#456882] ${errors.register.email ? "border-red-500" : ""}`}
                    />
                    {errors.register.email && <p className="text-red-500 text-sm">{errors.register.email}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="register-password" className="text-[#1B3C53] font-medium">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña" 
                        value={passwordR} onChange={(e) => setPasswordR(e.target.value)}
                        className={`text-[#1B3C53] placeholder:text-[#456882] ${errors.register.password ? "border-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#456882] hover:text-[#1B3C53]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordR && passwordR.length < 6 && (
                      <p className="text-red-500 text-sm">
                        Caracteres mínimos para tu contraseña: 6
                      </p>
                    )}
                    {errors.register.password && <p className="text-red-500 text-sm">{errors.register.password}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="confirm-password" className="text-[#1B3C53] font-medium">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmar Contraseña"
                      value={password_confirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className={`text-[#1B3C53] placeholder:text-[#456882] ${errors.register.confirmPassword ? "border-red-500" : ""}`}
                    />
                    {password_confirmation && passwordR && password_confirmation !== passwordR && (
                      <p className="text-red-500 text-sm">
                        Las contraseñas no coinciden
                      </p>
                    )}
                    {errors.register.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.register.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="confirm-password" className="text-[#1B3C53] font-medium">Número telefónico</Label>
                    <Input
                      id="confirm-password"
                      type="number" 
                      placeholder="Teléfono" 
                      value={telefono} 
                      onChange={(e) => setTelefono(e.target.value)} 
                      className={`text-[#1B3C53] placeholder:text-[#456882] ${errors.register.confirmPassword ? "border-red-500" : ""}`}
                    />
                    {errors.register.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.register.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="confirm-password" className="text-[#1B3C53] font-medium">Direccion</Label>
                    <Input
                      id="confirm-password"
                      type="text" 
                      placeholder="Dirección" 
                      value={direccion} 
                      onChange={(e) => setDireccion(e.target.value)} 
                      className={`text-[#1B3C53] placeholder:text-[#456882] ${errors.register.confirmPassword ? "border-red-500" : ""}`}
                    />
                    {errors.register.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.register.confirmPassword}</p>
                    )}
                  </div>

                   <div>
                       <label className="text-[#1B3C53] font-medium">Elija un plan:</label>
                      <select 
                        value={planSeleccionado} 
                        onChange={(e) => setPlanSeleccionado(e.target.value)}
                        className="w-full mt-2 p-2 border border-[#E8DDD4] rounded-md bg-white text-[#1B3C53] focus:border-[#456882] focus:outline-none"
                      >
                        <option value="">-- Selecciona una opción --</option>
                        {planes.map((plan: {id: number, nombre: string, descripcion: string}) => (
                          <option key={plan.nombre} value={plan.id}>
                            {plan.nombre}
                          </option>
                        ))}
                      </select>

                        {planSeleccionado && (
                            <div className="mt-4 p-4 bg-[#E8DDD4] rounded-lg border border-[#1B3C53]">
                              <p className="text-[#1B3C53] font-bold text-lg mb-2 text-center">
                                Plan Seleccionado:
                              </p>
                              <p className="text-[#1B3C53] font-semibold text-base mb-2">
                                {
                                  planes.find((plan: {id: number, nombre: string, descripcion: string}) => plan.id === parseInt(planSeleccionado))?.nombre
                                }
                              </p>
                              <p className="text-[#456882] text-sm leading-relaxed">
                                {
                                  planes.find((plan: {id: number, nombre: string, descripcion: string}) => plan.id === parseInt(planSeleccionado))?.descripcion
                                }
                              </p>
                            </div>
                          )}
                      </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={registerForm.agreeTerms}
                      onCheckedChange={(checked) => {
                        setRegisterForm({ ...registerForm, agreeTerms: checked as boolean });
                        // Limpiar el error cuando se marque el checkbox
                        if (checked && errors.register.agreeTerms) {
                          setErrors(prev => ({
                            ...prev,
                            register: {
                              ...prev.register,
                              agreeTerms: ''
                            }
                          }));
                        }
                      }}
                      className={errors.register.agreeTerms ? "border-red-500" : ""}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                         className="text-sm font-medium text-[#1B3C53] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acepto los{" "}
                        <button 
                          type="button"
                          onClick={openTermsModal}
                          className="text-[#1B3C53] hover:text-[#456882] underline cursor-pointer bg-transparent border-none p-0"
                        >
                          términos de servicio
                        </button>{" "}
                        y la{" "}
                        <button 
                          type="button"
                          onClick={openTermsModal}
                          className="text-[#1B3C53] hover:text-[#456882] underline cursor-pointer bg-transparent border-none p-0"
                        >
                          política de privacidad
                        </button>
                      </Label>
                      {errors.register.agreeTerms && (
                        <p className="text-red-500 text-sm">{errors.register.agreeTerms}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#456882] hover:to-[#1B3C53] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-6 text-[#456882]"
          >
            <p>
              Al continuar, aceptas los{" "}
              <button 
                type="button"
                onClick={openTermsModal}
                className="text-[#1B3C53] hover:text-[#456882] underline cursor-pointer bg-transparent border-none p-0"
              >
                Términos de Servicio
              </button>{" "}
              y la{" "}
              <button 
                type="button"
                onClick={openTermsModal}
                className="text-[#1B3C53] hover:text-[#456882] underline cursor-pointer bg-transparent border-none p-0"
              >
                Política de Privacidad
              </button>{" "}
              de XPMarket
            </p>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-[#1B3C53] text-[#F9F3EF] py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} XPMarket. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modal de Términos y Condiciones */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-[#1B3C53]">
                Términos y Condiciones de Uso - XPMarket
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTermsModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[#456882] text-sm mt-2">
              Última actualización: 17-Octubre-2025
            </p>
          </DialogHeader>
          
          <ScrollArea className="h-[70vh] px-6 pb-6">
            <div className="space-y-6">
              
              {/* Introducción */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">BIENVENIDO A XPMARKET</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">1.1 Introducción a la Plataforma</h4>
                      <p className="text-[#456882] leading-relaxed text-sm">
                        Gracias por formar parte de nuestra comunidad. XPMarket es una plataforma digital diseñada para facilitar la compraventa de productos entre usuarios de forma segura, práctica y accesible. Al usar nuestra plataforma, ya sea como comprador o vendedor, aceptas los términos y condiciones aquí descritos. Estos lineamientos buscan proteger tanto a los usuarios como al buen funcionamiento del servicio.
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">1.2 Responsabilidades de Cuenta</h4>
                      <p className="text-[#456882] leading-relaxed text-sm">
                        Para acceder a las funciones principales de XPMarket, deberás crear una cuenta proporcionando información verdadera y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda actividad que ocurra en tu cuenta. XPMarket se reserva el derecho de suspender cuentas que infrinjan nuestras políticas, realicen prácticas fraudulentas o incumplan los presentes términos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Planes de Suscripción y Tarifas */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-4">PLANES DE SUSCRIPCIÓN Y TARIFAS</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Plan Gratuito */}
                  <div className="bg-[#F9F3EF] p-4 rounded-lg border-l-4 border-[#1B3C53] h-full">
                    <div className="text-center mb-3">
                      <h4 className="text-lg font-bold text-[#1B3C53] mb-1">PLAN GRATUITO</h4>
                      <div className="text-2xl font-bold text-[#1B3C53]">$0 MXN</div>
                      <p className="text-xs text-[#456882]">Sin costo mensual</p>
                    </div>
                    
                    <p className="text-[#456882] mb-3 text-xs">
                      Este plan está pensado para usuarios que inician en la plataforma o desean vender ocasionalmente.
                    </p>
                    
                    <h5 className="font-semibold text-[#1B3C53] mb-2 text-sm">Incluye:</h5>
                    <ul className="text-[#456882] space-y-1 text-xs">
                      <li>• Publicación de hasta 5 productos activos a la vez</li>
                      <li>• Visualización de anuncios publicitarios</li>
                      <li>• Comisión del 5% sobre cada venta</li>
                      <li>• Sin acceso al chat global</li>
                      <li>• Sin verificación premium</li>
                    </ul>
                    
                    <div className="mt-3 p-2 bg-white rounded-lg">
                      <p className="text-[#456882] text-xs">
                        El Plan Gratuito te permite conocer el funcionamiento de XPMarket antes de optar por un servicio de mayor alcance.
                      </p>
                    </div>
                  </div>

                  {/* Plan Cliente Fiel */}
                  <div className="bg-[#E8DDD4] p-4 rounded-lg border-l-4 border-[#456882] h-full">
                    <div className="text-center mb-3">
                      <h4 className="text-lg font-bold text-[#1B3C53] mb-1">PLAN CLIENTE FIEL</h4>
                      <div className="text-2xl font-bold text-[#1B3C53]">$99 MXN</div>
                      <p className="text-xs text-[#456882]">por mes</p>
                    </div>
                    
                    <p className="text-[#456882] mb-3 text-xs">
                      Pensado para vendedores activos que desean expandir su presencia y mejorar su experiencia.
                    </p>
                    
                    <h5 className="font-semibold text-[#1B3C53] mb-2 text-sm">Incluye:</h5>
                    <ul className="text-[#456882] space-y-1 text-xs">
                      <li>• Hasta 100 productos activos</li>
                      <li>• Eliminación de anuncios publicitarios</li>
                      <li>• Comisión reducida del 2.5% por venta</li>
                      <li>• Acceso al chat global</li>
                      <li>• Verificación básica incluida</li>
                    </ul>
                    
                    <div className="mt-3 p-2 bg-white rounded-lg">
                      <h5 className="font-semibold text-[#1B3C53] mb-1 text-xs">Costos del Plan Cliente Fiel:</h5>
                      <ul className="text-[#456882] space-y-1 text-xs">
                        <li>• Mensual: $99 MXN ($5.50 USD)</li>
                        <li>• Trimestral: $249 MXN ($13.80 USD)</li>
                        <li>• Anual: $899 MXN ($49.80 USD)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-[#1B3C53] text-xs">
                        <strong>Nota:</strong> Aunque se denomine "ilimitado", existe un límite de 100 productos por persona o empresa. Para más productos, contacta soporte.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Costos de Envío */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">3. COSTOS DE ENVÍO</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">3.1 Empresas de Mensajería</h4>
                      <p className="text-[#456882] mb-2 text-sm">
                        XPMarket trabaja con distintas empresas de mensajería para ofrecer opciones de envío seguras y adaptadas a las necesidades del comprador. El costo del envío se calcula como un porcentaje del valor del producto, considerando peso, destino y nivel de seguridad.
                      </p>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• <strong>Estafeta:</strong> 8% - 12%</li>
                        <li>• <strong>FedEx:</strong> 12% - 15%</li>
                        <li>• <strong>DHL:</strong> 15% - 20%</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">3.2 Deducciones Automáticas</h4>
                      <p className="text-[#456882] text-sm">
                        Ten en cuenta que el monto final recibido por el vendedor incluirá las deducciones correspondientes a los costos de envío y las comisiones de XPMarket. Por lo tanto, el dinero transferido no será equivalente al valor total del producto publicado.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Responsabilidades del Usuario */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">4. RESPONSABILIDADES DEL USUARIO</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">4.1 Reglas Básicas</h4>
                      <p className="text-[#456882] mb-2 text-sm">
                        Todos los usuarios de XPMarket deben actuar de buena fe y respetar las siguientes reglas básicas:
                      </p>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Publicar únicamente productos reales y propios, con información veraz y actualizada sin fraudulencia.</li>
                        <li>• Cumplir los tiempos de entrega establecidos con los compradores.</li>
                        <li>• No publicar contenido ilegal, ofensivo o que viole derechos de autor.</li>
                        <li>• Mantener una comunicación respetuosa con otros usuarios y con el equipo de XPMarket.</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">4.2 Consecuencias del Incumplimiento</h4>
                      <p className="text-[#456882] text-sm">
                        El incumplimiento de estas normas puede derivar en la suspensión o eliminación de la cuenta.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Política de Reembolsos */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">5. POLÍTICA DE REEMBOLSOS Y PAGOS</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">5.1 Procesamiento de Transacciones</h4>
                      <p className="text-[#456882] leading-relaxed text-sm">
                        Las transacciones realizadas en XPMarket se procesan de manera segura y transparente. Las comisiones y deducciones se aplican automáticamente al momento de cada venta. En caso de existir un reclamo o solicitud de reembolso, XPMarket evaluará la situación caso por caso, considerando las pruebas aportadas por ambas partes antes de emitir una resolución.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Legislación Aplicable */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">6. LEGISLACIÓN APLICABLE</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">6.1 Jurisdicción Legal</h4>
                      <p className="text-[#456882] leading-relaxed text-sm">
                        Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia relacionada con el uso de la plataforma será resuelta ante los tribunales competentes de la Ciudad de México.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Política de Privacidad */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">7. POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">7.1 Información que Recopilamos</h4>
                      <p className="text-[#456882] mb-2 text-sm">
                        XPMarket se compromete a proteger la privacidad y seguridad de la información personal de nuestros usuarios.
                      </p>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Datos de registro (nombre, email, teléfono)</li>
                        <li>• Información de productos y transacciones</li>
                        <li>• Datos de navegación y uso de la plataforma</li>
                        <li>• Información de contacto y dirección de envío</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">7.2 Uso de la Información</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Proporcionar y mejorar nuestros servicios</li>
                        <li>• Procesar transacciones y comunicaciones</li>
                        <li>• Cumplir con obligaciones legales</li>
                        <li>• Prevenir fraudes y actividades ilegales</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">7.3 Protección de Datos</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Implementamos medidas de seguridad técnicas y organizativas</li>
                        <li>• No compartimos información personal con terceros sin consentimiento</li>
                        <li>• Los usuarios pueden solicitar acceso, rectificación o eliminación de sus datos</li>
                        <li>• Cumplimos con las leyes de protección de datos aplicables</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Propiedad Intelectual */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">8. PROPIEDAD INTELECTUAL Y CONTENIDO</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">8.1 Contenido de XPMarket</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Toda la plataforma, diseño, código y funcionalidades son propiedad de XPMarket</li>
                        <li>• Los usuarios no pueden copiar, modificar o distribuir nuestro contenido</li>
                        <li>• Las marcas comerciales y logos están protegidos por derechos de autor</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">8.2 Contenido del Usuario</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Los usuarios mantienen los derechos sobre su contenido (productos, imágenes, descripciones)</li>
                        <li>• Al subir contenido, otorgan a XPMarket una licencia para usarlo en la plataforma</li>
                        <li>• Los usuarios son responsables de tener los derechos sobre el contenido que publican</li>
                        <li>• No se permite contenido que viole derechos de terceros</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">8.3 Infracción de Derechos</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• XPMarket respeta los derechos de propiedad intelectual de terceros</li>
                        <li>• Los usuarios deben reportar cualquier infracción de derechos</li>
                        <li>• Nos reservamos el derecho de remover contenido que viole derechos de autor</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitaciones de Responsabilidad */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">9. LIMITACIONES DE RESPONSABILIDAD</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">9.1 Servicios de Intermediación</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• XPMarket actúa como intermediario entre compradores y vendedores</li>
                        <li>• No somos responsables por la calidad, autenticidad o estado de los productos</li>
                        <li>• Los usuarios deben verificar la información antes de realizar compras</li>
                        <li>• No garantizamos la disponibilidad continua del servicio</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">9.2 Limitaciones Generales</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• XPMarket no será responsable por daños indirectos, incidentales o consecuenciales</li>
                        <li>• La responsabilidad total no excederá el monto pagado por el usuario en los últimos 12 meses</li>
                        <li>• No somos responsables por pérdidas de datos o interrupciones del servicio</li>
                        <li>• Los usuarios utilizan la plataforma bajo su propio riesgo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Suspensión y Terminación */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">10. SUSPENSIÓN Y TERMINACIÓN DE CUENTAS</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">10.1 Suspensión por XPMarket</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Podemos suspender cuentas que violen estos términos y condiciones</li>
                        <li>• Las suspensiones pueden ser temporales o permanentes según la gravedad</li>
                        <li>• Causas comunes: actividades fraudulentas, contenido inapropiado, spam</li>
                        <li>• Se notificará al usuario sobre la razón de la suspensión</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">10.2 Terminación por el Usuario</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• Los usuarios pueden cancelar su cuenta en cualquier momento</li>
                        <li>• Las suscripciones pagadas no son reembolsables por cancelación anticipada</li>
                        <li>• Los datos del usuario se eliminarán según nuestra política de retención</li>
                        <li>• Las transacciones pendientes deben completarse antes de la terminación</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">10.3 Efectos de la Terminación</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• El acceso a la cuenta se revocará inmediatamente</li>
                        <li>• Los productos activos serán removidos de la plataforma</li>
                        <li>• Las obligaciones pendientes deben cumplirse</li>
                        <li>• Los datos pueden conservarse por períodos legales requeridos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Modificaciones de Términos */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">11. MODIFICACIONES DE LOS TÉRMINOS</h3>
                
                <div className="bg-[#F9F3EF] p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">11.1 Derecho a Modificar</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• XPMarket se reserva el derecho de modificar estos términos en cualquier momento</li>
                        <li>• Los cambios serán notificados a través de la plataforma y por email</li>
                        <li>• Las modificaciones entrarán en vigor 30 días después de la notificación</li>
                        <li>• Los cambios importantes serán destacados claramente</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">11.2 Aceptación de Cambios</h4>
                      <ul className="text-[#456882] space-y-1 text-sm">
                        <li>• El uso continuado de la plataforma constituye aceptación de los nuevos términos</li>
                        <li>• Si no estás de acuerdo con los cambios, debes dejar de usar la plataforma</li>
                        <li>• Los usuarios pueden cancelar su cuenta si no aceptan las modificaciones</li>
                        <li>• Se mantendrá un historial de versiones anteriores de los términos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Información de Contacto */}
              <section>
                <h3 className="text-xl font-bold text-[#1B3C53] mb-3">12. INFORMACIÓN DE CONTACTO Y SOPORTE</h3>
                
                <div className="bg-gradient-to-r from-[#1B3C53] to-[#456882] p-4 rounded-lg text-white">
                  <p className="mb-3 text-sm">Para consultas, reportes o asistencia relacionada con estos términos y condiciones:</p>
                  
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Soporte General</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Email: xpmarketoficial@gmail.com</li>
                        <li>• Teléfono: +52 55 1234 5678</li>
                        <li>• Horario: Lunes a Viernes 9:00 - 18:00</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white/10 rounded">
                    <p className="text-xs">
                      <strong>Nota:</strong> Para reportes urgentes de seguridad o actividades fraudulentas, 
                      contacta inmediatamente a nuestro equipo de soporte.
                    </p>
                  </div>
                </div>
              </section>

              {/* Agradecimiento Final */}
              <section className="bg-gradient-to-r from-[#1B3C53] to-[#456882] p-4 rounded-lg text-white">
                <h3 className="text-xl font-bold mb-3">GRACIAS POR USAR XPMARKET</h3>
                <p className="text-sm">
                  Al utilizar nuestra plataforma, contribuyes a una comunidad confiable y profesional de vendedores y compradores. Nuestro compromiso es ofrecerte un espacio transparente, seguro y en constante mejora.
                </p>
              </section>

              {/* Footer del modal */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-[#456882] mb-3 text-sm">
                  Al utilizar XPMarket, usted confirma que ha leído, entendido y aceptado estos términos y condiciones en su totalidad.
                </p>
                <p className="text-[#1B3C53] font-semibold text-sm">
                  XPMarket - 17-Octubre-2025
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
