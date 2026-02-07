// Native Push Notifications for Mobile App (iOS & Android)
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// Types
interface Token {
  value: string;
}

interface PushNotificationSchema {
  title?: string;
  body?: string;
  id: string;
  badge?: number;
  notification?: any;
  data?: any;
  click_action?: string;
  link?: string;
  group?: string;
  groupSummary?: boolean;
}

interface ActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: PushNotificationSchema;
}

// Check if running on native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform(); // 'ios', 'android', or 'web'
};

// Initialize push notifications
export const initializePushNotifications = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
  console.log('🔔 Inicializando notificações push nativas...');
  console.log('📱 Plataforma:', getPlatform());

  if (!isNativePlatform()) {
    console.log('⚠️ Não é plataforma nativa, usando notificações web');
    return { success: false, error: 'Not a native platform' };
  }

  try {
    // Request permission
    console.log('📝 Solicitando permissão...');
    const permResult = await PushNotifications.requestPermissions();
    console.log('📬 Resultado da permissão:', permResult);

    if (permResult.receive !== 'granted') {
      console.log('❌ Permissão negada');
      return { success: false, error: 'Permission denied' };
    }

    // Register for push notifications
    console.log('📲 Registrando para notificações push...');
    await PushNotifications.register();

    return new Promise((resolve) => {
      // Listen for registration success
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('✅ Push registration success, token:', token.value);
        
        // Save token to localStorage and backend
        localStorage.setItem('fcm-token', token.value);
        saveFCMTokenToBackend(token.value);
        
        resolve({ success: true, token: token.value });
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('❌ Error on registration:', error);
        resolve({ success: false, error: error.error });
      });

      // Set timeout to avoid hanging
      setTimeout(() => {
        resolve({ success: false, error: 'Registration timeout' });
      }, 10000);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar push notifications:', error);
    return { success: false, error: String(error) };
  }
};

// Setup push notification listeners
export const setupPushListeners = (): void => {
  console.log('🎧 Configurando listeners de notificações...');

  // Show notifications when received (foreground)
  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('📬 Notificação recebida (app em primeiro plano):', notification);
    
    // You can show a custom in-app notification here if needed
    // Or use Local Notifications to show it
    showLocalNotification(notification.title || 'Óticas Carol', notification.body || '');
  });

  // Handle notification click/action
  PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
    console.log('👆 Notificação clicada:', notification);
    
    // Navigate to specific screen based on notification data
    const data = notification.notification.data;
    if (data && data.type) {
      handleNotificationNavigation(data.type);
    }
  });
};

// Show local notification (for foreground notifications)
const showLocalNotification = async (title: string, body: string): Promise<void> => {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao mostrar notificação local:', error);
  }
};

// Handle navigation based on notification type
const handleNotificationNavigation = (type: string): void => {
  console.log('🧭 Navegando para:', type);
  
  switch (type) {
    case 'new-request':
      window.location.hash = '#/aprovar';
      break;
    case 'approved':
    case 'rejected':
      window.location.hash = '#/minhas-solicitacoes';
      break;
    default:
      window.location.hash = '#/';
  }
};

// Save FCM token to backend
const saveFCMTokenToBackend = async (token: string): Promise<void> => {
  try {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId) {
      console.log('⚠️ Usuário não logado, não salvando token');
      return;
    }

    console.log('💾 Salvando FCM token no backend...');
    
    // Import from info after we know we need it
    const { projectId, publicAnonKey } = await import('/utils/supabase/info');
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b2c42f95/save-fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        userId,
        email: userEmail,
        fcmToken: token,
        platform: getPlatform()
      })
    });

    if (response.ok) {
      console.log('✅ FCM token salvo com sucesso');
    } else {
      const error = await response.text();
      console.error('❌ Erro ao salvar FCM token:', error);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar FCM token:', error);
  }
};

// Get stored FCM token
export const getFCMToken = (): string | null => {
  return localStorage.getItem('fcm-token');
};

// Remove FCM token (on logout)
export const removeFCMToken = async (): Promise<void> => {
  try {
    const token = getFCMToken();
    if (!token) return;

    console.log('🗑️ Removendo FCM token...');
    
    const { projectId, publicAnonKey } = await import('/utils/supabase/info');
    
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b2c42f95/remove-fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ fcmToken: token })
    });

    localStorage.removeItem('fcm-token');
    console.log('✅ FCM token removido');
  } catch (error) {
    console.error('❌ Erro ao remover FCM token:', error);
  }
};

// Get notification delivery stats
export const getDeliveredNotifications = async (): Promise<PushNotificationSchema[]> => {
  const delivered = await PushNotifications.getDeliveredNotifications();
  return delivered.notifications;
};

// Clear all delivered notifications
export const removeAllDeliveredNotifications = async (): Promise<void> => {
  await PushNotifications.removeAllDeliveredNotifications();
  console.log('🗑️ Todas as notificações entregues foram removidas');
};