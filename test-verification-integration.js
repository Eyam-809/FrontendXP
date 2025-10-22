// Script de prueba para verificar la integración frontend-backend
// Ejecutar con: node test-verification-integration.js

const testVerificationFlow = async () => {
  const API_BASE = 'http://localhost:3000/api';
  const phoneNumber = '9992694926';

  console.log('🧪 Iniciando prueba de integración de verificación...\n');

  try {
    // Paso 1: Enviar código
    console.log('1️⃣ Enviando código de verificación...');
    const sendResponse = await fetch(`${API_BASE}/verificacion/enviar-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telefono: phoneNumber
      }),
    });

    const sendData = await sendResponse.json();
    
    if (sendResponse.ok) {
      console.log('✅ Código enviado exitosamente');
      console.log(`   📱 Número: ${sendData.phone_number}`);
      console.log(`   ⏰ Expira en: ${sendData.expires_in_minutes} minutos`);
      console.log(`   📨 Mensaje: ${sendData.message}\n`);
      
      // Paso 2: Simular verificación (usar código de prueba)
      console.log('2️⃣ Verificando código (simulación)...');
      const testCode = '1234'; // Código de prueba
      
      const verifyResponse = await fetch(`${API_BASE}/verificacion/verificar-codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefono: phoneNumber,
          codigo: testCode
        }),
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok && verifyData.verified) {
        console.log('✅ Código verificado exitosamente');
        console.log(`   📱 Número verificado: ${verifyData.phone_number}`);
        console.log(`   🎉 Estado: ${verifyData.message}\n`);
      } else {
        console.log('⚠️ Verificación falló (esperado para código de prueba)');
        console.log(`   ❌ Error: ${verifyData.message || verifyData.error}\n`);
      }
      
    } else {
      console.log('❌ Error al enviar código');
      console.log(`   Error: ${sendData.error || sendData.message}\n`);
    }

    console.log('🎯 Prueba completada');
    console.log('\n📋 Flujo de verificación:');
    console.log('   1. Usuario ingresa número de teléfono');
    console.log('   2. Frontend llama a /api/verificacion/enviar-codigo');
    console.log('   3. Backend envía SMS con código de 4 dígitos');
    console.log('   4. Usuario ingresa código recibido');
    console.log('   5. Frontend llama a /api/verificacion/verificar-codigo');
    console.log('   6. Backend valida el código');
    console.log('   7. Usuario es redirigido a la página principal');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.log('\n🔧 Verifica que:');
    console.log('   - El frontend esté ejecutándose en http://localhost:3000');
    console.log('   - El backend esté ejecutándose en http://localhost:8000');
    console.log('   - Las rutas API estén configuradas correctamente');
  }
};

// Ejecutar la prueba
testVerificationFlow();



