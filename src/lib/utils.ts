// Utility functions

/**
 * Helper function to create stores from console
 * Usage in browser console:
 * 
 * import { createStore } from '/src/lib/utils'
 * await createStore('OC001', 'Óticas Carol Shopping')
 */
export async function createStore(code: string, name: string) {
  const { stores } = await import('./api');
  try {
    const result = await stores.create(code, name);
    console.log('✅ Store created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating store:', error);
    throw error;
  }
}

/**
 * Helper to create multiple stores at once
 */
export async function createMultipleStores() {
  const defaultStores = [
    { code: 'OC001', name: 'Óticas Carol Shopping Center' },
    { code: 'OC002', name: 'Óticas Carol Centro' },
    { code: 'OC003', name: 'Óticas Carol Norte' },
    { code: 'OC004', name: 'Óticas Carol Sul' },
  ];

  console.log('🏪 Creating stores...');
  
  for (const store of defaultStores) {
    try {
      await createStore(store.code, store.name);
    } catch (error) {
      console.log(`⚠️ Skipping ${store.code} (may already exist)`);
    }
  }
  
  console.log('✅ Stores creation completed!');
}

/**
 * Format currency to BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format date to Brazilian format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

/**
 * Format datetime to Brazilian format
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR');
}
