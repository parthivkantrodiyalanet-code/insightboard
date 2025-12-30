# 🚀 Quick Start Guide - InsightBoard

## For New Developers

### 1. First Time Setup (5 minutes)

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd insightboard

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local  # or use your preferred editor
```

### 2. Required Environment Variables

```env
# MongoDB - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/insightboard

# JWT Secret - Generate a random string
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe - Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Gemini AI - Get from Google AI Studio
GEMINI_API_KEY=AIza...
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📁 Where to Find Things

### Need to add a new page?

→ `src/app/your-page/page.tsx`

### Need to create a new API endpoint?

→ `src/app/api/your-endpoint/route.ts`

### Need a reusable UI component?

→ `src/components/ui/YourComponent.tsx`

### Need a chart component?

→ `src/components/charts/YourChart.tsx`

### Need to add a database model?

→ `src/models/YourModel.ts`

### Need a utility function?

→ `src/lib/utils/your-utility.ts`

---

## 🎯 Common Tasks

### Adding a Toast Notification

```typescript
import toast from "react-hot-toast";

// Success
toast.success("Data saved successfully!");

// Error
toast.error("Failed to save data");

// Loading
const loadingToast = toast.loading("Saving...");
// Later...
toast.dismiss(loadingToast);
toast.success("Saved!");
```

### Creating a New API Route

```typescript
// src/app/api/your-endpoint/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
```

### Adding a Loading State

```typescript
"use client";
import { useState, useEffect } from "react";
import { ChartLoader } from "@/components/charts";

export default function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/your-endpoint")
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartLoader loading={loading} error={error?.message}>
      {/* Your content here */}
      <div>{JSON.stringify(data)}</div>
    </ChartLoader>
  );
}
```

### Creating a Protected Page

```typescript
// The middleware already handles this!
// Just create your page in src/app/your-page/page.tsx
// It will automatically require authentication

export default function ProtectedPage() {
  return <div>Only logged-in users see this</div>;
}
```

---

## 🔍 Project Structure at a Glance

```
src/
├── app/              # Pages & API routes (Next.js App Router)
├── components/       # React components
│   ├── ui/          # Buttons, cards, modals
│   ├── charts/      # Data visualization
│   └── layout/      # Navbar, footer, sidebar
├── lib/             # Utilities
│   ├── api/         # Auth, Stripe, external APIs
│   ├── db/          # Database connection
│   └── utils/       # Helper functions
├── models/          # MongoDB schemas
└── middleware.ts    # Auth & security
```

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Check for errors
npm run lint -- --fix # Auto-fix errors

# Database
# (Add your own scripts in package.json)
```

---

## 🐛 Troubleshooting

### Port 3000 already in use?

```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database connection failed?

1. Check your `MONGODB_URI` in `.env.local`
2. Verify network access in MongoDB Atlas
3. Ensure your IP is whitelisted

### Build errors?

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Import errors after refactoring?

- Check the new import paths in `PROJECT_STRUCTURE.md`
- Use barrel exports: `import { Component } from '@/components/ui'`

---

## 📚 Documentation

- **README.md** - Full project overview
- **PROJECT_STRUCTURE.md** - Architecture details
- **CHANGELOG.md** - Version history
- **REFACTORING_SUMMARY.md** - Recent changes

---

## 🎨 Code Style

### Components

```typescript
// Use 'use client' for client components
"use client";

// Import order: external, internal, types
import { useState } from "react";
import { Button } from "@/components/ui";
import type { User } from "@/models/User";

// PascalCase for components
export default function MyComponent() {
  return <div>Hello</div>;
}
```

### API Routes

```typescript
// Always import NextResponse
import { NextResponse } from "next/server";

// Connect to DB first
await connectToDatabase();

// Return JSON responses
return NextResponse.json({ data });
```

---

## ✅ Before Committing

1. ✅ Run `npm run lint` - Fix any errors
2. ✅ Test locally - Verify everything works
3. ✅ Update documentation - If you added features
4. ✅ Write meaningful commit messages

---

## 🎯 Next Steps

1. **Explore the codebase** - Open files and read comments
2. **Try the features** - Create a dashboard, upload data
3. **Make a small change** - Add a toast notification somewhere
4. **Read the docs** - Check out README.md and PROJECT_STRUCTURE.md

---

## 💡 Pro Tips

- Use **React Query** for data fetching (already set up!)
- Use **toast notifications** for user feedback
- Use **ChartLoader** for async chart data
- Check **middleware.ts** to understand auth flow
- Use **barrel exports** for cleaner imports

---

## 🆘 Need Help?

1. Check the documentation files
2. Search for similar code in the project
3. Read the comments in the code
4. Open a GitHub issue

---

**Happy Coding! 🚀**

---

_Last Updated: December 30, 2025_
