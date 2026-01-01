"use client";

import { useState } from "react";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    // Mock cancellation for now, or call API
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Subscription cancelled successfully.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full glass-card overflow-hidden">
        <div className="bg-slate-900/50 p-6 text-center border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Secure Checkout
          </h1>
          <p className="text-slate-400 text-sm mt-1">Powered by Stripe</p>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center border-b border-slate-700/50 pb-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg text-white">Pro Plan</h3>
              <p className="text-blue-400 text-sm">Monthly subscription</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">$5.00</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-slate-300 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <Lock className="w-5 h-5 text-green-400" />
              <span>SSL Encrypted Payment</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <span>No real charge (Demo Mode)</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Proceed to Payment</>
              )}
            </button>

            <button
              onClick={() =>
                setConfirmConfig({
                  isOpen: true,
                  title: "Cancel Subscription",
                  message:
                    "Are you sure you want to cancel your subscription? You will lose access to premium features immediately. This action cannot be undone.",
                  onConfirm: () => {
                    handleCancelSubscription();
                    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
                  },
                  type: "danger",
                })
              }
              disabled={loading}
              className="w-full py-2 text-slate-400 hover:text-red-400 text-sm font-medium transition-colors"
            >
              Cancel Subscription
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            You will be redirected to the secure payment portal.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() =>
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
        }
        type={confirmConfig.type}
      />
    </div>
  );
}
