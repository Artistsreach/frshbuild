#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
const { FreestyleSandboxes } = require('freestyle-sandboxes');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Freestyle
const freestyle = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY,
});

async function fixFreestyleIdentities() {
  console.log('🔧 Starting freestyleIdentity fix for existing users...\n');
  
  try {
    // Get all user profiles
    const profilesRef = collection(db, 'profiles');
    const profilesSnap = await getDocs(profilesRef);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const profileDoc of profilesSnap.docs) {
      const profile = profileDoc.data();
      const userId = profileDoc.id;
      
      console.log(`Checking user: ${userId} (${profile.email})`);
      
      if (!profile.freestyleIdentity) {
        console.log(`  ❌ Missing freestyleIdentity, creating one...`);
        
        try {
          // Create new freestyleIdentity
          const identity = await freestyle.createGitIdentity();
          console.log(`  ✅ Created freestyleIdentity: ${identity.id}`);
          
          // Update profile
          await setDoc(doc(db, 'profiles', userId), { 
            freestyleIdentity: identity.id 
          }, { merge: true });
          
          console.log(`  ✅ Updated profile with freestyleIdentity`);
          fixedCount++;
        } catch (error) {
          console.error(`  ❌ Error creating freestyleIdentity for ${userId}:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`  ✅ Already has freestyleIdentity: ${profile.freestyleIdentity}`);
      }
    }
    
    console.log(`\n🎉 Fix completed!`);
    console.log(`   Fixed: ${fixedCount} users`);
    console.log(`   Errors: ${errorCount} users`);
    console.log(`   Total checked: ${profilesSnap.docs.length} users`);
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
    process.exit(1);
  }
}

// Run the fix
fixFreestyleIdentities().then(() => {
  console.log('\n✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Script failed:', error);
  process.exit(1);
});
