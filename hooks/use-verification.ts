import { useState } from 'react';

interface VerificationState {
  isLoading: boolean;
  error: string;
  success: string;
}

interface SendCodeResponse {
  message: string;
  expires_in_minutes: number;
  phone_number: string;
}

interface VerifyCodeResponse {
  message: string;
  verified: boolean;
  phone_number: string;
}

export function useVerification() {
  const [state, setState] = useState<VerificationState>({
    isLoading: false,
    error: '',
    success: ''
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, success: '' }));
  };

  const setSuccess = (success: string) => {
    setState(prev => ({ ...prev, success, error: '' }));
  };

  const clearMessages = () => {
    setState(prev => ({ ...prev, error: '', success: '' }));
  };

  const sendCode = async (phoneNumber: string): Promise<SendCodeResponse | null> => {
    setLoading(true);
    clearMessages();

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

      if (!response.ok) {
        setError(data.message || 'Error al enviar código');
        return null;
      }

      setSuccess('¡Código enviado exitosamente!');
      return data;

    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (phoneNumber: string, code: string): Promise<VerifyCodeResponse | null> => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/verificacion/verificar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefono: phoneNumber,
          codigo: code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Código inválido o expirado');
        return null;
      }

      if (data.verified) {
        setSuccess('¡Código verificado exitosamente!');
        return data;
      } else {
        setError('Código inválido');
        return null;
      }

    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state,
    sendCode,
    verifyCode,
    setError,
    setSuccess,
    clearMessages
  };
}



