# Firebase Credits Integration Setup

This guide explains how to set up the integration to display user credits from your other Firebase project when users sign in with Google via Stack Auth.

## Overview

The integration works by:
1. Users sign in with Google OAuth through Stack Auth
2. We use the Google account information to look up the user in your other Firebase project's Firestore
3. We fetch the user's credits and display them in the UI

## Dependencies

The integration requires the `firebase-admin` package, which has been installed:
```bash
npm install firebase-admin
```

## Required Environment Variables

Add these variables to your `.env` file:

### Server-side Firebase Admin SDK (Required)
```env
FIREBASE_OTHER_PROJECT_ID=your_other_project_id
FIREBASE_OTHER_PROJECT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_OTHER_PROJECT_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_other_project_id.iam.gserviceaccount.com
```

### Client-side Firebase Configuration (Optional)
```env
NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_API_KEY=your_other_project_api_key
NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_AUTH_DOMAIN=your_other_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_PROJECT_ID=your_other_project_id
NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_APP_ID=your_other_project_app_id
```

## Setup Instructions

### 1. Get Firebase Admin SDK Credentials

1. Go to your other Firebase project console: https://console.firebase.google.com/
2. Navigate to **Project Settings** > **Service accounts**
3. Click **Generate new private key**
4. Download the JSON file
5. Extract the values and add them to your `.env` file:
   - `project_id` → `FIREBASE_OTHER_PROJECT_ID`
   - `private_key` → `FIREBASE_OTHER_PROJECT_PRIVATE_KEY` (keep the quotes and \n characters)
   - `client_email` → `FIREBASE_OTHER_PROJECT_CLIENT_EMAIL`

### 2. Configure Stack Auth for Google OAuth

1. Go to your Stack Auth dashboard: https://app.stack-auth.com/
2. Navigate to your project settings
3. Enable Google OAuth provider
4. Configure the OAuth settings with your Google OAuth credentials

### 3. Firestore Data Structure

The integration expects users in your other Firebase project to be stored in a `users` collection with the following structure:

```javascript
// Document path: /users/{google_user_id}
{
  credits: 100,           // number
  email: "user@example.com", // string
  lastUpdated: timestamp  // Firestore timestamp (optional)
}
```

**Alternative structure (searched by email):**
```javascript
// Document path: /users/{any_id}
{
  credits: 100,           // number
  email: "user@example.com", // string (used for lookup)
  lastUpdated: timestamp  // Firestore timestamp (optional)
}
```

### 4. Firestore Security Rules

Make sure your Firestore security rules allow the service account to read user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow service account to read user documents
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## How to Use

### 1. User Experience
1. User signs up/logs in to your current app
2. User goes to Account Settings and links their Google account
3. The Firebase credits will automatically appear on the main page and in the "Firebase Credits" tab in account settings

### 2. API Endpoints

- `GET /api/firebase-credits` - Fetches credits for the current user
- `POST /api/firebase-credits` - Updates credits (if needed)

### 3. React Components

- `<FirebaseCreditsDisplay />` - Shows credits with loading/error states
- `<FirebaseCreditsTab />` - Account settings tab with detailed view

### 4. React Hook

```typescript
import { useFirebaseCredits } from "@/hooks/use-firebase-credits";

function MyComponent() {
  const { credits, loading, error, refetch, hasGoogleAccount } = useFirebaseCredits();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hasGoogleAccount) return <div>No Google account linked</div>;
  
  return <div>Credits: {credits?.credits}</div>;
}
```

## Troubleshooting

### Common Issues

1. **"Firebase Admin not configured"**
   - Check that all required environment variables are set
   - Verify the private key format (should include \n characters)

2. **"No Google account linked"**
   - User needs to link Google OAuth in Stack Auth account settings
   - Check Stack Auth Google OAuth configuration

3. **"No credits found"**
   - Verify the user exists in the other Firebase project's Firestore
   - Check the document structure matches expected format
   - Verify Firestore security rules allow reading

4. **Permission errors**
   - Ensure the service account has proper permissions in the other Firebase project
   - Check Firestore security rules

### Testing

You can test the integration by:
1. Creating a test user in your other Firebase project's Firestore
2. Linking a Google account in Stack Auth
3. Checking if the credits appear correctly

## Security Considerations

- The integration uses Firebase Admin SDK for secure server-side access
- User data is only accessible to authenticated users
- Google OAuth tokens are handled securely by Stack Auth
- No sensitive data is exposed to the client-side

## Customization

You can customize the integration by:
- Modifying the Firestore collection/document path in `src/app/api/firebase-credits/route.ts`
- Updating the UI components to match your design
- Adding additional fields to fetch from Firestore
- Implementing credit updates/transactions if needed
