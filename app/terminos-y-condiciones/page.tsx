"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TerminosCondicionesPage() {
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/terminos-y-condiciones.pdf';
    link.download = 'Terminos_y_Condiciones_XPMarket.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F3EF] to-[#E8DDD4]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B3C53] to-[#456882] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="/login" className="flex items-center text-white hover:text-[#E8DDD4] transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al Registro
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-[#1B3C53] rounded-full mb-4"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-[#1B3C53] mb-2">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-[#456882] text-lg">
              XPMarket - Última actualización: 17-Octubre-2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            
            {/* Introducción */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">BIENVENIDO A XPMARKET</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">1.1 Introducción a la Plataforma</h3>
                    <p className="text-[#456882] leading-relaxed">
                      Gracias por formar parte de nuestra comunidad. XPMarket es una plataforma digital diseñada para facilitar la compraventa de productos entre usuarios de forma segura, práctica y accesible. Al usar nuestra plataforma, ya sea como comprador o vendedor, aceptas los términos y condiciones aquí descritos. Estos lineamientos buscan proteger tanto a los usuarios como al buen funcionamiento del servicio.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">1.2 Responsabilidades de Cuenta</h3>
                    <p className="text-[#456882] leading-relaxed">
                      Para acceder a las funciones principales de XPMarket, deberás crear una cuenta proporcionando información verdadera y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda actividad que ocurra en tu cuenta. XPMarket se reserva el derecho de suspender cuentas que infrinjan nuestras políticas, realicen prácticas fraudulentas o incumplan los presentes términos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Planes de Suscripción y Tarifas */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-6">PLANES DE SUSCRIPCIÓN Y TARIFAS</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Gratuito */}
                <div className="bg-[#F9F3EF] p-6 rounded-lg border-l-4 border-[#1B3C53] h-full">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-[#1B3C53] mb-2">PLAN GRATUITO</h3>
                    <div className="text-3xl font-bold text-[#1B3C53]">$0 MXN</div>
                    <p className="text-sm text-[#456882]">Sin costo mensual</p>
                  </div>
                  
                  <p className="text-[#456882] mb-4 text-sm">
                    Este plan está pensado para usuarios que inician en la plataforma o desean vender ocasionalmente.
                  </p>
                  
                  <h4 className="font-semibold text-[#1B3C53] mb-3">Incluye:</h4>
                  <ul className="text-[#456882] space-y-2 text-sm">
                    <li>• Publicación de hasta 5 productos activos a la vez</li>
                    <li>• Visualización de anuncios publicitarios</li>
                    <li>• Comisión del 5% sobre cada venta</li>
                    <li>• Sin acceso al chat global</li>
                    <li>• Sin verificación premium</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-[#456882] text-xs">
                      El Plan Gratuito te permite conocer el funcionamiento de XPMarket antes de optar por un servicio de mayor alcance.
                    </p>
                  </div>
                </div>

                {/* Plan Cliente Fiel */}
                <div className="bg-[#E8DDD4] p-6 rounded-lg border-l-4 border-[#456882] h-full">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-[#1B3C53] mb-2">PLAN CLIENTE FIEL</h3>
                    <div className="text-3xl font-bold text-[#1B3C53]">$99 MXN</div>
                    <p className="text-sm text-[#456882]">por mes</p>
                  </div>
                  
                  <p className="text-[#456882] mb-4 text-sm">
                    Pensado para vendedores activos que desean expandir su presencia y mejorar su experiencia.
                  </p>
                  
                  <h4 className="font-semibold text-[#1B3C53] mb-3">Incluye:</h4>
                  <ul className="text-[#456882] space-y-2 text-sm">
                    <li>• Hasta 100 productos activos</li>
                    <li>• Eliminación de anuncios publicitarios</li>
                    <li>• Comisión reducida del 2.5% por venta</li>
                    <li>• Acceso al chat global</li>
                    <li>• Verificación básica incluida</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <h4 className="font-semibold text-[#1B3C53] mb-2 text-sm">Costos del Plan Cliente Fiel:</h4>
                    <ul className="text-[#456882] space-y-1 text-xs">
                      <li>• Mensual: $99 MXN ($5.50 USD)</li>
                      <li>• Trimestral: $249 MXN ($13.80 USD)</li>
                      <li>• Anual: $899 MXN ($49.80 USD)</li>
                    </ul>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-[#1B3C53] text-xs">
                      <strong>Nota:</strong> Aunque se denomine "ilimitado", existe un límite de 100 productos por persona o empresa. Para más productos, contacta soporte.
                    </p>
                  </div>
                </div>
              </div>
            </section>


            {/* Costos de Envío */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">3. COSTOS DE ENVÍO</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">3.1 Empresas de Mensajería</h3>
                    <p className="text-[#456882] mb-3">
                      XPMarket trabaja con distintas empresas de mensajería para ofrecer opciones de envío seguras y adaptadas a las necesidades del comprador. El costo del envío se calcula como un porcentaje del valor del producto, considerando peso, destino y nivel de seguridad.
                    </p>
                    <ul className="text-[#456882] space-y-1">
                      <li>• <strong>Estafeta:</strong> 8% - 12%</li>
                      <li>• <strong>FedEx:</strong> 12% - 15%</li>
                      <li>• <strong>DHL:</strong> 15% - 20%</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">3.2 Deducciones Automáticas</h3>
                    <p className="text-[#456882]">
                      Ten en cuenta que el monto final recibido por el vendedor incluirá las deducciones correspondientes a los costos de envío y las comisiones de XPMarket. Por lo tanto, el dinero transferido no será equivalente al valor total del producto publicado.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Responsabilidades del Usuario */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">4. RESPONSABILIDADES DEL USUARIO</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">4.1 Reglas Básicas</h3>
                    <p className="text-[#456882] mb-3">
                      Todos los usuarios de XPMarket deben actuar de buena fe y respetar las siguientes reglas básicas:
                    </p>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Publicar únicamente productos reales y propios, con información veraz y actualizada sin fraudulencia.</li>
                      <li>• Cumplir los tiempos de entrega establecidos con los compradores.</li>
                      <li>• No publicar contenido ilegal, ofensivo o que viole derechos de autor.</li>
                      <li>• Mantener una comunicación respetuosa con otros usuarios y con el equipo de XPMarket.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">4.2 Consecuencias del Incumplimiento</h3>
                    <p className="text-[#456882]">
                      El incumplimiento de estas normas puede derivar en la suspensión o eliminación de la cuenta.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Política de Reembolsos */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">5. POLÍTICA DE REEMBOLSOS Y PAGOS</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">5.1 Procesamiento de Transacciones</h3>
                    <p className="text-[#456882] leading-relaxed">
                      Las transacciones realizadas en XPMarket se procesan de manera segura y transparente. Las comisiones y deducciones se aplican automáticamente al momento de cada venta. En caso de existir un reclamo o solicitud de reembolso, XPMarket evaluará la situación caso por caso, considerando las pruebas aportadas por ambas partes antes de emitir una resolución.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Legislación Aplicable */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">6. LEGISLACIÓN APLICABLE</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">6.1 Jurisdicción Legal</h3>
                    <p className="text-[#456882] leading-relaxed">
                      Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia relacionada con el uso de la plataforma será resuelta ante los tribunales competentes de la Ciudad de México.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Política de Privacidad */}
            <section>
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">5. POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h2>
              
              <div className="bg-[#E8DDD4] p-6 rounded-lg">
                <p className="text-[#456882] mb-4">
                  XPMarket se compromete a proteger la privacidad y seguridad de la información personal de nuestros usuarios.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">5.1 Información que Recopilamos</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Datos de registro (nombre, email, teléfono)</li>
                      <li>• Información de productos y transacciones</li>
                      <li>• Datos de navegación y uso de la plataforma</li>
                      <li>• Información de contacto y dirección de envío</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">5.2 Uso de la Información</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Proporcionar y mejorar nuestros servicios</li>
                      <li>• Procesar transacciones y comunicaciones</li>
                      <li>• Cumplir con obligaciones legales</li>
                      <li>• Prevenir fraudes y actividades ilegales</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">5.3 Protección de Datos</h3>
                    <ul className="text-[#456882] space-y-2">
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
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">6. PROPIEDAD INTELECTUAL Y CONTENIDO</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">6.1 Contenido de XPMarket</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Toda la plataforma, diseño, código y funcionalidades son propiedad de XPMarket</li>
                      <li>• Los usuarios no pueden copiar, modificar o distribuir nuestro contenido</li>
                      <li>• Las marcas comerciales y logos están protegidos por derechos de autor</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">6.2 Contenido del Usuario</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Los usuarios mantienen los derechos sobre su contenido (productos, imágenes, descripciones)</li>
                      <li>• Al subir contenido, otorgan a XPMarket una licencia para usarlo en la plataforma</li>
                      <li>• Los usuarios son responsables de tener los derechos sobre el contenido que publican</li>
                      <li>• No se permite contenido que viole derechos de terceros</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">6.3 Infracción de Derechos</h3>
                    <ul className="text-[#456882] space-y-2">
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
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">7. LIMITACIONES DE RESPONSABILIDAD</h2>
              
              <div className="bg-[#E8DDD4] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">7.1 Servicios de Intermediación</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• XPMarket actúa como intermediario entre compradores y vendedores</li>
                      <li>• No somos responsables por la calidad, autenticidad o estado de los productos</li>
                      <li>• Los usuarios deben verificar la información antes de realizar compras</li>
                      <li>• No garantizamos la disponibilidad continua del servicio</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">7.2 Limitaciones Generales</h3>
                    <ul className="text-[#456882] space-y-2">
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
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">8. SUSPENSIÓN Y TERMINACIÓN DE CUENTAS</h2>
              
              <div className="bg-[#F9F3EF] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">8.1 Suspensión por XPMarket</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Podemos suspender cuentas que violen estos términos y condiciones</li>
                      <li>• Las suspensiones pueden ser temporales o permanentes según la gravedad</li>
                      <li>• Causas comunes: actividades fraudulentas, contenido inapropiado, spam</li>
                      <li>• Se notificará al usuario sobre la razón de la suspensión</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">8.2 Terminación por el Usuario</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• Los usuarios pueden cancelar su cuenta en cualquier momento</li>
                      <li>• Las suscripciones pagadas no son reembolsables por cancelación anticipada</li>
                      <li>• Los datos del usuario se eliminarán según nuestra política de retención</li>
                      <li>• Las transacciones pendientes deben completarse antes de la terminación</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">8.3 Efectos de la Terminación</h3>
                    <ul className="text-[#456882] space-y-2">
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
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">9. MODIFICACIONES DE LOS TÉRMINOS</h2>
              
              <div className="bg-[#E8DDD4] p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">9.1 Derecho a Modificar</h3>
                    <ul className="text-[#456882] space-y-2">
                      <li>• XPMarket se reserva el derecho de modificar estos términos en cualquier momento</li>
                      <li>• Los cambios serán notificados a través de la plataforma y por email</li>
                      <li>• Las modificaciones entrarán en vigor 30 días después de la notificación</li>
                      <li>• Los cambios importantes serán destacados claramente</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1B3C53] mb-3">9.2 Aceptación de Cambios</h3>
                    <ul className="text-[#456882] space-y-2">
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
              <h2 className="text-2xl font-bold text-[#1B3C53] mb-4">10. INFORMACIÓN DE CONTACTO Y SOPORTE</h2>
              
              <div className="bg-gradient-to-r from-[#1B3C53] to-[#456882] p-6 rounded-lg text-white">
                <p className="mb-4">Para consultas, reportes o asistencia relacionada con estos términos y condiciones:</p>
                
                <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Soporte General</h3>
                    <ul className="space-y-2">
                      <li>• Email: xpmarketoficial@gmail.com</li>
                      <li>• Teléfono: +52 55 1234 5678</li>
                      <li>• Horario: Lunes a Viernes 9:00 - 18:00</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white/10 rounded">
                  <p className="text-sm">
                    <strong>Nota:</strong> Para reportes urgentes de seguridad o actividades fraudulentas, 
                    contacta inmediatamente a nuestro equipo de soporte.
                  </p>
                </div>
              </div>
            </section>

            {/* Agradecimiento Final */}
            <section className="bg-gradient-to-r from-[#1B3C53] to-[#456882] p-6 rounded-lg text-white">
              <h2 className="text-2xl font-bold mb-4">GRACIAS POR USAR XPMARKET</h2>
              <p className="mb-4">
                Al utilizar nuestra plataforma, contribuyes a una comunidad confiable y profesional de vendedores y compradores. Nuestro compromiso es ofrecerte un espacio transparente, seguro y en constante mejora.
              </p>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-[#456882] mb-4">
                Al utilizar XPMarket, usted confirma que ha leído, entendido y aceptado estos términos y condiciones en su totalidad.
              </p>
              <p className="text-[#1B3C53] font-semibold">
                XPMarket - 17-Octubre-2025
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B3C53] text-[#F9F3EF] py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} XPMarket. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

