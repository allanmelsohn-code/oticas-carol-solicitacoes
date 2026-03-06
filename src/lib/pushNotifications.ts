// Web Push Notifications (Browser only)

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Always return 'web' platform
export const isNativePlatform = (): boolean => {
  return false;
};

export const getPlatform = (): string => {
  return 'web';
};

// Initialize web push notifications
export const initializePushNotifications = async (): Promise<{ success: boolean; error?: string }> => {
  console.log('🔔 Inicializando notificações web...');

  if (!isNotificationSupported()) {
    console.log('⚠️ Notificações não suportadas neste navegador');
    return { success: false, error: 'Notifications not supported' };
  }

  try {
    // Request permission
    console.log('📝 Solicitando permissão...');
    const permission = await Notification.requestPermission();
    console.log('📬 Resultado da permissão:', permission);

    if (permission !== 'granted') {
      console.log('❌ Permissão negada');
      return { success: false, error: 'Permission denied' };
    }

    console.log('✅ Permissão concedida para notificações web');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao inicializar notificações:', error);
    return { success: false, error: String(error) };
  }
};

// Setup push notification listeners (no-op for web)
export const setupPushListeners = (): void => {
  console.log('🎧 Listeners de notificações web (navegador gerencia automaticamente)');
};

// Get notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

// Show a local notification (for testing)
export const showLocalNotification = (title: string, body: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported()) {
    console.warn('Notificações não suportadas');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Permissão de notificação não concedida');
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    });
    console.log('✅ Notificação exibida:', title);
  } catch (error) {
    console.error('❌ Erro ao exibir notificação:', error);
  }
};

// Get FCM token (not applicable for web push)
export const getFCMToken = (): string | null => {
  return null;
};

// Remove FCM token (not applicable for web push)
export const removeFCMToken = async (): Promise<void> => {
  console.log('ℹ️ Web push não usa FCM tokens');
};
