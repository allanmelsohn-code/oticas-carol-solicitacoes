// Push Notifications - Disabled (Web only version)
// Functions are kept for compatibility but do nothing

// Notification helpers for specific events (no-op)

export async function notifyNewRequest(storeName: string, type: string, value: number): Promise<void> {
  console.log('ℹ️ Push notifications disabled (web only version)');
}

export async function notifyRequestApproved(userId: string, type: string, value: number, observation?: string): Promise<void> {
  console.log('ℹ️ Push notifications disabled (web only version)');
}

export async function notifyRequestRejected(userId: string, type: string, value: number, observation: string): Promise<void> {
  console.log('ℹ️ Push notifications disabled (web only version)');
}
