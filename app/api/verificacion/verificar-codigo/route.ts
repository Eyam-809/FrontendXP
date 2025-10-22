import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono, codigo } = body;

    if (!telefono || !codigo) {
      return NextResponse.json(
        { error: 'Número de teléfono y código requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del código
    if (!/^\d{4}$/.test(codigo)) {
      return NextResponse.json(
        { error: 'El código debe tener exactamente 4 dígitos' },
        { status: 400 }
      );
    }

    // Validar formato del número
    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Número de teléfono inválido' },
        { status: 400 }
      );
    }

    // Llamar al backend de Laravel
    const backendUrl = 'https://backendxp-1.onrender.com';
    const response = await fetch(`${backendUrl}/api/verificacion/verificar-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        telefono: cleanPhone,
        codigo: codigo
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || 'Error al verificar código',
          details: data.error || 'Error desconocido'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: data.message,
      verified: data.verified,
      phone_number: data.phone_number
    });

  } catch (error) {
    console.error('Error en API de verificación de código:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


