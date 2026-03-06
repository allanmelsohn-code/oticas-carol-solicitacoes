// Seed script to initialize demo data
import { auth, stores } from './api';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Create demo stores
    const demostores = [
      { code: 'OC001', name: 'Óticas Carol Shopping Center' },
      { code: 'OC002', name: 'Óticas Carol Centro' },
      { code: 'OC003', name: 'Óticas Carol Norte' },
      { code: 'OC004', name: 'Óticas Carol Sul' },
    ];

    console.log('📦 Creating stores...');
    
    // Note: You'll need to create these manually through the admin interface
    // or by calling the stores.create() API after logging in as an approver
    
    console.log('✅ Database seed instructions:');
    console.log('1. Create an approver user (Admin or Chris)');
    console.log('2. Login as approver');
    console.log('3. Use browser console to create stores:');
    console.log('');
    demostores.forEach(store => {
      console.log(`   await stores.create('${store.code}', '${store.name}');`);
    });

    return {
      success: true,
      message: 'Check console for seed instructions',
    };
  } catch (error) {
    console.error('Seed error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Seed failed',
    };
  }
}
