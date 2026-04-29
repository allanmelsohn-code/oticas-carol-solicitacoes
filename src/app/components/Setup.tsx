import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Database, Loader2 } from 'lucide-react';
import { setup } from '../../lib/api';

export function Setup() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runSetup = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('🚀 Running setup...');
      
      const data = await setup.run();
      console.log('✅ Setup response:', data);

      if (data.success) {
        const usersCreated = data.results.users.filter((u: any) => u.status === 'created').length;
        const usersExisting = data.results.users.filter((u: any) => u.status === 'already_exists').length;
        const usersUpdated = data.results.users.filter((u: any) => u.status === 'password_updated').length;
        const storesCreated = data.results.stores.filter((s: any) => s.status === 'created').length;
        const storesExisting = data.results.stores.filter((s: any) => s.status === 'already_exists').length;

        let message = '✅ Setup concluído com sucesso!\n\n';
        
        if (usersCreated > 0) {
          message += `👤 ${usersCreated} usuário(s) criado(s)\n`;
        }
        if (usersUpdated > 0) {
          message += `🔄 ${usersUpdated} senha(s) atualizada(s)\n`;
        }
        if (usersExisting > 0 && usersUpdated === 0) {
          message += `👤 ${usersExisting} usuário(s) já existiam\n`;
        }
        if (storesCreated > 0) {
          message += `🏪 ${storesCreated} loja(s) criada(s)\n`;
        }
        if (storesExisting > 0) {
          message += `🏪 ${storesExisting} loja(s) já existiam\n`;
        }

        message += '\n📧 Credenciais de login:\n';
        message += '• Aprovadores:\n';
        message += '  - admin@oticascarol.com.br / admin123\n';
        message += '  - chris@oticascarol.com.br / chris123\n';
        message += '• Lojas (todas com senha123):\n';
        message += '  - loja1640@oticascarol.com.br (Frei Caneca)\n';
        message += '  - loja1687@oticascarol.com.br (Center 3)\n';
        message += '  - loja1688@oticascarol.com.br (Villalobos)\n';
        message += '  - loja2189@oticascarol.com.br (Vila Olimpia)\n';
        message += '  - loja2667@oticascarol.com.br (Patio Paulista)\n';
        message += '  - loja2605@oticascarol.com.br (Canario)\n';
        message += '  - loja2606@oticascarol.com.br (Ibirapuera)\n';
        message += '  - loja2682@oticascarol.com.br (Morumbi Town)\n';
        message += '  - loja2783@oticascarol.com.br (Maracatins)';

        setSuccess(message);

        if (data.results.errors && data.results.errors.length > 0) {
          console.warn('Alguns erros ocorreram:', data.results.errors);
        }
      } else {
        setError('❌ Erro no setup: ' + (data.error || 'erro desconhecido'));
      }
    } catch (err) {
      console.error('Setup error:', err);
      setError(`❌ Erro ao executar setup: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('setup');
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Óticas Carol</h1>
          <p className="text-gray-600 mt-2">Sistema de Controle Operacional</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuração Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">O que será criado:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>2 Usuários Aprovadores:</strong> admin@oticascarol.com.br e chris@oticascarol.com.br</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>9 Usuários de Loja:</strong> com emails loja[número]@oticascarol.com.br e senha padrão</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>9 Lojas:</strong> Frei Caneca, Center 3, Villalobos, Vila Olímpia, Patio Paulista, Canário, Ibirapuera, Morumbi Town, Maracatins</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Tabela de Preços:</strong> 5 serviços de montagem (Aro Fechado, Nylon, Alto Índice, Ballgriff, Multifocal)</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={runSetup} 
              className="w-full h-12 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Executando Setup...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Executar Setup Completo
                </>
              )}
            </Button>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm whitespace-pre-line">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <Button 
                onClick={goToLogin} 
                variant="outline"
                className="w-full"
              >
                Ir para Login →
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📋 Após o Setup</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Faça login como aprovador ou como loja</li>
              <li>Aprovador: <code className="bg-gray-200 px-1 rounded">admin@oticascarol.com.br</code> / <code className="bg-gray-200 px-1 rounded">admin123</code></li>
              <li>Loja: <code className="bg-gray-200 px-1 rounded">loja[número]@oticascarol.com.br</code> / <code className="bg-gray-200 px-1 rounded">senha123</code></li>
              <li>Comece a criar solicitações e aprovar!</li>
            </ol>
          </CardContent>
        </Card>

        {/* User Management Section */}
        {/* <UserManagement /> */}

        <div className="text-center text-xs text-gray-500">
          <p>Versão 1.0 • Desenvolvido para Óticas Carol</p>
        </div>
      </div>
    </div>
  );
}