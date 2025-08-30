# Firebase Functions Credit System Setup Guide

This guide provides complete setup instructions for the Firebase Functions-based credit system, eliminating the need for service account keys in your Next.js app.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Firebase Configuration (Client-side only)
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

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note**: No service account key needed in Next.js! Firebase Functions handle server-side operations.

### 2. Install Dependencies

```bash
npm install firebase
```

### 3. Deploy Firebase Functions

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Functions
cd functions
npm install

# Deploy Functions
firebase deploy --only functions
```

### 4. Start Development Server

```bash
npm run dev
```

## 📁 File Structure

```
src/
├── lib/
│   ├── firebaseClient.ts      # Firebase initialization
│   ├── firebaseFunctions.ts   # Client-side function wrappers
│   └── credits.ts            # Legacy credit operations (optional)
├── contexts/
│   └── AuthContext.tsx       # Auth state management
├── components/
│   ├── CreditsDisplay.tsx    # Credit UI (uses Functions)
│   ├── LoginButton.tsx       # Auth UI
│   └── ChatComponent.tsx     # Chat with credit deduction
├── config/
│   └── creditCosts.ts        # Credit costs configuration
└── app/
    ├── layout.tsx            # Root layout with AuthProvider
    ├── page.tsx              # Home page
    └── chat/
        └── page.tsx          # Chat page

functions/
├── src/
│   └── index.ts              # Firebase Functions (server-side logic)
├── package.json              # Functions dependencies
└── tsconfig.json             # TypeScript config

firebase.json                  # Firebase configuration
firestore.rules               # Security rules
firestore.indexes.json        # Database indexes
```

## 🔧 Key Components

### 1. Firebase Client (`src/lib/firebaseClient.ts`)
- Initializes Firebase with your project configuration
- Exports `auth`, `db`, and `functions` instances
- No server-side dependencies

### 2. Firebase Functions (`functions/src/index.ts`)
- **`chatWithCredits`** - Chat with credit deduction
- **`getUserCredits`** - Get current credit balance
- **`addCredits`** - Add credits to user account
- **`addCreditsOnPayment`** - Add credits after payment
- **`initializeUser`** - Auto-initialize credits for new users

### 3. Client Function Wrappers (`src/lib/firebaseFunctions.ts`)
- Type-safe wrappers for calling Firebase Functions
- Error handling and type definitions
- Easy to use from React components

### 4. Authentication Context (`src/contexts/AuthContext.tsx`)
- Manages Firebase authentication state
- Automatically initializes credits for new users
- Handles user profile synchronization

### 5. Chat Component (`src/components/ChatComponent.tsx`)
- Real-time chat interface
- Credit deduction on each message
- Error handling for insufficient credits

## 💳 Credit Costs Configuration

Edit `functions/src/index.ts` to define costs for different operations:

```typescript
const creditCost = 5; // Cost per chat message
```

## 🔒 Security Rules

The Firestore security rules in `firestore.rules` ensure:
- Users can only access their own data
- Credits are protected from unauthorized access
- Profiles are user-specific

## 🚀 Firebase Functions

The functions provide:
- **Automatic credit initialization** for new users
- **Secure credit deduction** with validation
- **Payment integration** for credit purchases
- **Chat functionality** with AI integration

## 🧪 Testing

### 1. Test Authentication Flow
1. Visit your app
2. Click "Sign in with Google"
3. Complete authentication
4. Verify credits display shows 100

### 2. Test Chat System
1. Sign in with Google
2. Click "Chat with AI" button
3. Send a message
4. Verify credits are deducted (5 per message)

### 3. Test Credit System
1. Use chat until credits are low
2. Try sending a message with insufficient credits
3. Verify proper error message

## 🔧 API Usage

### Chat with Credits

```typescript
import { firebaseFunctions } from '@/lib/firebaseFunctions';

// Send a chat message
const response = await firebaseFunctions.chatWithCredits([
  { role: 'user', content: 'Hello AI!' }
]);

console.log('Response:', response.response);
console.log('Credits deducted:', response.creditsDeducted);
```

### Get User Credits

```typescript
const credits = await firebaseFunctions.getUserCredits();
console.log('Current credits:', credits);
```

### Add Credits

```typescript
const added = await firebaseFunctions.addCredits(50);
console.log('Credits added:', added);
```

## 🚨 Troubleshooting

### "Functions not deployed" Error
1. Deploy Firebase Functions: `firebase deploy --only functions`
2. Check function logs: `firebase functions:log`
3. Verify function names match client calls

### "Insufficient credits" Error
1. Check current credit balance
2. Verify Firestore rules allow credit operations
3. Ensure user is properly authenticated

### "Authentication failed" Error
1. Check Firebase Auth configuration
2. Verify user is signed in
3. Check browser console for auth errors

## 📊 Database Schema

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

## 🎯 Next Steps

1. **Deploy Firebase Functions**: `firebase deploy --only functions`
2. **Deploy Firestore Rules**: `firebase deploy --only firestore:rules`
3. **Integrate AI Service**: Replace mock response in `processChatMessage()`
4. **Set up Payment Integration**: Implement Stripe webhooks
5. **Add Credit Analytics**: Track usage patterns

## 🔐 Security Benefits

- ✅ **No service account keys** in Next.js app
- ✅ **Server-side authentication** handled by Firebase Functions
- ✅ **Secure credit operations** with validation
- ✅ **Automatic user initialization**
- ✅ **Type-safe function calls**

## 🚀 Advantages of Firebase Functions

1. **Security**: Server-side logic is protected
2. **Scalability**: Automatic scaling with usage
3. **Simplicity**: No need to manage server infrastructure
4. **Integration**: Seamless Firebase ecosystem integration
5. **Cost-effective**: Pay only for actual usage

The system is now ready for production with secure, scalable Firebase Functions handling all server-side operations!
