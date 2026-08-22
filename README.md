# Glowify AI Executive Dashboard

The **Glowify AI Executive Dashboard** is a high-performance, real-time analytics and management interface designed for direct-to-consumer beauty brands. Built to empower store owners with actionable insights, it integrates seamlessly with Shopify, Meta, Google, and Klaviyo ecosystems.

## Core Features

- **AI-Powered Command Center:** Real-time monitoring of AI-driven business automations, health scoring, and actionable task management.
- **Performance Analytics:** Comprehensive revenue tracking with multi-period comparison (7D/30D/60D), channel attribution, and conversion funnel analysis.
- **Marketing Hub:** Centralized management of ad spend, ROAS trends across meta/google platforms, and email campaign performance.
- **Product Intelligence:** Inventory health monitoring, SKU-level margin analysis, and data-backed product bundling opportunities.
- **Customer Insights:** In-depth customer segmentation, retention curve tracking, and geo-specific revenue analysis.
- **Automation Center:** Full control over active business automations with real-time impact attribution and revenue reporting.

## Technical Architecture

- **Frontend:** React (TypeScript) with Vite, styled with Tailwind CSS v4 for a polished, performant UI.
- **Visualization:** Data-driven visualizations powered by `recharts`.
- **Backend/Integrations:** Built on Firebase, utilizing Cloud Functions for real-time Shopify synchronization.
- **Authentication:** Secured with Firebase Auth.

## Getting Started

1. **Clone the repository:** `git clone <repository-url>`
2. **Install dependencies:** `pnpm install`
3. **Environment setup:** Copy `.env.example` to `.env` and configure your Firebase credentials.
4. **Development:** `pnpm dev`
5. **Production Build:** `pnpm build`

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gemini AI
VITE_GEMINI_API_KEY=

# App
VITE_APP_ENV=development
VITE_SHOPIFY_STORE_URL=serenova-global.myshopify.com
```

## Vercel Deployment

This project is configured for deployment on Vercel. The `vercel.json` file at the root handles the build configuration and routing.

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

## License

SEVEN-MOTION 
