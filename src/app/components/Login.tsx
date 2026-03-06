import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { auth } from '../../lib/api';
import { projectId } from '/utils/supabase/info';
import type { User } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔑 Tentando fazer login com:', email);
      console.log('🌐 API Base:', `https://${projectId}.supabase.co/functions/v1/make-server-b2c42f95`);
      
      const result = await auth.signin(email, password);
      console.log('✅ Login bem-sucedido:', result);
      onLogin(result.user);
    } catch (err) {
      console.error('❌ Erro no login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      console.error('❌ Mensagem de erro:', errorMessage);
      
      // Se for erro de rede, mostrar mensagem mais específica
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Erro de conexão com o servidor. Verifique sua conexão com a internet ou se o backend está online.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gray-900">ÓTICAS</span>
            <span className="text-gray-400 mx-1">_</span>
            <span className="text-amber-500">CAROL</span>
          </h1>
          <p className="text-gray-600 text-sm">Sistema de Controle Operacional</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 Óticas Carol. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}