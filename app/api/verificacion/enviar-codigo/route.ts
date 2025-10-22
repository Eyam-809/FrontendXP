import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono } = body;

    if (!telefono) {
      return NextResponse.json(
        { error: 'Número de teléfono requerido' },
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
    const response = await fetch(`${backendUrl}/api/verificacion/enviar-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        telefono: cleanPhone
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || 'Error al enviar código',
          details: data.error || 'Error desconocido'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: data.message,
      expires_in_minutes: data.expires_in_minutes,
      phone_number: data.phone_number
    });

  } catch (error) {
    console.error('Error en API de envío de código:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


