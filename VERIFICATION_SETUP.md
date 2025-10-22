# 🔐 Sistema de Verificación por SMS

## 📋 Descripción

Sistema completo de verificación por SMS con código de 4 dígitos implementado en el frontend de Next.js y backend de Laravel.

## 🚀 Características

- ✅ **Verificación por SMS** con código de 4 dígitos
- ✅ **Interfaz intuitiva** con inputs separados para cada dígito
- ✅ **Auto-focus** y navegación entre campos
- ✅ **Paste support** para pegar códigos completos
- ✅ **Countdown timer** de 10 minutos
- ✅ **Reenvío de códigos** automático
- ✅ **Validaciones** en tiempo real
- ✅ **Manejo de errores** completo
- ✅ **Responsive design** para móviles

## 📁 Archivos Creados

### Componentes
- `components/verification-code-form.tsx` - Formulario de código de verificación
- `components/verification-flow.tsx` - Flujo completo de verificación
- `hooks/use-verification.ts` - Hook personalizado para manejo de estado

### Páginas
- `app/verification/page.tsx` - Página principal de verificación

### API Routes
- `app/api/verificacion/enviar-codigo/route.ts` - Endpoint para enviar códigos
- `app/api/verificacion/verificar-codigo/route.ts` - Endpoint para verificar códigos

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del frontend:

```env
# URL del backend de Laravel
NEXT_PUBLIC_API_URL=http://localhost:8000

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=XPmarket
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Dependencias

Asegúrate de tener instaladas las dependencias de UI:

```bash
npm install @radix-ui/react-alert-dialog
npm install lucide-react
```

## 🌐 Uso

### Página de Verificación

Accede a `/verification` para usar el flujo completo:

```typescript
// Navegación directa
router.push('/verification');

// Con número pre-cargado
router.push('/verification?phone=9992694926');
```

### Componente en Otras Páginas

```typescript
import VerificationFlow from '@/components/verification-flow';

function MyPage() {
  const handleVerificationSuccess = () => {
    // Redirigir o mostrar mensaje de éxito
    router.push('/dashboard');
  };

  return (
    <VerificationFlow
      initialPhoneNumber="9992694926"
      onSuccess={handleVerificationSuccess}
      onBack={() => router.push('/login')}
    />
  );
}
```

### Hook Personalizado

```typescript
import { useVerification } from '@/hooks/use-verification';

function MyComponent() {
  const { sendCode, verifyCode, isLoading, error, success } = useVerification();

  const handleSendCode = async () => {
    const result = await sendCode('9992694926');
    if (result) {
      console.log('Código enviado:', result);
    }
  };

  const handleVerifyCode = async () => {
    const result = await verifyCode('9992694926', '1234');
    if (result?.verified) {
      console.log('Código verificado');
    }
  };
}
```

## 📱 Flujo de Usuario

1. **Ingreso de teléfono**: Usuario ingresa su número de teléfono
2. **Envío de código**: Sistema envía SMS con código de 4 dígitos
3. **Ingreso de código**: Usuario ingresa el código recibido
4. **Verificación**: Sistema valida el código
5. **Redirección**: Usuario es redirigido a la página principal

## 🔗 Integración con Backend

El frontend se comunica con el backend de Laravel a través de:

### Endpoints Backend
- `POST /api/verificacion/enviar-codigo`
- `POST /api/verificacion/verificar-codigo`

### Endpoints Frontend (Proxy)
- `POST /api/verificacion/enviar-codigo`
- `POST /api/verificacion/verificar-codigo`

## 🧪 Pruebas

### Prueba Manual
1. Ve a `http://localhost:3000/verification`
2. Ingresa tu número de teléfono
3. Recibe el código por SMS
4. Ingresa el código de 4 dígitos
5. Verifica que seas redirigido correctamente

### Prueba Automática
```bash
cd frontend
node test-verification-integration.js
```

## 🎨 Personalización

### Estilos
Los componentes usan Tailwind CSS y pueden ser personalizados modificando las clases.

### Mensajes
Los mensajes pueden ser personalizados en los componentes o usando un sistema de i18n.

### Validaciones
Las validaciones se pueden extender en el hook `useVerification`.

## 🚨 Troubleshooting

### Error: "Error de conexión"
- Verifica que el backend esté ejecutándose en `http://localhost:8000`
- Revisa la variable `NEXT_PUBLIC_API_URL`

### Error: "Código inválido"
- Verifica que el código tenga exactamente 4 dígitos
- Asegúrate de que el código no haya expirado (10 minutos)

### Error: "Número de teléfono inválido"
- Verifica que el número tenga al menos 10 dígitos
- Asegúrate de incluir el código de área

## 📞 Soporte

Para problemas o preguntas sobre el sistema de verificación, revisa:
1. Los logs del backend en `storage/logs/laravel.log`
2. Los logs del frontend en la consola del navegador
3. El estado de la base de datos en la tabla `verification_codes`



