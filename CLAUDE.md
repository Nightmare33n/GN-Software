# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ShipFast boilerplate - a Next.js (App Router) SaaS starter with integrated authentication, payments, email, and database functionality. Built for rapid MVP development.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Building
npm run build        # Build for production
npm run postbuild    # Auto-runs after build - generates sitemap

# Production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture

### App Router Structure (Next.js 14+)

- **app/**: Next.js App Router pages and API routes
  - **api/**: Server-side API endpoints
    - `auth/[...nextauth]/route.js`: NextAuth.js authentication handler
    - `lead/route.js`: Lead capture endpoint
    - `stripe/`: Stripe checkout and portal creation
    - `webhook/stripe/route.js`: Stripe webhook handler for payment events
  - **blog/**: Blog system with dynamic routes (articles, authors, categories)
  - **dashboard/**: Protected user dashboard
  - `layout.js`: Root layout with global SEO tags and theme configuration
  - `page.js`: Landing page

### Component Architecture

All components live in `/components` and are imported using the `@/` alias.

**Key Components:**
- **ButtonCheckout**: Triggers Stripe checkout sessions
- **ButtonSignin**: Handles authentication flow
- **ButtonAccount**: User account dropdown menu
- **LayoutClient**: Client-side wrapper containing Crisp chat, toasts, and tooltips

**Landing Page Components:**
- Hero, Features (Grid/Accordion/Listicle), Testimonials, FAQ, Pricing, CTA, Footer

### Core Libraries (`/libs`)

- **next-auth.js**: Authentication configuration (Google OAuth + Email)
- **stripe.js**: Stripe integration (checkout, portal, session retrieval)
- **api.js**: Axios client for frontend API calls with auth interceptors
- **mongoose.js**: MongoDB connection handler
- **mongo.js**: MongoDB native client (for NextAuth adapter)
- **seo.js**: SEO metadata generator
- **resend.js**: Email service client

### Database Models (`/models`)

- **User.js**: User schema with Stripe integration (customerId, priceId, hasAccess)
- **Lead.js**: Lead capture schema
- **plugins/toJSON.js**: Mongoose plugin for JSON serialization

### Configuration

**config.js** - Central configuration file containing:
- App metadata (name, description, domain)
- Stripe plans and pricing
- Authentication URLs
- Email settings (Resend)
- Crisp chat configuration
- DaisyUI theme settings

**Environment Variables** (see `.env.example`):
- `NEXTAUTH_URL` & `NEXTAUTH_SECRET`: Authentication
- `GOOGLE_ID` & `GOOGLE_SECRET`: Google OAuth
- `MONGODB_URI`: Database connection
- `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Payments
- `RESEND_API_KEY`: Email service

## Key Patterns

### Authentication Flow

1. NextAuth.js handles auth via Google OAuth or Email (magic links)
2. MongoDB adapter stores user sessions and accounts
3. Session strategy: JWT
4. Protected routes check session in `libs/api.js` interceptor
5. On 401: redirects to login with `callbackUrl` from `config.js`

### Payment Flow

1. User clicks `<ButtonCheckout />` with a priceId
2. Frontend calls `/api/stripe/create-checkout`
3. User completes payment on Stripe
4. Stripe webhook (`/api/webhook/stripe`) receives events
5. `checkout.session.completed`: Sets `user.hasAccess = true`
6. `customer.subscription.deleted`: Sets `user.hasAccess = false`
7. User model fields: `customerId`, `priceId`, `hasAccess`

### Database Connection

- Uses both Mongoose (for app models) and MongoDB native client (for NextAuth)
- Connection established in `libs/mongoose.js` and `libs/mongo.js`
- Models use singleton pattern: `mongoose.models.User || mongoose.model("User", userSchema)`

### Styling

- **Tailwind CSS** with **DaisyUI** component library
- Theme configured in `config.js` (light/dark)
- Custom animations in `tailwind.config.js`: opacity, appearFromRight, wiggle, popup, shimmer
- Global styles in `app/globals.css`

### SEO

- Default SEO tags set in root `layout.js` via `getSEOTags()` from `libs/seo.js`
- Override per page by passing params to `getSEOTags()`
- Sitemap auto-generated via `next-sitemap` in postbuild script

## HTML/React Component Comments

When writing HTML or React components, add START/END comments for major sections:

```jsx
{/* Hero START */}
<section className="hero">
  ...
</section>
{/* Hero END */}

{/* Footer START */}
<footer>
  ...
</footer>
{/* Footer END */}
```

## Important Notes

- **Never commit sensitive data**: All secrets go in `.env.local` (gitignored)
- **Stripe plans**: Define in `config.js` and ensure priceIds match Stripe dashboard
- **MongoDB required**: For authentication and user management
- **Image domains**: Whitelist in `next.config.js` for Next.js `<Image>` component
- **Path alias**: `@/` maps to root directory (configured in `jsconfig.json`)
