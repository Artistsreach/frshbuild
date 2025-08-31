#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

async function testFirebaseAdmin() {
  console.log('🧪 Testing Firebase Admin initialization...\n');
  
  try {
    // Import the Firebase Admin function
    const { getFirebaseAdmin } = require('../src/lib/firebase-admin');
    
    console.log('📦 Firebase Admin module loaded successfully');
    
    // Try to get Firebase Admin instance
    const auth = getFirebaseAdmin();
    
    if (!auth) {
      console.log('❌ Firebase Admin auth is null');
      console.log('💡 This usually means the service account key is invalid or missing');
      return false;
    }
    
    console.log('✅ Firebase Admin initialized successfully');
    
    // Try to verify a test token (this will fail, but we can see if the auth object works)
    try {
      await auth.verifyIdToken('test-token');
    } catch (error) {
      if (error.code === 'auth/argument-error') {
        console.log('✅ Firebase Admin auth object is working (expected error for test token)');
        return true;
      } else {
        console.log('⚠️  Unexpected error during token verification:', error.message);
        return false;
      }
    }
    
  } catch (error) {
    console.log('❌ Error testing Firebase Admin:', error.message);
    console.log('💡 Check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    return false;
  }
}

// Run the test
testFirebaseAdmin().then(success => {
  if (success) {
    console.log('\n🎉 Firebase Admin test passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Firebase Admin test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.log('\n💥 Unexpected error:', error);
  process.exit(1);
});
