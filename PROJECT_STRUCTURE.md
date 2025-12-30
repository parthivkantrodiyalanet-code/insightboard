# InsightBoard - Project Structure Documentation

## 📁 Complete Directory Tree

```
insightboard/
│
├── 📄 Configuration Files
│   ├── .env.local                    # Environment variables (not in git)
│   ├── .gitignore                    # Git ignore rules
│   ├── package.json                  # Dependencies and scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.ts                # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── eslint.config.mjs             # ESLint rules
│   ├── README.md                     # Project documentation
│   └── CHANGELOG.md                  # Version history
│
├── 📂 public/                        # Static assets
│   ├── images/                       # Image files
│   └── favicon.ico                   # Site favicon
│
└── 📂 src/                           # Source code
    │
    ├── 📂 app/                       # Next.js 14 App Router
    │   │
    │   ├── 📂 (auth)/                # Auth route group
    │   │   ├── login/
    │   │   │   └── page.tsx          # Login page
    │   │   └── register/
    │   │       └── page.tsx          # Registration page
    │   │
    │   ├── 📂 api/                   # API Routes
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── route.ts      # POST /api/auth/login
    │   │   │   └── me/
    │   │   │       └── route.ts      # GET /api/auth/me
    │   │   │
    │   │   ├── dashboards/
    │   │   │   ├── [id]/
    │   │   │   │   └── route.ts      # GET/PUT/DELETE /api/dashboards/:id
    │   │   │   └── route.ts          # GET/POST /api/dashboards
    │   │   │
    │   │   ├── datasets/
    │   │   │   └── route.ts          # GET/POST /api/datasets
    │   │   │
    │   │   ├── widgets/
    │   │   │   └── route.ts          # GET/POST /api/widgets
    │   │   │
    │   │   ├── charts/
    │   │   │   └── route.ts          # GET /api/charts
    │   │   │
    │   │   ├── insights/
    │   │   │   └── route.ts          # POST /api/insights
    │   │   │
    │   │   ├── users/
    │   │   │   └── route.ts          # GET/POST /api/users
    │   │   │
    │   │   ├── stripe/
    │   │   │   └── webhook/
    │   │   │       └── route.ts      # POST /api/stripe/webhook
    │   │   │
    │   │   └── mock-payment/
    │   │       └── route.ts          # POST /api/mock-payment
    │   │
    │   ├── 📂 dashboard/             # Dashboard pages
    │   │   ├── [id]/
    │   │   │   └── page.tsx          # Individual dashboard view
    │   │   ├── new/
    │   │   │   └── page.tsx          # Create new dashboard
    │   │   └── page.tsx              # Dashboard list/overview
    │   │
    │   ├── 📂 pricing/
    │   │   └── page.tsx              # Pricing plans page
    │   │
    │   ├── 📂 billing/
    │   │   └── page.tsx              # Billing management
    │   │
    │   ├── 📂 about/
    │   │   └── page.tsx              # About page
    │   │
    │   ├── 📂 contact/
    │   │   └── page.tsx              # Contact page
    │   │
    │   ├── 📂 testimonials/
    │   │   └── page.tsx              # Testimonials page
    │   │
    │   ├── 📂 subscription-success/
    │   │   └── page.tsx              # Stripe success redirect
    │   │
    │   ├── 📂 subscription-cancelled/
    │   │   └── page.tsx              # Stripe cancel redirect
    │   │
    │   ├── layout.tsx                # Root layout (providers, fonts)
    │   ├── page.tsx                  # Landing page
    │   ├── globals.css               # Global styles & utilities
    │   └── favicon.ico               # App favicon
    │
    ├── 📂 components/                # React Components
    │   │
    │   ├── 📂 ui/                    # Reusable UI Components
    │   │   ├── ToastProvider.tsx     # Toast notification provider
    │   │   ├── Spinner.tsx           # Loading spinner
    │   │   ├── AIInsights.tsx        # AI insights display
    │   │   ├── DashboardList.tsx     # Dashboard list component
    │   │   ├── DownloadPDFButton.tsx # PDF export button
    │   │   └── index.ts              # Barrel export
    │   │
    │   ├── 📂 charts/                # Chart Components
    │   │   ├── DashboardChart.tsx    # Main chart component (bar/line/area)
    │   │   ├── KPICard.tsx           # KPI display card
    │   │   ├── ChartLoader.tsx       # Chart loading wrapper
    │   │   └── index.ts              # Barrel export
    │   │
    │   ├── 📂 layout/                # Layout Components
    │   │   ├── MarketingNavbar.tsx   # Marketing site navbar
    │   │   └── index.ts              # Barrel export
    │   │
    │   └── Providers.tsx             # React Query + Toast providers
    │
    ├── 📂 lib/                       # Utility Libraries
    │   │
    │   ├── 📂 api/                   # API Utilities
    │   │   ├── auth.ts               # Auth helper functions
    │   │   ├── auth-helper.ts        # JWT utilities
    │   │   └── stripe.ts             # Stripe client config
    │   │
    │   ├── 📂 db/                    # Database Utilities
    │   │   └── index.ts              # MongoDB connection (with caching)
    │   │
    │   └── 📂 utils/                 # General Utilities
    │       ├── data-analyzer.ts      # Data analysis functions
    │       └── gemini.ts             # Google Gemini AI integration
    │
    ├── 📂 models/                    # Mongoose Models
    │   ├── User.ts                   # User schema
    │   ├── Dashboard.ts              # Dashboard schema
    │   ├── Dataset.ts                # Dataset schema
    │   ├── Widget.ts                 # Widget schema
    │   └── Chart.ts                  # Chart schema
    │
    └── middleware.ts                 # Next.js middleware (auth, security)
```

## 🔍 Key Directories Explained

### `/src/app` - Next.js App Router

- **Route Groups**: `(auth)` groups related routes without affecting URL structure
- **Dynamic Routes**: `[id]` creates dynamic route segments
- **API Routes**: `route.ts` files define API endpoints
- **Pages**: `page.tsx` files define UI pages

### `/src/components` - Component Organization

- **ui/**: Pure presentational components (buttons, cards, modals)
- **charts/**: Data visualization components
- **layout/**: Page structure components (navbar, footer, sidebar)
- **Barrel Exports**: `index.ts` files simplify imports

### `/src/lib` - Utility Functions

- **api/**: API-related utilities (auth, external services)
- **db/**: Database connection and queries
- **utils/**: General-purpose helper functions

### `/src/models` - Data Models

- Mongoose schemas defining MongoDB collections
- Each model represents a database entity

## 📊 Data Flow Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Next.js Middleware          │
│  ✓ Authentication                   │
│  ✓ Trial Validation                 │
│  ✓ Security Headers                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│         App Router Pages            │
│  • Server Components (RSC)          │
│  • Client Components ('use client') │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│         API Routes                  │
│  • Authentication                   │
│  • CRUD Operations                  │
│  • External Services                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Database Layer              │
│  • MongoDB (Mongoose)               │
│  • Connection Caching               │
│  • Schema Validation                │
└─────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
├── Providers (React Query + Toast)
│   ├── QueryClientProvider
│   └── ToastProvider
│
└── Layout
    ├── MarketingNavbar (public pages)
    │
    └── Page Content
        ├── DashboardList
        │   └── Individual Dashboard Cards
        │
        ├── Charts
        │   ├── ChartLoader
        │   │   └── DashboardChart (Bar/Line/Area)
        │   └── KPICard
        │
        └── AIInsights
            └── Insight Cards
```

## 🔐 Authentication Flow

```
1. User Registration
   ↓
2. Password Hashing (bcrypt)
   ↓
3. User Created in DB
   ↓
4. JWT Token Generated
   ↓
5. Token Stored in HTTP-only Cookie
   ↓
6. Middleware Validates on Each Request
   ↓
7. Trial Period Checked
   ↓
8. Access Granted/Denied
```

## 📦 Import Path Aliases

| Alias          | Resolves To      | Example                                     |
| -------------- | ---------------- | ------------------------------------------- |
| `@/components` | `src/components` | `import { Spinner } from '@/components/ui'` |
| `@/lib`        | `src/lib`        | `import connectDB from '@/lib/db'`          |
| `@/models`     | `src/models`     | `import User from '@/models/User'`          |
| `@/app`        | `src/app`        | `import { metadata } from '@/app/layout'`   |

## 🚀 Build & Deployment

### Development

```bash
npm run dev          # Start dev server (localhost:3000)
npm run lint         # Run ESLint
```

### Production

```bash
npm run build        # Build for production
npm start            # Start production server
```

### Environment Variables Required

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `GEMINI_API_KEY` - Google Gemini API key

## 📝 Naming Conventions

- **Files**: PascalCase for components (`DashboardChart.tsx`), kebab-case for utilities (`data-analyzer.ts`)
- **Components**: PascalCase (`function DashboardChart()`)
- **Functions**: camelCase (`function getUserFromToken()`)
- **Constants**: UPPER_SNAKE_CASE (`const JWT_SECRET`)
- **Types/Interfaces**: PascalCase (`interface UserProps`)

## 🎯 Best Practices Implemented

✅ **Separation of Concerns**: Clear separation between UI, logic, and data
✅ **Type Safety**: TypeScript with strict mode
✅ **Code Reusability**: Barrel exports and shared components
✅ **Performance**: React Query caching, connection pooling
✅ **Security**: Middleware protection, password hashing, security headers
✅ **Documentation**: JSDoc comments on all exports
✅ **Error Handling**: Try-catch blocks with proper error messages
✅ **Loading States**: Spinners and loaders for async operations
✅ **User Feedback**: Toast notifications for actions

---

**Last Updated**: 2025-12-30
