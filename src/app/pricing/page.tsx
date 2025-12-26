import { getCurrentUser } from '@/lib/auth-helper'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default async function PricingPage() {
  const user = await getCurrentUser()
  const now = new Date()
  
  let buttonText = "Start 15-Day Free Trial"
  let buttonHref = "/register"
  let isButtonDisabled = false
  
  // Logic for button state
  if (user) {
    const trialEnds = new Date(user.trialEndsAt as string)
    const isPaid = user.isPaid === true
    const isTrialActive = now < trialEnds
    
    if (isPaid) {
      buttonText = "Manage Subscription"
      buttonHref = "/billing"
    } else if (isTrialActive) {
      buttonText = "Trial Active"
      buttonHref = "#"
      isButtonDisabled = true
    } else {
      // Trial expired and not paid
      buttonText = "Subscribe for $5"
      buttonHref = "/billing"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Navbar Link */}
      <div className="absolute top-6 left-6">
         <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
             InsightBoard
         </Link>
      </div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-6 py-2">
            Simple Pricing
        </h1>
        <p className="text-xl text-slate-400">Start free. Pay only if it helps you.</p>
      </div>

      <div className="w-full max-w-md glass-card overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="p-8 relative z-10">
          <div className="flex justify-center mb-6">
            <span className="px-4 py-1.5 text-sm font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full">
              All-in-One Access
            </span>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-extrabold text-white">$5</span>
              <span className="text-lg text-slate-400">/month</span>
            </div>
            <p className="mt-4 text-sm text-blue-400 font-medium">15 Days Free • Cancel anytime</p>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Unlimited access to analytics",
              "Max Excel size: 2MB",
              "Max rows: 5,000 per file",
              "Max 3 datasets",
              "Max 2 dashboards",
              "Max 8 widgets per dashboard"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-green-500/10 rounded-full mt-0.5">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {isButtonDisabled ? (
              <button 
                disabled 
                className="w-full py-4 px-4 bg-slate-800 text-slate-500 font-semibold rounded-xl cursor-not-allowed border border-slate-700"
              >
                {buttonText}
              </button>
            ) : (
              <Link 
                href={buttonHref}
                className="btn-primary block w-full text-center"
              >
                {buttonText}
              </Link>
            )}
            
            {!user && (
              <p className="mt-4 text-xs text-center text-slate-500">
                No credit card required for trial
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
