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
import axios from "axios";

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [name, setName] = useState("");
  const [emailR, setEmailR] = useState("");
  const [passwordR, setPasswordR] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [telefono, setTelefono] = useState(""); // Nuevo estado para teléfono
  const [direccion, setDireccion] = useState(""); // Nuevo estado para dirección
  const [message, setMessage] = useState("");
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
    
    // Guarda el token
    localStorage.setItem("token", response.data.token);
    
    // Guarda todos los datos del usuario
    const userData = response.data.user;
    localStorage.setItem("userData", JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.telefono,
      address: userData.direccion,
      plan_id: userData.plan_id,
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
      setError(error.response.data.message);
    } else {
      console.error("⚠️ Error inesperado:", error.message);
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
        window.location.reload()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
      <header className="bg-gradient-to-r from-[#be0c0c] to-[#8B0000] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between"> {/* Cambia h-16 por h-20 */}
            <Link href="/" className="flex items-center">
              <img
                src="/logonuevo.png"
                alt="XpMarket Logo"
                className="h-16 w-auto" // Cambia h-10 por h-16 para hacerlo más grande
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
            <div className="bg-gradient-to-r from-[#8B0000] to-[#be0c0c] p-6 text-center">
              <h1 className="text-2xl font-bold text-white">Bienvenido de Nuevo</h1>
              <p className="text-purple-100 mt-2">Inicia sesión para acceder a tu cuenta</p>
            </div>

            <Tabs defaultValue="login" className="p-6">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      className="input2"
                      type="email"
                      value={email}
                      placeholder="user@gmail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {errors.login.email && <p className="text-red-500 text-sm">{errors.login.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                         className="input2"
                          type="password"
                          value={password}
                          placeholder="*******"
                          onChange={(e) => setPassword(e.target.value)}
                          required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm({ ...loginForm, rememberMe: checked as boolean })}
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Recordarme
                      </Label>
                    </div>
                    <Link href="#" className="text-sm text-purple-600 hover:text-purple-800">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#be0c0c] to-[#be0c0c] hover:from-[#8B0000] hover:to-[#8B0000] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">O continuar con</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="w-full">
                      <Facebook size={18} className="mr-2" />
                      <span className="sr-only md:not-sr-only md:text-xs md:truncate">Facebook</span>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail size={18} className="mr-2" />
                      <span className="sr-only md:not-sr-only md:text-xs md:truncate">Google</span>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Github size={18} className="mr-2" />
                      <span className="sr-only md:not-sr-only md:text-xs md:truncate">GitHub</span>
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                     type="text" 
                     placeholder="Nombre" 
                     value={name} onChange={(e) => setName(e.target.value)}
                      className={errors.register.name ? "border-red-500" : ""}
                    />
                    {errors.register.name && <p className="text-red-500 text-sm">{errors.register.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Email" 
                      value={emailR} onChange={(e) => setEmailR(e.target.value)}
                      className={errors.register.email ? "border-red-500" : ""}
                    />
                    {errors.register.email && <p className="text-red-500 text-sm">{errors.register.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type="password" 
                        placeholder="Contraseña" 
                        value={passwordR} onChange={(e) => setPasswordR(e.target.value)}
                        className={errors.register.password ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.register.password && <p className="text-red-500 text-sm">{errors.register.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmar Contraseña"
                      value={password_confirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className={errors.register.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.register.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.register.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Número telefónico</Label>
                    <Input
                      id="confirm-password"
                      type="number" 
                      placeholder="Teléfono" 
                      value={telefono} 
                      onChange={(e) => setTelefono(e.target.value)} 
                      className={errors.register.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.register.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.register.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Direccion</Label>
                    <Input
                      id="confirm-password"
                      type="text" 
                      placeholder="Dirección" 
                      value={direccion} 
                      onChange={(e) => setDireccion(e.target.value)} 
                      className={errors.register.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.register.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.register.confirmPassword}</p>
                    )}
                  </div>

                   <div>
                      <label>Elija un plan:</label>
                      <select value={planSeleccionado} onChange={(e) => setPlanSeleccionado(e.target.value)}>
                        <option value="">-- Selecciona una opción --</option>
                        {planes.map((plan) => (
                          <option key={plan.nombre} value={plan.id}>
                            {plan.nombre}
                          </option>
                        ))}
                      </select>

                        {planSeleccionado && (
                            <p>
                              Esto trae el plan:{" "}
                              <strong>
                                {
                                  planes.find((plan) => plan.id === parseInt(planSeleccionado))?.nombre
                                }
                              </strong>
                              <strong>
                                {
                                  planes.find((plan) => plan.id === parseInt(planSeleccionado))?.descripcion
                                }
                              </strong>
                            </p>
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acepto los{" "}
                        <Link href="#" className="text-purple-600 hover:text-purple-800">
                          términos de servicio
                        </Link>{" "}
                        y la{" "}
                        <Link href="#" className="text-purple-600 hover:text-purple-800">
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
                    className="w-full bg-gradient-to-r from-[#be0c0c] to-[#be0c0c] hover:from-[#8B0000] hover:to-[#8B0000] text-white"
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
            className="text-center mt-6 text-gray-600"
          >
            <p>
              Al continuar, aceptas los{" "}
              <Link href="#" className="text-purple-600 hover:text-purple-800">
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link href="#" className="text-purple-600 hover:text-purple-800">
                Política de Privacidad
              </Link>{" "}
              de SuperMercado
            </p>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} SuperMercado. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
