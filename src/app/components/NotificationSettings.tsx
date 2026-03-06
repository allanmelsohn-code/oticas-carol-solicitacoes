import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Bell, BellOff, Volume2, VolumeX, AlertCircle, Chrome } from 'lucide-react';
import {
  isNotificationSupported,
  areNotificationsEnabled,
  requestNotificationPermission,
  disableNotifications,
  showNotification,
  getBrowserInfo
} from '../../lib/notifications';

export function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ name: '', isSafari: false, isIOS: false });

  useEffect(() => {
    console.log('🔍 Verificando suporte a notificações...');
    const browser = getBrowserInfo();
    setBrowserInfo(browser);
    
    const isSupported = isNotificationSupported();
    setSupported(isSupported);
    console.log('✅ Suporte:', isSupported);
    console.log('🌐 Navegador:', browser);
    
    if (isSupported) {
      const currentPermission = Notification.permission;
      const isEnabled = areNotificationsEnabled();
      
      console.log('📋 Status atual:');
      console.log('  - Permissão do navegador:', currentPermission);
      console.log('  - Notificações ativadas:', isEnabled);
      
      setEnabled(isEnabled);
      setPermission(currentPermission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    console.log('🔔 Tentando ativar notificações...');
    setLoading(true);
    
    try {
      const result = await requestNotificationPermission();
      console.log('📬 Resultado:', result);
      
      if (result.granted) {
        console.log('✅ Permissão concedida!');
        setEnabled(true);
        setPermission(Notification.permission);
        
        // Show test notification
        setTimeout(() => {
          showNotification({
            title: '🔔 Notificações Ativadas!',
            body: 'Você receberá alertas sobre suas solicitações.',
            requireInteraction: false
          });
        }, 500);
      } else {
        console.log('❌ Permissão negada');
        setPermission(Notification.permission);
      }
    } catch (error) {
      console.error('❌ Erro ao ativar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    console.log('🔕 Desativando notificações...');
    disableNotifications();
    setEnabled(false);
  };

  const handleTestNotification = () => {
    console.log('🧪 Botão de teste clicado!');
    console.log('📋 Status antes do teste:');
    console.log('  - Suportado:', supported);
    console.log('  - Permissão:', permission);
    console.log('  - Ativado:', enabled);
    console.log('  - Notification.permission:', Notification.permission);
    console.log('  - localStorage:', localStorage.getItem('notifications-enabled'));
    
    try {
      showNotification({
        title: '🧪 Notificação de Teste',
        body: 'Esta é uma notificação de teste do sistema Óticas Carol!',
        requireInteraction: false
      });
      console.log('✅ Função showNotification executada');
    } catch (error) {
      console.error('❌ Erro ao chamar showNotification:', error);
      alert('Erro ao enviar notificação: ' + error);
    }
  };

  // Debug info card
  const DebugInfo = () => (
    <Card className="bg-gray-50 border border-gray-300">
      <CardContent className="p-3">
        <p className="text-xs font-mono text-gray-700">
          <strong>Debug:</strong><br />
          Suportado: {supported ? '✅ Sim' : '❌ Não'}<br />
          Permissão: {permission}<br />
          Ativado: {enabled ? '✅ Sim' : '❌ Não'}
        </p>
      </CardContent>
    </Card>
  );

  if (!supported) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Notificações</h2>
          <p className="text-gray-500 mt-1">Configure os alertas do sistema</p>
        </div>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <BellOff className="w-5 h-5" />
              Notificações Não Suportadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              Seu navegador não suporta notificações push. 
              Por favor, use uma versão mais recente do Chrome, Firefox, Edge ou Safari.
            </p>
          </CardContent>
        </Card>
        
        <DebugInfo />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Notificações</h2>
        <p className="text-gray-500 mt-1">Configure os alertas do sistema</p>
      </div>

      {/* Safari Warning */}
      {browserInfo.isSafari && !browserInfo.isIOS && (
        <Card className="bg-orange-50 border-2 border-orange-300">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5" />
              ⚠️ Safari Detectado - Suporte Limitado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-orange-900">
              O Safari tem suporte limitado a notificações web. Você pode ativá-las, mas elas podem não funcionar corretamente em todas as situações.
            </p>
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">✅ Recomendação:</p>
              <p className="text-sm text-gray-700">
                Para a melhor experiência com notificações, recomendamos usar:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 ml-2 space-y-1">
                <li><strong>Google Chrome</strong> (recomendado)</li>
                <li><strong>Microsoft Edge</strong></li>
                <li><strong>Mozilla Firefox</strong></li>
              </ul>
            </div>
            <p className="text-xs text-orange-800 italic">
              Você pode continuar usando o Safari, mas as notificações podem não aparecer ou ter atraso.
            </p>
          </CardContent>
        </Card>
      )}

      {browserInfo.isIOS && (
        <Card className="bg-red-50 border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <BellOff className="w-5 h-5" />
              ❌ Safari iOS Não Suportado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-900">
              Infelizmente, o Safari no iPhone/iPad não suporta notificações web push.
            </p>
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">🔄 Alternativas:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                <li>Acesse o sistema pelo computador (Chrome, Edge ou Firefox)</li>
                <li>Use o Google Chrome no seu iPhone/iPad</li>
                <li>Configure lembretes manuais para verificar o sistema</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configurações de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <h3 className="font-medium text-gray-900 flex items-center gap-2 text-lg">
                {enabled ? (
                  <>
                    <Volume2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Notificações Ativadas</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Notificações Desativadas</span>
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {enabled ? (
                  'Você receberá alertas em tempo real sobre suas solicitações.'
                ) : (
                  'Ative para receber alertas quando houver atualizações.'
                )}
              </p>
              
              {enabled && (
                <div className="mt-4 space-y-2 text-sm text-gray-700 bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="font-medium text-green-900">✅ Você será notificado quando:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-green-800">
                    <li>Uma nova solicitação for criada (aprovadores)</li>
                    <li>Sua solicitação for aprovada</li>
                    <li>Sua solicitação for reprovada</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              {!enabled ? (
                <Button 
                  onClick={handleEnableNotifications} 
                  className="whitespace-nowrap w-full"
                  size="lg"
                  disabled={loading}
                >
                  <Bell className="w-5 h-5 mr-2" />
                  {loading ? 'Ativando...' : 'Ativar Notificações'}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleTestNotification} 
                    variant="default"
                    className="whitespace-nowrap w-full"
                    size="lg"
                  >
                    🧪 Testar Notificação
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('🔥 TESTE DIRETO - Criando notificação sem verificações...');
                      try {
                        const n = new Notification('🔥 TESTE DIRETO', {
                          body: 'Se você vê isto, as notificações funcionam!',
                          icon: '/favicon.ico'
                        });
                        console.log('✅ Notificação criada:', n);
                      } catch (e) {
                        console.error('❌ Erro:', e);
                        alert('Erro: ' + e);
                      }
                    }}
                    variant="outline"
                    className="whitespace-nowrap w-full"
                    size="lg"
                  >
                    🔥 Teste Direto (Debug)
                  </Button>
                  <Button 
                    onClick={handleDisableNotifications} 
                    variant="outline"
                    className="whitespace-nowrap w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    size="lg"
                  >
                    <BellOff className="w-4 h-4 mr-2" />
                    Desativar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Permission Denied Warning */}
          {permission === 'denied' && (
            <div className="bg-red-50 border-2 border-red-300 text-red-900 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">⚠️ Permissão Bloqueada</p>
                  <p className="mt-1 text-sm">
                    As notificações foram bloqueadas no seu navegador. 
                    Siga as instruções abaixo para desbloquear.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions when blocked */}
          {permission === 'denied' && (
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
              <CardHeader>
                <CardTitle className="text-red-900 text-lg">
                  🔓 Como Desbloquear Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-gray-900">📱 No Celular (Chrome/Safari):</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>Toque no <strong>ícone de cadeado</strong> 🔒 na barra de endereços (ao lado da URL)</li>
                    <li>Toque em <strong>"Permissões"</strong> ou <strong>"Configurações do site"</strong></li>
                    <li>Localize <strong>"Notificações"</strong></li>
                    <li>Altere para <strong>"Permitir"</strong> ✅</li>
                    <li>Recarregue a página e tente novamente</li>
                  </ol>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-gray-900">💻 No Computador:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>Clique no <strong>ícone de cadeado</strong> 🔒 no canto esquerdo da barra de endereços</li>
                    <li>Procure por <strong>"Notificações"</strong> na lista de permissões</li>
                    <li>Clique e selecione <strong>"Permitir"</strong> ✅</li>
                    <li>Recarregue a página (F5)</li>
                    <li>Clique em "Ativar Notificações" novamente</li>
                  </ol>
                </div>

                <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-900">
                  <p className="font-medium">💡 Ainda não funciona?</p>
                  <p className="mt-1">
                    Tente fechar completamente o navegador e abrir novamente. 
                    Se o problema persistir, acesse em outro navegador (Chrome ou Firefox recomendados).
                  </p>
                </div>

                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  🔄 Recarregar Página
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tip when not blocked */}
          {permission !== 'denied' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">💡 Dica</p>
              <p className="mt-1">
                Mantenha esta aba aberta em segundo plano para receber notificações em tempo real.
                As notificações aparecem mesmo quando você está em outra aba ou aplicativo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <DebugInfo />
    </div>
  );
}