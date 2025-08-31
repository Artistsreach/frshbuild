# FreshChef - AI-Powered Recipe Builder

A modern web application that helps users create, manage, and share recipes with AI assistance.

## Features

- 🤖 AI-powered recipe generation and suggestions
- 📱 Modern, responsive UI built with Next.js
- 🔐 Secure authentication with Firebase
- 💳 Payment processing with Stripe
- 🗄️ Database management with Supabase
- 🚀 Automated deployment with GitHub Actions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: OpenAI, Anthropic Claude
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Supabase project
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Artistsreach/frshbuild.git
cd frshbuild
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Providers
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add your environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Option 2: Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Option 3: Docker

1. Build the Docker image:
```bash
docker build -t freshchef .
```

2. Run the container:
```bash
docker run -p 3000:3000 freshchef
```

## Environment Variables

Make sure to set up the following environment variables for production:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Your Firebase service account JSON
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@freshchef.com or create an issue in this repository.
