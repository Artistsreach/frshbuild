#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateFirebaseKey(keyString) {
  console.log('🔍 Validating Firebase Service Account Key...\n');
  
  try {
    // Try to parse as JSON
    let serviceAccount = JSON.parse(keyString);
    
    console.log('✅ JSON parsing successful');
    console.log(`📋 Project ID: ${serviceAccount.project_id}`);
    console.log(`📧 Client Email: ${serviceAccount.client_email}`);
    
    // Check required fields
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    console.log('✅ All required fields present');
    
    // Check private key format
    const privateKey = serviceAccount.private_key;
    console.log(`🔑 Private key length: ${privateKey.length} characters`);
    
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('❌ Private key missing BEGIN marker');
      return false;
    }
    
    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      console.log('❌ Private key missing END marker');
      return false;
    }
    
    console.log('✅ Private key format looks correct');
    
    // Try to extract and validate the key
    const keyMatch = privateKey.match(/-----BEGIN PRIVATE KEY-----\n([\s\S]*?)\n-----END PRIVATE KEY-----/);
    if (keyMatch) {
      const keyContent = keyMatch[1];
      console.log(`🔑 Key content length: ${keyContent.length} characters`);
      
      // Check if it looks like valid base64
      if (/^[A-Za-z0-9+/=\s]+$/.test(keyContent)) {
        console.log('✅ Key content appears to be valid base64');
      } else {
        console.log('⚠️  Key content may have formatting issues');
      }
    }
    
    console.log('\n🎉 Firebase service account key appears to be valid!');
    return true;
    
  } catch (error) {
    console.log('❌ JSON parsing failed:', error.message);
    
    // Try to fix common issues
    console.log('\n🔧 Attempting to fix common issues...');
    
    let fixedKey = keyString;
    
    // Try base64 decoding
    try {
      const decoded = Buffer.from(keyString, 'base64').toString('utf-8');
      console.log('✅ Base64 decoding successful');
      return validateFirebaseKey(decoded);
    } catch (base64Error) {
      console.log('❌ Base64 decoding failed');
    }
    
    // Try to fix escape characters
    try {
      const cleaned = keyString
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      
      const parsed = JSON.parse(cleaned);
      console.log('✅ Fixed escape characters successfully');
      return validateFirebaseKey(JSON.stringify(parsed));
    } catch (cleanError) {
      console.log('❌ Cleaning escape characters failed');
    }
    
    console.log('\n❌ Could not fix the key format automatically');
    console.log('💡 Please check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    return false;
  }
}

// Check if key is provided as argument
const keyArg = process.argv[2];

if (keyArg) {
  validateFirebaseKey(keyArg);
} else {
  console.log('Usage: node validate-firebase-key.js <firebase-service-account-key>');
  console.log('Or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable and run without arguments');
  
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    console.log('\n🔍 Found FIREBASE_SERVICE_ACCOUNT_KEY in environment variables');
    validateFirebaseKey(envKey);
  } else {
    console.log('\n❌ No Firebase service account key found');
    console.log('💡 Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable or provide as argument');
  }
}
