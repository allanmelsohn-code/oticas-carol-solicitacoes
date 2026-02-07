// Notification System for Óticas Carol

export interface NotificationPermission {
  granted: boolean;
  supported: boolean;
  browser?: string;
}

export function getBrowserInfo(): { name: string; isSafari: boolean; isIOS: boolean } {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  
  let name = 'Desconhecido';
  if (ua.includes('Firefox')) name = 'Firefox';
  else if (ua.includes('Chrome')) name = 'Chrome';
  else if (ua.includes('Safari')) name = 'Safari';
  else if (ua.includes('Edge')) name = 'Edge';
  
  console.log('🌐 Navegador detectado:', { name, isSafari, isIOS, userAgent: ua });
  
  return { name, isSafari, isIOS };
}

export function isNotificationSupported(): boolean {
  const { isSafari, isIOS } = getBrowserInfo();
  
  // Safari no iOS não suporta Web Notifications API
  if (isIOS) {
    console.log('❌ iOS Safari não suporta notificações web');
    return false;
  }
  
  // Safari no macOS tem suporte limitado
  if (isSafari) {
    console.log('⚠️ Safari detectado - suporte limitado a notificações');
    // Ainda retorna true, mas com aviso
  }
  
  const supported = 'Notification' in window;
  console.log('🔍 Notification in window:', supported);
  
  return supported;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const browserInfo = getBrowserInfo();
  
  if (!isNotificationSupported()) {
    console.log('❌ Notificações não suportadas');
    return { granted: false, supported: false, browser: browserInfo.name };
  }

  try {
    console.log('📝 Solicitando permissão ao usuário...');
    const permission = await Notification.requestPermission();
    console.log('📬 Permissão recebida:', permission);
    
    const granted = permission === 'granted';
    
    if (granted) {
      localStorage.setItem('notifications-enabled', 'true');
      console.log('✅ Notificações habilitadas e salvas no localStorage');
    } else {
      console.log('⚠️ Permissão negada pelo usuário');
    }
    
    return { granted, supported: true, browser: browserInfo.name };
  } catch (error) {
    console.error('❌ Erro ao solicitar permissão de notificação:', error);
    return { granted: false, supported: true, browser: browserInfo.name };
  }
}

export function areNotificationsEnabled(): boolean {
  if (!isNotificationSupported()) {
    console.log('❌ Notificações não suportadas no navegador');
    return false;
  }
  
  const hasPermission = Notification.permission === 'granted';
  const isEnabled = localStorage.getItem('notifications-enabled') === 'true';
  
  console.log('🔍 Status:', { 
    hasPermission, 
    isEnabled, 
    permission: Notification.permission,
    localStorage: localStorage.getItem('notifications-enabled')
  });
  
  return hasPermission && isEnabled;
}

export function disableNotifications(): void {
  localStorage.setItem('notifications-enabled', 'false');
  console.log('🔕 Notificações desabilitadas');
}

export function enableNotifications(): void {
  localStorage.setItem('notifications-enabled', 'true');
  console.log('🔔 Notificações habilitadas');
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

export async function showNotification(options: NotificationOptions): Promise<void> {
  console.log('🔔 showNotification chamada com:', options);
  
  // Check if supported
  if (!isNotificationSupported()) {
    console.error('❌ Notificações não suportadas');
    alert('Seu navegador não suporta notificações. Por favor, use Chrome, Firefox ou Edge.');
    return;
  }

  // Check permission
  console.log('📋 Verificando permissão:', Notification.permission);
  if (Notification.permission !== 'granted') {
    console.error('❌ Permissão não concedida. Status:', Notification.permission);
    alert('Por favor, ative as notificações primeiro clicando em "Ativar Notificações".');
    return;
  }

  // Check if enabled in settings
  const enabled = localStorage.getItem('notifications-enabled') === 'true';
  console.log('📋 Notificações ativadas no sistema:', enabled);
  
  if (!enabled) {
    console.error('❌ Notificações desabilitadas nas configurações');
    alert('Notificações desabilitadas. Por favor, ative-as primeiro.');
    return;
  }

  try {
    console.log('✅ Criando notificação...');
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'oticas-carol',
      requireInteraction: options.requireInteraction || false,
      data: options.data,
      silent: false,
    });

    console.log('✅ Notificação criada com sucesso!', notification);

    // Auto-close after 10 seconds if not requiring interaction
    if (!options.requireInteraction) {
      setTimeout(() => {
        console.log('⏰ Fechando notificação automaticamente');
        notification.close();
      }, 10000);
    }

    notification.onclick = () => {
      console.log('👆 Notificação clicada');
      window.focus();
      notification.close();
    };

    notification.onerror = (error) => {
      console.error('❌ Erro na notificação:', error);
    };

    notification.onshow = () => {
      console.log('👁️ Notificação exibida');
    };

    notification.onclose = () => {
      console.log('🚪 Notificação fechada');
    };

    console.log('📬 Notificação enviada com sucesso:', options.title);
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    alert(`Erro ao mostrar notificação: ${error}`);
  }
}

// Specific notification types for the system

export function notifyNewRequest(storeName: string, type: string, value: number): void {
  console.log('🆕 Notificando nova solicitação...');
  showNotification({
    title: '🆕 Nova Solicitação Pendente',
    body: `${storeName} criou uma solicitação de ${type} no valor de R$ ${value.toFixed(2).replace('.', ',')}`,
    tag: 'new-request',
    requireInteraction: true,
    data: { type: 'new-request' }
  });
}

export function notifyRequestApproved(type: string, value: number, observation?: string): void {
  console.log('✅ Notificando aprovação...');
  showNotification({
    title: '✅ Solicitação Aprovada',
    body: `Sua solicitação de ${type} (R$ ${value.toFixed(2).replace('.', ',')}) foi aprovada!${observation ? ` - ${observation}` : ''}`,
    tag: 'request-approved',
    requireInteraction: false,
    data: { type: 'approved' }
  });
}

export function notifyRequestRejected(type: string, value: number, observation: string): void {
  console.log('❌ Notificando reprovação...');
  showNotification({
    title: '❌ Solicitação Reprovada',
    body: `Sua solicitação de ${type} (R$ ${value.toFixed(2).replace('.', ',')}) foi reprovada. Motivo: ${observation}`,
    tag: 'request-rejected',
    requireInteraction: true,
    data: { type: 'rejected' }
  });
}

export function notifyPendingRequests(count: number, totalValue: number): void {
  if (count === 0) return;
  
  console.log('📋 Notificando solicitações pendentes...');
  showNotification({
    title: `📋 ${count} Solicitaç${count === 1 ? 'ão' : 'ões'} Pendente${count === 1 ? '' : 's'}`,
    body: `Você tem ${count} solicitaç${count === 1 ? 'ão' : 'ões'} aguardando aprovação. Valor total: R$ ${totalValue.toFixed(2).replace('.', ',')}`,
    tag: 'pending-summary',
    requireInteraction: false,
    data: { type: 'summary', count }
  });
}
