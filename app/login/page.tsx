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
import storage from "@/lib/storage"

export default function LoginPage() {
  const router = useRouter()
  const { dispatch } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
  const [planes, setPlanes] = useState([]);// Inicializa useNavigate

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
    dispatch({ type: "SET_USER_SESSION", payload: { token, user_id: apiUser.id, name: apiUser.name, foto: apiUser.foto } })
    
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
                        {planes.map((plan) => (
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
                                  planes.find((plan) => plan.id === parseInt(planSeleccionado))?.nombre
                                }
                              </p>
                              <p className="text-[#456882] text-sm leading-relaxed">
                                {
                                  planes.find((plan) => plan.id === parseInt(planSeleccionado))?.descripcion
                                }
                              </p>
                            </div>
                          )}
                      </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={registerForm.agreeTerms}
                      onCheckedChange={(checked) =>
                        setRegisterForm({ ...registerForm, agreeTerms: checked as boolean })
                      }
                      className={errors.register.agreeTerms ? "border-red-500" : ""}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                         className="text-sm font-medium text-[#1B3C53] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acepto los{" "}
                        <Link href="#" className="text-[#1B3C53] hover:text-[#456882]">
                          términos de servicio
                        </Link>{" "}
                        y la{" "}
                        <Link href="#" className="text-[#1B3C53] hover:text-[#456882]">
                          política de privacidad
                        </Link>
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
              <Link href="#" className="text-[#1B3C53] hover:text-[#456882]">
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link href="#" className="text-[#1B3C53] hover:text-[#456882]">
                Política de Privacidad
              </Link>{" "}
              de SuperMercado
            </p>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-[#1B3C53] text-[#F9F3EF] py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} XpMarket. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
