# AdStream Creator Marketplace

A full-stack web application that connects YouTube creators with brands for programmatic advertising. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Key Workflows](#key-workflows)

## Overview

AdStream is a two-sided marketplace that enables:

**For Creators:**
- Schedule upcoming video content with metadata
- Create and manage ad slots (5 different types)
- Receive bids from brands on ad placements
- Accept/reject bids and finalize deals
- Track earnings and payment status

**For Brands:**
- Discover creators by niche, audience size, engagement metrics
- Browse available ad slots on upcoming videos
- Place bids on specific ad placements
- Manage deals and payment tracking
- Verify content delivery

## Features

### Creator Features
- **Content Scheduling**: List upcoming videos with topics, expected reach, and publish dates
- **Ad Slot Management**: Create multiple ad slots per listing with different types and prices
- **Bid Management**: Review, accept, or reject bids from brands
- **Dashboard**: Track earnings, active bids, and upcoming content
- **YouTube Integration**: Connect YouTube account for channel metadata

### Brand Features
- **Creator Discovery**: Search and filter creators by various criteria
- **Bidding System**: Place bids on ad slots above the creator's reserve price
- **Deal Tracking**: Monitor accepted deals and content delivery
- **Payment Integration**: Secure payments through Stripe

### Platform Features
- **72-Hour Bidding Window**: Bidding closes 72 hours before content publish date
- **Platform Fee**: 20% fee on all deals (creators receive 80%)
- **Content Verification**: Brand verification of ad delivery before final payout

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5.19 |
| **Authentication** | NextAuth.js 4.24 |
| **Styling** | Tailwind CSS 3.4 |
| **Icons** | Lucide React |
| **Payments** | Stripe |
| **Password Hashing** | bcryptjs |

## Project Structure

```
adstream-marketplace/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── [...nextauth]/    # NextAuth configuration
│   │   │   ├── signup/           # User registration
│   │   │   └── youtube/          # YouTube OAuth
│   │   ├── bids/                 # Bid management
│   │   │   ├── route.ts          # GET/POST bids
│   │   │   └── [id]/             # Accept/reject bids
│   │   ├── brands/               # Brand endpoints
│   │   │   └── discover/         # Creator discovery
│   │   ├── creators/             # Creator endpoints
│   │   │   ├── profile/          # Creator profile
│   │   │   └── content-listings/ # Content management
│   │   ├── deals/                # Deal management
│   │   ├── listings/             # Content listings
│   │   └── health/               # Health check
│   ├── auth/                     # Auth pages
│   │   ├── signin/               # Sign in page
│   │   └── signup/               # Sign up page
│   ├── brand/                    # Brand pages
│   │   └── discover/             # Creator discovery
│   ├── creator/                  # Creator pages
│   │   ├── dashboard/            # Creator dashboard
│   │   └── profile/              # Profile settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── providers.tsx             # NextAuth provider
│   └── globals.css               # Global styles
├── lib/                          # Utility files
│   ├── prisma.ts                 # Prisma client singleton
│   └── stripe.ts                 # Stripe client
├── prisma/                       # Database
│   ├── schema.prisma             # Data models
│   └── migrations/               # Database migrations
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.js                # Next.js config
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Console project (for OAuth)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adstream-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# Google OAuth (for YouTube integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
```

## Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| **User** | Base user model with email, password hash, and user type |
| **Creator** | Extended profile for content creators with YouTube integration |
| **Brand** | Extended profile for brands/advertisers |
| **ContentListing** | Scheduled video content with metadata |
| **AdSlot** | Available ad placements within content |
| **Bid** | Offers from brands for ad slots |
| **Deal** | Finalized agreements after bid acceptance |

### Ad Slot Types

| Type | Description |
|------|-------------|
| `IN_VIDEO_INTEGRATION` | Product featured within video content |
| `LIVE_MENTION` | Mentioned during livestream |
| `STORY` | Featured in short-form content |
| `SHOUTOUT` | Direct endorsement/recommendation |
| `DESCRIPTION_LINK` | Link in video description |

### Status Enums

**Listing Status**: `DRAFT` → `ACTIVE` → `CLOSED` → `COMPLETED` or `CANCELLED`

**Bid Status**: `PENDING` → `ACCEPTED`/`REJECTED`/`EXPIRED`/`OUTBID`

**Deal Status**: Tracked via `paymentStatus` and `verificationStatus`

## API Routes

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Create new user account |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth authentication |
| GET | `/api/auth/youtube/connect` | Initialize YouTube OAuth |
| GET | `/api/auth/youtube/callback` | Handle YouTube OAuth callback |
| POST | `/api/auth/youtube/disconnect` | Disconnect YouTube account |

### Creators

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/creators/profile` | Get creator profile and stats |
| GET | `/api/creators/content-listings` | Get creator's listings |
| POST | `/api/creators/content-listings` | Create new listing |

### Brands

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/brands/discover` | Discover available listings |

### Bids

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bids` | Get bids (filtered by role) |
| POST | `/api/bids` | Place a new bid |
| POST | `/api/bids/[id]/accept` | Accept a bid (creator) |
| POST | `/api/bids/[id]/reject` | Reject a bid (creator) |

### Deals

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/deals` | Get deals with filtering |

### Listings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/listings` | Get listings |
| POST | `/api/listings` | Create listing |

## Authentication

AdStream uses NextAuth.js with two providers:

### 1. Google OAuth
- Primary method for creators
- Enables YouTube account connection
- Requires Google Cloud Console setup

### 2. Credentials (Email/Password)
- Available for both creators and brands
- Passwords hashed with bcrypt (10 rounds)
- JWT session strategy

### Session Management
- JWT-based sessions stored in HTTP-only cookies
- Session contains user ID for database queries
- Automatic session refresh

## Key Workflows

### Creator Workflow

```
1. Sign Up → Create account as CREATOR
2. Dashboard → View stats and listings
3. Create Listing → Add video details + ad slots
4. Receive Bids → Brands bid on your ad slots
5. Review Bids → Accept or reject bids
6. Fulfill Deal → Publish content with ad
7. Get Paid → Receive 80% of deal amount
```

### Brand Workflow

```
1. Sign Up → Create account as BRAND
2. Discover → Search creators by criteria
3. Find Listing → Browse available ad slots
4. Place Bid → Offer at or above reserve price
5. Wait → Creator reviews your bid
6. Deal Created → If accepted, deal is finalized
7. Verify → Confirm ad was delivered
8. Pay → Payment processed via Stripe
```

### Deal Flow

```
Bid Placed → Bid Accepted → Deal Created
                ↓
        Payment Collected
                ↓
        Content Published
                ↓
        Brand Verifies Delivery
                ↓
        Creator Payout (80%)
```

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Code Style

- TypeScript strict mode enabled
- Tailwind CSS for styling
- Component-based architecture
- API routes follow REST conventions
- Comprehensive JSDoc comments throughout

## Contributing

1. Create a feature branch
2. Make your changes
3. Add documentation/comments
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
