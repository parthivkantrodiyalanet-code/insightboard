import Link from 'next/link';

export default function SubscriptionCancelledPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h2>
        <p className="text-slate-500 mb-6">
          You have not been charged. Your trial is still active if days are remaining.
        </p>
        <Link 
          href="/pricing" 
          className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
        >
          Return to Pricing
        </Link>
      </div>
    </div>
  );
}
