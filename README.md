# FreshChef

Your personal cooking assistant that helps you discover and create delicious recipes based on your preferences and available ingredients.

## Features

- AI-powered recipe recommendations
- Personalized meal planning
- Shopping list generation
- Step-by-step cooking instructions
- Save and organize favorite recipes
- Cross-platform mobile app (iOS & Android)

## Deployment to App Stores

### Prerequisites

1. **Apple Developer Account**
   - Enroll in the [Apple Developer Program](https://developer.apple.com/programs/)
   - Set up App Store Connect access

2. **Expo Account**
   - Sign up at [expo.dev](https://expo.dev)
   - Install EAS CLI: `npm install -g eas-cli`
   - Log in: `eas login`

3. **Environment Setup**
   - Node.js 16+ and npm 7+
   - Xcode (for iOS builds)
   - Android Studio (for Android builds)

### Configuration

1. **Update App Configuration**
   - Update `app.json` with your app's bundle identifier and package name
   - Configure `eas.json` with your build profiles
   - Set up `store.config.json` with App Store metadata

2. **Environment Variables**
   Add these to your `.env` file:
   ```
   # App Store Connect
   APPLE_ID=your_apple_id@example.com
   APPLE_TEAM_ID=YOUR_TEAM_ID
   
   # App Store Connect API Key (optional)
   APP_STORE_CONNECT_ISSUER_ID=your_issuer_id
   APP_STORE_CONNECT_KEY_IDENTIFIER=your_key_id
   APP_STORE_CONNECT_KEY_PATH=auth-key.p8
   ```

### Building for Production

1. **Configure EAS**
   ```bash
   # Initialize EAS if not already done
   eas init
   
   # Configure iOS build
   eas build:configure --platform ios
   
   # Configure Android build
   eas build:configure --platform android
   ```

2. **Build the App**
   ```bash
   # Build for iOS
   eas build --platform ios --profile production
   
   # Build for Android
   eas build --platform android --profile production
   
   # Or build for both platforms
   eas build --platform all --profile production
   ```

### Submitting to App Store

1. **Upload to App Store Connect**
   ```bash
   # Submit iOS build to App Store Connect
   eas submit --platform ios
   
   # Submit Android build to Play Store
   eas submit --platform android
   ```

2. **Update App Store Metadata**
   ```bash
   # Push metadata to App Store Connect
   eas metadata:push
   
   # Pull latest metadata from App Store Connect
   eas metadata:pull
   ```

### Automated Builds and Submissions

We've included a GitHub Actions workflow (`.github/workflows/build-and-submit.yml`) that can automatically build and submit your app on every push to the `main` branch.

## Development Setup

### Prerequisites

- Node.js 16+ and npm 7+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- PostgreSQL database ([Neon](https://neon.tech) is recommended for development)
- Redis (for caching and session management)
- Anthropic API key
- Expo account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freshchef.git
   cd freshchef
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/freshchef
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # Anthropic API
   ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # Expo
   EXPO_TOKEN=your_expo_token
   
   # App URLs
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Initialize the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   # Start Next.js server
   npm run dev
   
   # Start Expo development client (in a new terminal)
   npx expo start
   ```

### Development Workflow

- **Web**: Access the web app at `http://localhost:3000`
- **Mobile**: Use the Expo Go app to scan the QR code from the terminal
- **Database**: Use Prisma Studio to manage your database: `npx prisma studio`

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test-file.test.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Dependencies

- Node.js
- PostgreSQL database ([Neon](https://neon.tech) is easy and has a good free tier)
- Redis (for caching and session management)
- Anthropic API key
- Freestyle API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/freestyle-sh/adorable
   cd adorable
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Get a Freestyle API key

   Head to [our API keys page](https://admin.freestyle.sh/dashboard/api-tokens) to get yours. We're totally free to use right now!

4. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/adorable

   # Anthropic API
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # Freestyle API
   FREESTYLE_API_KEY=your_freestyle_api_key
   ```

5. Initialize the database:

   ```bash
   npx drizzle-kit push
   ```

6. Set up Redis

The easiest way to run Redis locally is with Docker:

```bash
docker run --name adorable-redis -p 6379:6379 -d redis
```

This will start a Redis server on port 6379. If you already have Redis running, you can skip this step.

Add the following to your `.env` file (if not already present):

```env
REDIS_URL=redis://localhost:6379
```

6. Set up [Stack Auth](https://stack-auth.com)

Go to the [Stack Auth dashboard](https://app.stack-auth.com) and create a new application. In Configuration > Domains, enable `Allow all localhost callbacks for development` to be able to sign in locally.

You'll need to add the following environment variables to your `.env` file:

```env
NEXT_PUBLIC_STACK_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=<your-publishable-client-key>
STACK_SECRET_SERVER_KEY=<your-secret-server-key>
```

7. Add a Preview Domain (optional)

Go to the [Freestyle dashboard](https://admin.freestyle.sh/dashboard/domains) and verify a new domain. Then follow the [DNS Instructions](https://docs.freestyle.sh/web/deploy-to-custom-domain) to point your domain to Freestyle.

Finally, add the following environment variable to your `.env` file:

```env
PREVIEW_DOMAIN=<your-domain> # formatted like adorable.app
```

8. Run the development server:

   ```bash
   npm run dev
   ```

9. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

For production deployment:

```bash
npm run build
npm run start
```

Or use the included deployment script:

```bash
./deploy.sh
```
