# Firebase Authentication Setup Guide

This guide provides complete setup instructions for Firebase Authentication with Firestore credit system integration.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Firebase Service Account Key Setup](#firebase-service-account-key-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Credit System Integration](#credit-system-integration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Service Account Key (MUST be a single JSON string)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"fresh25","private_key_id":"a66453e82b8ccaa1c7725705325ba3a99d65eacf","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCdsc20cpDzUq9z\nj1jj2/SobOAZ11kqwZBwEVCya+MiLaAzgjX+2xafgOInz0iE3IGuJHCfO9Kb5xd4\necs/Tn3sWM5ETu6fhQIrQtORdto3iZfZOcN7o9GVw7hZoJAuP8fLmTYwZGGCexdB\nyatEJ3TIAk6lLU4IDH0vxHJCo/YNJQP0l4q0iFwvxQ/Z2XtyG1RnVcvgyjbl8/BP\nO4mnGKu+xKxn8avI1eIUPil47+7ZetGGihK5NnG71277+7uGHxRPBHvn2VdpjqZO\n6PA05xT6pWtCAB7d//RmxZdgEq9PvYMXtigd1vWvaJAoXwmVkpfb73l9hDlbRcAw\nECwxG5QzAgMBAAECggEAQwgbmsLAXs4dCpA6htEu1JFDSXjCzGvvS9Pwa4d0y0h9\nuqd08FqM6UxN1gJEn0VkUnPm86joQ6Ed1vZesRBacqblNyAeSuytGVqUuFa/N7Bj\nPdFSCTJ/mpvRtzeLUj2GXkNIR5XD5UURg8OH67ah64sfhxMVAlLcu/tTXoR3yOnx\n2KJ96KAWVG+XPnwJGRiL7EFVtrmn7qFb4IrlfInP90LNeCl1DOjqiZJTq5vvzLtx\naTd0ZOdXxW7prx2rt/XotYwOwsDo851KsBbMSnJsWfkkeS1qyt3Zks8bQy1mBy3I\nQtUx6VkIGYVx1HIYXfD7kFC2oPLKSZteG14Oz3SAMQKBgQDYKo0dza4ku1UqHT8i\noMRJJc93WTFCW0iyy4kE0Ozubkk4sidZkVPMxowQyor9DQL0NC990Lx9kp/dFMDQ\nfAGYDp04NQDS3oinSThrmFiaHnq7UH70LdZYBPuqyVNJjhJhiAmqfcqD7IFnWtek\nqrGnpDMsPqqNdL4ZJQcl7tTFVwKBgQC6wOc+Puya6rAUXQVQ7DtNAiSEklYpAsgb\n4cWdRHNppMd/TGDxk7vfIubQangsn5y7OQUMvEJVOzjdVH+vM31TRYYoFgV+YZ0M\nvRRBxju/wks7dG/fWa8OYWDQgNV6VeojoeRt5/5Q6cKcE5JXMCeg08UiIbTm/C71\nXghvR9CihQKBgB0LqqaEio+49DqSb3dRrs49XGEnBO1ropsTqjeRcySegQwzNAJe\n+qmbTBq9fGuAIhN6J596OrmMyBpGvZnF79jkrc9tn8y1xhrkRcZ/U/hxfABLUqOw\nvQpasQ5DuwM5KdMdGl9kQ5/yWXjvxeYEYZarA41AZl5Xf2uVhB5etwxFAoGALvyj\n8cRRMXUE0krJMKAPF4QHfhd3eCAMCv/WAYicZSMhUoT8Cyv5Y93bJuryy39pJq3k\n+FxRcDJTT1SYP5N737ypUWKhBTg4FGFqPFZM6CVRWmckUpS097BGdI9Fpt8A5vAv\nkfuBwAfgf/ZopmkmP0+o1LqYUll20yNSifUOqCUCgYEA10sQqTPd6Kk2ki9Rt3tg\nXMuzCf3BduiklJBvBGGdt6yFyUMK5YQ8K2BInLF4DTYG6QurTUVGVxVr2McfwGRW\nvdMBo9TklPk90aXPPM74Nexi9K4lMu0HxzMXEEfMYoYalMMpNymzLhtdITho6BG1\nQAlntNsSuE7L9ybgJDToZyM=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@fresh25.iam.gserviceaccount.com","client_id":"114948506735393407698","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40fresh25.iam.gserviceaccount.com","universe_domain":"googleapis.com"}

# Other required environment variables
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBAZLKhYHLevVvBVfWG9ZLwVZMlQ9Fh8zA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fresh25.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fresh25
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fresh25.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=382962850342
NEXT_PUBLIC_FIREBASE_APP_ID=1:382962850342:web:4a87b6ee30d0c77bf2a4e7
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CZZW8LMXN3

# Stack Auth (existing)
STACK_API_KEY=your_stack_api_key
STACK_APP_ID=your_stack_app_id

# Other services (if needed)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Firebase Service Account Key Setup

### ⚠️ CRITICAL: Service Account Key Format

The `FIREBASE_SERVICE_ACCOUNT_KEY` must be a **single JSON string** on one line. Do NOT format it as separate environment variables.

**❌ WRONG (separate variables):**
```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=fresh25
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```

**✅ CORRECT (single JSON string):**
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"fresh25","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"firebase-adminsdk-fbsvc@fresh25.iam.gserviceaccount.com",...}
```

### How to Create the Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fresh25`)
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy the entire JSON content and paste it as a single line in your `.env.local` file

## Firebase Configuration

The Firebase client configuration is already set up in `src/lib/firebase.ts` with your project details:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBAZLKhYHLevVvBVfWG9ZLwVZMlQ9Fh8zA",
  authDomain: "fresh25.firebaseapp.com",
  projectId: "fresh25",
  storageBucket: "fresh25.firebasestorage.app",
  messagingSenderId: "382962850342",
  appId: "1:382962850342:web:4a87b6ee30d0c77bf2a4e7",
  measurementId: "G-CZZW8LMXN3"
};
```

## Credit System Integration

The credit system is now fully integrated with Firestore:

### Key Components

1. **Firestore Utilities** (`src/lib/firestore.ts`)
   - `initializeCredits()` - Initialize 100 credits for new users
   - `getCredits()` - Get current credit balance
   - `deductCredits()` - Deduct credits with validation
   - `addCredits()` - Add credits to user account
   - `listenToCredits()` - Real-time credit updates

2. **Credit Display Component** (`src/components/credits-display.tsx`)
   - Real-time credit balance display
   - Loading states
   - Configurable sizes and styling

3. **Credit Actions** (`src/actions/get-user-credits.ts`)
   - Server-side credit retrieval
   - Fallback to Stack Auth metadata

4. **Chat API** (`src/app/api/chat/route.ts`)
   - Credit deduction before processing
   - Insufficient credit handling

### Database Schema

```
users/{userId}
├── credits: number (default: 100)
├── email: string
├── displayName: string
├── photoURL: string
├── createdAt: timestamp
└── updatedAt: timestamp

profiles/{userId}
├── email: string
├── role: string (default: 'user')
├── createdAt: timestamp
├── displayName: string
└── photoURL: string
```

## Testing

### 1. Test Firebase Configuration

Visit: `http://localhost:3000/api/auth/firebase/test`

Expected response:
```json
{
  "success": true,
  "projectId": "fresh25",
  "clientEmail": "firebase-adminsdk-fbsvc@fresh25.iam.gserviceaccount.com",
  "status": "configured"
}
```

### 2. Test Authentication Flow

1. Start your development server: `npm run dev`
2. Visit your app
3. Click "Sign in with Google"
4. Complete Google authentication
5. Verify credits are displayed (should show 100 initially)

### 3. Test Credit System

1. Sign in with Google
2. Check that credits display shows 100
3. Use a feature that costs credits (like chat)
4. Verify credits are deducted in real-time

## Troubleshooting

### "Token verification failed" Error

**Symptoms:**
```
FirebaseAuthProvider: Failed to link account: "{\"error\":\"Token verification failed\",\"details\":\"Invalid Firebase service account configuration\"}"
```

**Solutions:**

1. **Check Service Account Key Format**
   ```bash
   # Test your service account key
   curl http://localhost:3000/api/auth/firebase/test
   ```

2. **Verify Environment Variable**
   - Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is a single JSON string
   - No line breaks or formatting
   - All quotes properly escaped

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

4. **Check Firebase Admin Initialization**
   - Look for console logs: "Firebase Admin: Successfully initialized"
   - Check for project ID: "fresh25"

### "No Stack Auth session found" Error

**Cause:** User is authenticated with Firebase but not with Stack Auth

**Solution:** The system will automatically create a Stack Auth session when Firebase authentication is verified.

### "Insufficient credits" Error

**Cause:** User doesn't have enough credits for an operation

**Solution:** 
- Check current credit balance
- Add credits through the credit system
- Verify Firestore rules allow credit operations

### Firestore Permission Errors

**Cause:** Firestore security rules blocking operations

**Solution:** Ensure your Firestore rules allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Environment Variables Checklist

- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` - Single JSON string
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - Client API key
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Auth domain
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Project ID
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Storage bucket
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Sender ID
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - App ID
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Analytics ID
- [ ] `STACK_API_KEY` - Stack Auth API key
- [ ] `STACK_APP_ID` - Stack Auth app ID

## API Endpoints

- `POST /api/auth/firebase/verify` - Verify Firebase token and link account
- `GET /api/auth/firebase/test` - Test Firebase configuration
- `POST /api/auth/signout` - Sign out from Stack Auth
- `POST /api/chat` - Chat with credit deduction

## Security Notes

1. **Never commit `.env.local` to version control**
2. **Keep service account key secure**
3. **Use environment-specific configurations**
4. **Implement proper error handling**
5. **Validate all user inputs**

## Next Steps

1. Test the complete authentication flow
2. Verify credit system functionality
3. Implement credit purchase flow (if needed)
4. Add credit usage analytics
5. Set up monitoring and alerts
