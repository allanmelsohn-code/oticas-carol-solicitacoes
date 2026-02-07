// Firebase Cloud Messaging - Push Notifications
// This file handles sending push notifications via FCM

import * as kv from './kv_store.tsx';

// FCM Server Key - deve ser configurado nas variáveis de ambiente
// Obtenha em: Firebase Console > Project Settings > Cloud Messaging > Server Key
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY') || '';

interface FCMToken {
  userId: string;
  email: string;
  fcmToken: string;
  platform: 'ios' | 'android';
  createdAt: string;
}

// Save FCM token for a user
export async function saveFCMToken(userId: string, email: string, fcmToken: string, platform: string): Promise<void> {
  try {
    const key = `fcm_token:${userId}`;
    const tokenData: FCMToken = {
      userId,
      email,
      fcmToken,
      platform: platform as 'ios' | 'android',
      createdAt: new Date().toISOString()
    };

    await kv.set(key, JSON.stringify(tokenData));
    console.log(`✅ FCM token salvo para usuário ${email} (${platform})`);
  } catch (error) {
    console.error('❌ Erro ao salvar FCM token:', error);
    throw error;
  }
}

// Get FCM token for a user
export async function getFCMToken(userId: string): Promise<FCMToken | null> {
  try {
    const key = `fcm_token:${userId}`;
    const value = await kv.get(key);
    
    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error('❌ Erro ao buscar FCM token:', error);
    return null;
  }
}

// Remove FCM token
export async function removeFCMToken(fcmToken: string): Promise<void> {
  try {
    // Find the key by token value
    const allTokens = await kv.getByPrefix('fcm_token:');
    
    for (const item of allTokens) {
      const tokenData: FCMToken = JSON.parse(item.value);
      if (tokenData.fcmToken === fcmToken) {
        await kv.del(item.key);
        console.log(`✅ FCM token removido para ${tokenData.email}`);
        return;
      }
    }
  } catch (error) {
    console.error('❌ Erro ao remover FCM token:', error);
  }
}

// Get all FCM tokens for users with specific role
export async function getFCMTokensByRole(role: string): Promise<FCMToken[]> {
  try {
    // Get all users with the role
    const users = await kv.getByPrefix('user:');
    const tokens: FCMToken[] = [];

    for (const userItem of users) {
      const userData = JSON.parse(userItem.value);
      
      if (userData.role === role) {
        const token = await getFCMToken(userData.id);
        if (token) {
          tokens.push(token);
        }
      }
    }

    return tokens;
  } catch (error) {
    console.error('❌ Erro ao buscar tokens por role:', error);
    return [];
  }
}

// Send push notification via FCM
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!FCM_SERVER_KEY) {
    console.error('❌ FCM_SERVER_KEY não configurado');
    return false;
  }

  try {
    console.log(`📤 Enviando notificação push: ${title}`);

    const payload = {
      to: fcmToken,
      notification: {
        title,
        body,
        sound: 'default',
        badge: '1'
      },
      data: data || {},
      priority: 'high'
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Notificação push enviada com sucesso:', result);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Erro ao enviar notificação push:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar notificação push:', error);
    return false;
  }
}

// Send notification to user by ID
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  const tokenData = await getFCMToken(userId);
  
  if (!tokenData) {
    console.log(`⚠️ Nenhum FCM token encontrado para userId: ${userId}`);
    return false;
  }

  return sendPushNotification(tokenData.fcmToken, title, body, data);
}

// Send notification to all users with a specific role
export async function sendPushToRole(
  role: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<number> {
  const tokens = await getFCMTokensByRole(role);
  
  if (tokens.length === 0) {
    console.log(`⚠️ Nenhum token FCM encontrado para role: ${role}`);
    return 0;
  }

  console.log(`📤 Enviando notificação para ${tokens.length} usuários com role: ${role}`);

  let successCount = 0;
  
  for (const tokenData of tokens) {
    const success = await sendPushNotification(tokenData.fcmToken, title, body, data);
    if (success) {
      successCount++;
    }
  }

  console.log(`✅ ${successCount}/${tokens.length} notificações enviadas com sucesso`);
  return successCount;
}

// Notification helpers for specific events

export async function notifyNewRequest(storeName: string, type: string, value: number): Promise<void> {
  console.log('🆕 Notificando aprovadores sobre nova solicitação...');
  
  await sendPushToRole(
    'approver',
    '🆕 Nova Solicitação Pendente',
    `${storeName} criou uma solicitação de ${type} no valor de R$ ${value.toFixed(2).replace('.', ',')}`,
    { type: 'new-request' }
  );
}

export async function notifyRequestApproved(userId: string, type: string, value: number, observation?: string): Promise<void> {
  console.log(`✅ Notificando usuário ${userId} sobre aprovação...`);
  
  await sendPushToUser(
    userId,
    '✅ Solicitação Aprovada',
    `Sua solicitação de ${type} (R$ ${value.toFixed(2).replace('.', ',')}) foi aprovada!${observation ? ` - ${observation}` : ''}`,
    { type: 'approved' }
  );
}

export async function notifyRequestRejected(userId: string, type: string, value: number, observation: string): Promise<void> {
  console.log(`❌ Notificando usuário ${userId} sobre reprovação...`);
  
  await sendPushToUser(
    userId,
    '❌ Solicitação Reprovada',
    `Sua solicitação de ${type} (R$ ${value.toFixed(2).replace('.', ',')}) foi reprovada. Motivo: ${observation}`,
    { type: 'rejected' }
  );
}
