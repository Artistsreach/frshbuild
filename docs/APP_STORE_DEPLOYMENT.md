# App Store Deployment Guide

This guide explains how to deploy FreshChef to the Apple App Store and Google Play Store using EAS (Expo Application Services).

## Prerequisites

### 1. Developer Accounts
- **Apple Developer Program** membership ($99/year)
- **Google Play Developer** account ($25 one-time fee)
- **Expo** account (free)

### 2. Required Tools
- Node.js 18+ and npm 8+
- EAS CLI: `npm install -g eas-cli`
- Git
- Xcode (for iOS builds)
- Android Studio (for Android builds)

## Setup Instructions

### 1. Configure Environment Variables

Create or update your `.env` file with the following variables:

```env
# Expo
EXPO_TOKEN=your_expo_token

# App Store Connect
APPLE_ID=your_apple_id@example.com
APPLE_TEAM_ID=YOUR_TEAM_ID

# App Store Connect API Key (recommended)
APP_STORE_CONNECT_ISSUER_ID=your_issuer_id
APP_STORE_CONNECT_KEY_IDENTIFIER=your_key_id
APP_STORE_CONNECT_KEY=your_p8_key_content

# Google Play (optional, for Android)
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json
```

### 2. Configure App Metadata

Update the following files with your app's information:

1. `app.json` - Update bundle identifiers and package names
2. `store.config.json` - Update app metadata, screenshots, and descriptions
3. `eas.json` - Configure build and submit profiles

## Deployment Process

### 1. Build the App

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Or build for both platforms
npm run build
```

### 2. Submit to App Stores

```bash
# Submit to App Store Connect
npm run submit:ios

# Submit to Google Play
npm run submit:android

# Or submit to both stores
npm run submit
```

### 3. Update App Store Metadata

```bash
# Push metadata to App Store Connect
npm run metadata:push

# Pull latest metadata from App Store Connect
npm run metadata:pull
```

## Automated Deployment

We've set up GitHub Actions to automatically build and submit your app on every push to the `main` branch. The workflow is defined in `.github/workflows/build-and-submit.yml`.

### Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab or using the GitHub CLI:

```bash
git push origin main
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in the GitHub Actions output
   - Verify all environment variables are set correctly
   - Ensure your developer accounts have the necessary permissions

2. **Submission Rejections**
   - Review the rejection email from the app store
   - Update the app metadata or functionality as needed
   - Resubmit the build

3. **Code Signing Issues**
   - Make sure your provisioning profiles and certificates are valid
   - Update them in your Apple Developer account if needed

## Best Practices

1. **Versioning**
   - Always increment the version number in `app.json` before submitting an update
   - Use semantic versioning (e.g., 1.0.0)

2. **Testing**
   - Test your app thoroughly before submitting to the stores
   - Use TestFlight (iOS) and Internal Testing (Android) for beta testing

3. **Security**
   - Never commit sensitive information to version control
   - Use environment variables for API keys and other secrets
   - Enable app signing for production builds

## Support

If you encounter any issues, please:
1. Check the [Expo documentation](https://docs.expo.dev)
2. Search for similar issues in the [Expo forums](https://forums.expo.dev/)
3. Open an issue in our GitHub repository
