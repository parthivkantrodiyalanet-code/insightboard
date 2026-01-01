# InsightBoard - Analytics Dashboard SaaS

A production-ready Next.js 14 application for transforming Excel data into interactive dashboards with AI-powered insights.

## 🏗️ Project Structure

```
insightboard/
├── src/
│   ├── app/                      # Next.js 14 App Router pages
│   │   ├── (auth)/              # Authentication routes (login, register)
│   │   ├── api/                 # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── dashboards/     # Dashboard CRUD operations
│   │   │   ├── datasets/       # Dataset management
│   │   │   ├── widgets/        # Widget/chart operations
│   │   │   ├── insights/       # AI insights generation
│   │   │   └── stripe/         # Payment integration
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── pricing/            # Pricing page
│   │   ├── billing/            # Billing management
│   │   └── layout.tsx          # Root layout with providers
│   │
│   ├── components/              # React components (organized by type)
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── ToastProvider.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── AIInsights.tsx
│   │   │   ├── DashboardList.tsx
│   │   │   └── DownloadPDFButton.tsx
│   │   ├── charts/             # Chart components
│   │   │   ├── DashboardChart.tsx
│   │   │   ├── KPICard.tsx
│   │   │   └── ChartLoader.tsx
│   │   ├── layout/             # Layout components
│   │   │   └── MarketingNavbar.tsx
│   │   └── Providers.tsx       # React Query & Toast providers
│   │
│   ├── lib/                     # Utility libraries (organized by purpose)
│   │   ├── api/                # API-related utilities
│   │   │   ├── auth.ts         # Authentication helpers
│   │   │   ├── auth-helper.ts  # JWT utilities
│   │   │   └── stripe.ts       # Stripe configuration
│   │   ├── db/                 # Database utilities
│   │   │   └── index.ts        # MongoDB connection with caching
│   │   └── utils/              # General utilities
│   │       ├── data-analyzer.ts
│   │       └── gemini.ts       # AI integration
│   │
│   ├── models/                  # Mongoose models
│   │   ├── User.ts
│   │   ├── Dashboard.ts
│   │   ├── Dataset.ts
│   │   ├── Widget.ts
│   │   └── Chart.ts
│   │
│   └── middleware.ts            # Next.js middleware (auth, trial, security)
│
├── public/                      # Static assets
├── .env.local                   # Environment variables
└── package.json

```

## 🚀 Features

- **📊 Interactive Dashboards**: Create multiple dashboards with various chart types (bar, line, area)
- **📅 Advanced Filtering**: Robust date range filtering with support for Excel serial dates
- **📄 PDF Export**: Generate professional reports with one-click PDF export
- **📈 KPI Cards**: Display key metrics with glassmorphism design
- **🤖 AI Insights**: Gemini AI-powered data analysis and recommendations
- **🔐 Authentication**: Secure JWT-based auth with trial period management
- **💳 Stripe Integration**: Subscription management with webhook support
- **🎨 Modern UI**: Glassmorphism design with smooth animations
- **⚡ React Query**: Optimized data fetching and caching
- **🔔 Toast Notifications**: User-friendly feedback with react-hot-toast
- **📱 Responsive**: Mobile-first design approach

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jose)
- **Payments**: Stripe
- **Charts**: Recharts
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API
- **Notifications**: react-hot-toast

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔑 Environment Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

## 📖 Key Concepts

### Authentication Flow

1. User registers → 15-day trial starts automatically
2. JWT token stored in HTTP-only cookie
3. Middleware validates token on every request
4. Trial expiration redirects to pricing page

### Data Flow

1. Upload Excel file → Parse with xlsx library
2. Store in MongoDB → Create Dataset document
3. Generate AI insights → Gemini API analysis
4. Create dashboard → Link widgets to dataset
5. Render charts → Recharts visualization

### Component Organization

- **UI Components**: Reusable, presentational components
- **Chart Components**: Data visualization components
- **Layout Components**: Page structure components
- **Barrel Exports**: Simplified imports via index files

## 🎯 API Routes

| Endpoint               | Method           | Description            |
| ---------------------- | ---------------- | ---------------------- |
| `/api/auth/login`      | POST             | User login             |
| `/api/auth/me`         | GET              | Get current user       |
| `/api/users`           | GET, POST        | User management        |
| `/api/dashboards`      | GET, POST        | Dashboard CRUD         |
| `/api/dashboards/[id]` | GET, PUT, DELETE | Single dashboard       |
| `/api/datasets`        | GET, POST        | Dataset management     |
| `/api/widgets`         | GET, POST        | Widget operations      |
| `/api/insights`        | POST             | Generate AI insights   |
| `/api/stripe/webhook`  | POST             | Stripe webhook handler |

## 🔒 Security Features

- **CSP Headers**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **XSS Protection**: Cross-site scripting prevention
- **Frame Options**: Clickjacking protection
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Validation**: Secure token verification

## 🎨 Design System

### Colors

- Primary: `#3b82f6` (Blue)
- Secondary: `#8b5cf6` (Purple)
- Accent: `#f43f5e` (Rose)
- Background: `#0f172a` (Slate 950)
- Surface: `#1e293b` (Slate 900)

### Components

- **Glass Cards**: `glass-card` utility class
- **Buttons**: `btn-primary` with gradient
- **Inputs**: `input-field` with focus states
- **Animations**: Fade-in, spin, scale transforms

## 📝 Code Standards

- **Comments**: JSDoc for all exported functions
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components
- **File Organization**: Feature-based structure
- **Imports**: Barrel exports for cleaner imports

## 🚦 Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/name`
2. **Make Changes**: Follow code standards
3. **Test Locally**: `npm run dev`
4. **Build Check**: `npm run build`
5. **Commit**: Descriptive commit messages
6. **Push & PR**: Create pull request

## 📊 Performance Optimizations

- **React Query**: Automatic caching and refetching
- **React.memo**: Memoized chart components
- **MongoDB Caching**: Connection pooling
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component

## 🐛 Troubleshooting

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Connection

- Verify MongoDB URI in `.env.local`
- Check network access in MongoDB Atlas

### Authentication Issues

- Clear cookies and try again
- Verify JWT_SECRET is set

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js 14 and TypeScript**
