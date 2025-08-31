#!/usr/bin/env node

/**
 * Test script to validate Firebase service account key format
 * Run this script to check if your FIREBASE_SERVICE_ACCOUNT_KEY is properly formatted
 */

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  process.exit(1);
}

console.log("🔍 Testing Firebase service account key parsing...\n");

// Test 1: Direct JSON parsing
try {
  const parsed = JSON.parse(serviceAccount);
  console.log("✅ Direct JSON parsing: SUCCESS");
  console.log(`   Project ID: ${parsed.project_id}`);
  console.log(`   Client Email: ${parsed.client_email}`);
  console.log(`   Private Key Length: ${parsed.private_key?.length || 0} characters`);
} catch (error) {
  console.log("❌ Direct JSON parsing: FAILED");
  console.log(`   Error: ${error.message}`);
}

// Test 2: Base64 decoding then JSON parsing
try {
  const decoded = Buffer.from(serviceAccount, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded);
  console.log("\n✅ Base64 decoding + JSON parsing: SUCCESS");
  console.log(`   Project ID: ${parsed.project_id}`);
  console.log(`   Client Email: ${parsed.client_email}`);
  console.log(`   Private Key Length: ${parsed.private_key?.length || 0} characters`);
} catch (error) {
  console.log("\n❌ Base64 decoding + JSON parsing: FAILED");
  console.log(`   Error: ${error.message}`);
}

// Test 3: Clean escaped characters then JSON parsing
try {
  const cleaned = serviceAccount.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  const parsed = JSON.parse(cleaned);
  console.log("\n✅ Cleaned escaped characters + JSON parsing: SUCCESS");
  console.log(`   Project ID: ${parsed.project_id}`);
  console.log(`   Client Email: ${parsed.client_email}`);
  console.log(`   Private Key Length: ${parsed.private_key?.length || 0} characters`);
} catch (error) {
  console.log("\n❌ Cleaned escaped characters + JSON parsing: FAILED");
  console.log(`   Error: ${error.message}`);
}

console.log("\n📝 Recommendations:");
console.log("1. If all tests fail, check that your service account key is properly formatted");
console.log("2. Make sure the key is a valid JSON object with required fields");
console.log("3. If using base64 encoding, ensure it's properly encoded");
console.log("4. Check for any extra escape characters in your environment variable");

console.log("\n🔧 To fix common issues:");
console.log("- If the key has escaped newlines (\\n), they should be actual newlines");
console.log("- If the key is base64 encoded, decode it first");
console.log("- Ensure the JSON is properly formatted with all required fields");
