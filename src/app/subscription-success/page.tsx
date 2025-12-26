'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const demo = searchParams.get('demo');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    demo === 'true' ? 'processing' : 'success'
  );

  useEffect(() => {
    if (demo === 'true') {
      // Simulate verifying payment
      const timer = setTimeout(() => {
        fetch('/api/mock-payment', { method: 'POST' })
          .then((res) => {
            if (res.ok) setStatus('success');
            else setStatus('error');
          })
          .catch(() => setStatus('error'));
      }, 1500); // Fake delay for realism

      return () => clearTimeout(timer);
    }
  }, [demo]);

  return (
    <div className="w-full max-w-md p-8 glass-card text-center">
      {status === 'processing' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white">Confirming Payment...</h2>
          <p className="text-slate-400 mt-2">Please wait while we secure your subscription.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Subscription Active!</h2>
          <p className="text-slate-400 mt-2 mb-8">Thank you for upgrading. Your account limits have been lifted.</p>
          <div className="space-y-3 w-full">
            <Link 
              href="/dashboard" 
              className="btn-primary block w-full text-center"
            >
              Go to Dashboard
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-600">
             Note: You may need to re-login if access is not immediate.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
           <h2 className="text-2xl font-bold text-rose-500">Something went wrong</h2>
           <p className="text-slate-400 mt-2">We couldn't verify the payment given the demo key constraints.</p>
           <Link href="/billing" className="mt-6 text-blue-400 hover:text-blue-300">Try Again</Link>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
         <SuccessContent />
      </Suspense>
    </div>
  );
}
