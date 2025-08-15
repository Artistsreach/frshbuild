#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE = path.join(__dirname, '../.env');
const EAS_CONFIG = path.join(__dirname, '../eas.json');
const APP_JSON = path.join(__dirname, '../app.json');

// Check if required commands are installed
function checkDependencies() {
  try {
    execSync('eas --version', { stdio: 'ignore' });
    execSync('git --version', { stdio: 'ignore' });
    execSync('node --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ Error: Required dependencies are missing');
    console.log('Please install the following:');
    console.log('- Node.js (https://nodejs.org/)');
    console.log('- EAS CLI (npm install -g eas-cli)');
    console.log('- Git (https://git-scm.com/)');
    return false;
  }
}

// Load environment variables
function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ .env file not found');
    process.exit(1);
  }
  require('dotenv').config({ path: ENV_FILE });
}

// Check if all required environment variables are set
function checkEnvVars() {
  const requiredVars = [
    'EXPO_TOKEN',
    'APPLE_ID',
    'APPLE_TEAM_ID',
    'APP_STORE_CONNECT_ISSUER_ID',
    'APP_STORE_CONNECT_KEY_IDENTIFIER'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// Run EAS build
async function runBuild(platform) {
  console.log(`🚀 Starting ${platform} build...`);
  try {
    execSync(`eas build --platform ${platform} --profile production --non-interactive`, {
      stdio: 'inherit'
    });
    console.log(`✅ ${platform} build completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${platform} build failed`);
    return false;
  }
}

// Submit to app stores
async function submitToStore(platform) {
  console.log(`📤 Submitting ${platform} build to store...`);
  try {
    execSync(`eas submit --platform ${platform} --non-interactive`, {
      stdio: 'inherit'
    });
    console.log(`✅ ${platform} submission completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${platform} submission failed`);
    return false;
  }
}

// Update app store metadata
async function updateMetadata() {
  console.log('🔄 Updating App Store metadata...');
  try {
    execSync('eas metadata:push', { stdio: 'inherit' });
    console.log('✅ Metadata updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to update metadata');
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 FreshChef Deployment Helper\n');

  // Check dependencies
  if (!checkDependencies()) {
    process.exit(1);
  }

  // Load environment
  loadEnv();
  checkEnvVars();

  // Get platform choice
  const platform = process.argv[2]?.toLowerCase() || 'all';
  const validPlatforms = ['ios', 'android', 'all'];
  
  if (!validPlatforms.includes(platform)) {
    console.error(`❌ Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`);
    process.exit(1);
  }

  // Build
  let buildSuccess = true;
  
  if (platform === 'ios' || platform === 'all') {
    buildSuccess = await runBuild('ios');
  }
  
  if (platform === 'android' || (platform === 'all' && buildSuccess)) {
    buildSuccess = await runBuild('android');
  }

  if (!buildSuccess) {
    console.error('❌ Build failed. Aborting deployment.');
    process.exit(1);
  }

  // Ask for confirmation before submission
  const shouldSubmit = await new Promise(resolve => {
    rl.question('\nDo you want to submit the builds to the app stores? (y/N) ', answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });

  if (shouldSubmit) {
    // Update metadata first
    await updateMetadata();

    // Submit to stores
    if (platform === 'ios' || platform === 'all') {
      await submitToStore('ios');
    }
    
    if (platform === 'android' || platform === 'all') {
      await submitToStore('android');
    }
  }

  console.log('\n✨ Deployment process completed!');
  rl.close();
}

// Run the script
main().catch(error => {
  console.error('❌ An error occurred:', error);
  rl.close();
  process.exit(1);
});
