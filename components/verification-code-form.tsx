'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VerificationCodeFormProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export default function VerificationCodeForm({ 
  phoneNumber, 
  onVerificationSuccess, 
  onBack 
}: VerificationCodeFormProps) {
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutos en segundos
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus en el primer input
  useEffect(() => {
    const firstInput = document.getElementById('code-0');
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Si se completa el código, verificar automáticamente
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      handleVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length === 4) {
      const newCode = digits.split('');
      setCode(newCode);
      handleVerification(digits);
    }
  };

  const handleVerification = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 4) {
      setError('Por favor ingresa un código de 4 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/verificacion/verificar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefono: phoneNumber,
          codigo: codeToVerify
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess('¡Código verificado exitosamente!');
        setTimeout(() => {
          onVerificationSuccess();
          router.push('/');
        }, 1500);
      } else {
        setError(data.message || 'Código inválido o expirado');
        // Limpiar el código en caso de error
        setCode(['', '', '', '']);
        const firstInput = document.getElementById('code-0');
        if (firstInput) {
          firstInput.focus();
        }
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/verificacion/enviar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefono: phoneNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Código reenviado exitosamente!');
        setCountdown(600); // Resetear countdown
        setCanResend(false);
        setCode(['', '', '', '']); // Limpiar código actual
        const firstInput = document.getElementById('code-0');
        if (firstInput) {
          firstInput.focus();
        }
      } else {
        setError(data.message || 'Error al reenviar código');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Verificar Código</CardTitle>
            <div className="w-10" /> {/* Spacer */}
          </div>
          <CardDescription>
            Hemos enviado un código de 4 dígitos al número
            <br />
            <span className="font-semibold text-blue-600">+52 {phoneNumber}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inputs para el código */}
          <div className="flex justify-center space-x-3">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-blue-500"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Mensajes de estado */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              El código expira en:{' '}
              <span className={`font-mono font-bold ${countdown < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                {formatTime(countdown)}
              </span>
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Button
              onClick={() => handleVerification()}
              disabled={isLoading || code.join('').length !== 4}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={!canResend || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar Código
                </>
              )}
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-center text-xs text-gray-500">
            <p>¿No recibiste el código?</p>
            <p>Verifica tu número de teléfono o intenta reenviar el código.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



