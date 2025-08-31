# Firebase Admin & Iframe Embedding Fixes

This document outlines the fixes for two main issues:

1. **Firebase Admin Service Account Key Parsing Error**
2. **404 Errors when embedding the site in iframes**

## Issue 1: Firebase Admin Service Account Key Parsing Error

### Problem
```
Firebase Admin: Error parsing service account: Error: Failed to parse private key: Error: Unparsed DER bytes remain after ASN.1 parsing.
```

### Root Cause
The Firebase service account key is not being parsed correctly due to:
- Incorrect JSON formatting
- Base64 encoding issues
- Escaped characters in the environment variable

### Fixes Applied

1. **Enhanced Firebase Admin Initialization** (`src/lib/firebase-admin.ts`)
   - Added multiple parsing strategies (direct JSON, base64 decode, clean escaped characters)
   - Better error handling and logging
   - Graceful fallback for development mode

2. **Improved Session Route Error Handling** (`src/app/api/auth/session/route.ts`)
   - Added null check for Firebase Admin auth
   - Better error responses when Firebase Admin is unavailable

### Testing Your Firebase Service Account Key

Run the test script to validate your key format:

```bash
node scripts/test-firebase-key.js
```

### Common Solutions

1. **If your key has escaped newlines** (`\\n`):
   ```bash
   # Replace escaped newlines with actual newlines
   export FIREBASE_SERVICE_ACCOUNT_KEY=$(echo "$FIREBASE_SERVICE_ACCOUNT_KEY" | sed 's/\\n/\n/g')
   ```

2. **If your key is base64 encoded**:
   ```bash
   # Decode base64 and set as environment variable
   export FIREBASE_SERVICE_ACCOUNT_KEY=$(echo "$FIREBASE_SERVICE_ACCOUNT_KEY" | base64 -d)
   ```

3. **If your key has escaped quotes**:
   ```bash
   # Remove escaped quotes
   export FIREBASE_SERVICE_ACCOUNT_KEY=$(echo "$FIREBASE_SERVICE_ACCOUNT_KEY" | sed 's/\\"/"/g')
   ```

## Issue 2: 404 Errors in Iframe Embedding

### Problem
Getting 404 application errors when the site is embedded in iframes, particularly for `/app` pages.

### Root Cause
- Missing or incorrect headers for iframe embedding
- Content Security Policy (CSP) restrictions
- X-Frame-Options blocking iframe embedding

### Fixes Applied

1. **Enhanced Next.js Configuration** (`next.config.ts`)
   - Added comprehensive headers configuration
   - Set `X-Frame-Options: ALLOWALL` for app routes
   - Added `Content-Security-Policy: frame-ancestors 'self' *` for iframe support
   - Configured security headers for all routes

2. **Updated Middleware** (`src/middleware.ts`)
   - Already configured with `X-Frame-Options: ALLOWALL`
   - Added CORS headers for cross-origin iframe embedding
   - Configured proper access control headers

3. **Created Iframe Test Page** (`src/app/iframe-test/page.tsx`)
   - Dedicated page for testing iframe embedding
   - Cross-origin communication support
   - Visual feedback for iframe compatibility

### Testing Iframe Embedding

1. **Test the iframe test page**:
   ```html
   <iframe 
     src="http://localhost:3000/iframe-test" 
     width="100%" 
     height="600" 
     frameborder="0"
     allow="camera; microphone; geolocation; encrypted-media">
   </iframe>
   ```

2. **Test app pages**:
   ```html
   <iframe 
     src="http://localhost:3000/app/YOUR_APP_ID" 
     width="100%" 
     height="600" 
     frameborder="0"
     allow="camera; microphone; geolocation; encrypted-media">
   </iframe>
   ```

### Headers Configuration

The following headers are now configured:

- **X-Frame-Options**: `ALLOWALL` for app routes, `SAMEORIGIN` for others
- **Content-Security-Policy**: `frame-ancestors 'self' *` for iframe support
- **Access-Control-Allow-Origin**: `*` for cross-origin requests
- **Access-Control-Allow-Credentials**: `true` for authenticated requests

## Verification Steps

### 1. Test Firebase Admin
```bash
# Start your development server
npm run dev

# Check console logs for Firebase Admin initialization
# Should see: "Firebase Admin: Successfully initialized"
```

### 2. Test Iframe Embedding
1. Open `http://localhost:3000/iframe-test` in your browser
2. Create a simple HTML file with the iframe test code above
3. Open the HTML file and verify the iframe loads correctly
4. Check browser console for any errors

### 3. Test App Pages in Iframe
1. Create an app or use an existing app ID
2. Embed the app page in an iframe
3. Verify the app loads and functions correctly

## Troubleshooting

### Firebase Admin Issues
- Run the test script: `node scripts/test-firebase-key.js`
- Check environment variable format
- Verify the service account key has all required fields
- Ensure proper JSON formatting

### Iframe Issues
- Check browser console for CSP violations
- Verify headers are being set correctly (use browser dev tools)
- Test with different domains/origins
- Check if the parent page has any restrictions

### Common Error Messages
- `X-Frame-Options: DENY` - Headers not being applied correctly
- `Content Security Policy violation` - CSP needs adjustment
- `Cross-origin request blocked` - CORS headers missing

## Environment Variables

Ensure these environment variables are set correctly:

```bash
# Firebase Service Account Key (should be valid JSON)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'

# Other required variables
NODE_ENV=development
```

## Production Considerations

1. **Security**: Consider restricting `frame-ancestors` to specific domains in production
2. **CORS**: Limit `Access-Control-Allow-Origin` to trusted domains
3. **Firebase**: Use proper service account key management in production
4. **Monitoring**: Add logging for iframe embedding attempts and Firebase Admin errors
