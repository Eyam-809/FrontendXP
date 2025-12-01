'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Phone, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useVerification } from '@/hooks/use-verification';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(600); // 10 minutos
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');

  const { isLoading, error, success, sendCode, verifyCode, setError, setSuccess } = useVerification();

  // Obtener parámetros de la URL
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const emailParam = searchParams.get('email');
    
    if (phoneParam) {
      setPhoneNumber(phoneParam);
      setStep('code'); // Si viene con teléfono, ir directo al código
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Por favor ingresa tu número de teléfono');
      return;
    }

    const result = await sendCode(phoneNumber);
    if (result) {
      setStep('code');
      setCountdown(600);
      setCanResend(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-verificar si se completa
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      handleCodeVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length === 4) {
      const newCode = digits.split('');
      setCode(newCode);
      handleCodeVerification(digits);
    }
  };

  const handleCodeVerification = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 4) {
      setError('Por favor ingresa un código de 4 dígitos');
      return;
    }

    const result = await verifyCode(phoneNumber, codeToVerify);
    if (result && result.verified) {
      setTimeout(() => {
        // Redirigir al login con mensaje de éxito
        router.push('/login?verified=true');
      }, 1500);
    } else {
      // Limpiar código en caso de error
      setCode(['', '', '', '']);
      const firstInput = document.getElementById('code-0');
      if (firstInput) firstInput.focus();
    }
  };

  const handleResendCode = async () => {
    const result = await sendCode(phoneNumber);
    if (result) {
      setCountdown(600);
      setCanResend(false);
      setCode(['', '', '', '']);
      const firstInput = document.getElementById('code-0');
      if (firstInput) firstInput.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    if (numbers.length <= 10) return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F3EF] to-[#E8DDD4] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/login')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold text-[#1B3C53]">Verificar Teléfono</CardTitle>
              <div className="w-10" />
            </div>
            <CardDescription className="text-[#456882]">
              Ingresa tu número de teléfono para recibir un código de verificación
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-[#1B3C53]">
                  Número de teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#456882]" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="999 123 4567"
                    value={formatPhoneNumber(phoneNumber)}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="pl-10 text-[#1B3C53] placeholder:text-[#456882]"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-[#456882]">
                  Incluye el código de área (ej: 999 para Yucatán)
                </p>
              </div>

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

              <Button
                type="submit"
                disabled={isLoading || phoneNumber.length < 10}
                className="w-full bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#456882] hover:to-[#1B3C53] text-white"
              >
                {isLoading ? 'Enviando código...' : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Enviar Código
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-[#456882]">
              <p>Al continuar, aceptas recibir mensajes SMS</p>
              <p>Se aplicarán tarifas estándar de tu operador</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F3EF] to-[#E8DDD4] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('phone')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-[#1B3C53]">Verificar Código</CardTitle>
            <div className="w-10" />
          </div>
          <CardDescription className="text-[#456882]">
            Hemos enviado un código de 4 dígitos al número
            <br />
            <span className="font-semibold text-[#1B3C53]">+52 {phoneNumber}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center space-x-3">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-[#1B3C53] text-[#1B3C53]"
                disabled={isLoading}
              />
            ))}
          </div>

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

          <div className="text-center">
            <p className="text-sm text-[#456882]">
              El código expira en:{' '}
              <span className={`font-mono font-bold ${countdown < 60 ? 'text-red-500' : 'text-[#1B3C53]'}`}>
                {formatTime(countdown)}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleCodeVerification()}
              disabled={isLoading || code.join('').length !== 4}
              className="w-full bg-gradient-to-r from-[#1B3C53] to-[#456882] hover:from-[#456882] hover:to-[#1B3C53] text-white"
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
              className="w-full border-[#1B3C53] text-[#1B3C53] hover:bg-[#1B3C53] hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reenviar Código
            </Button>
          </div>

          <div className="text-center text-xs text-[#456882]">
            <p>¿No recibiste el código?</p>
            <p>Verifica tu número de teléfono o intenta reenviar el código.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}