import React from "react";
import MarketingNavbar from "@/components/layout/MarketingNavbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <MarketingNavbar />
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="space-y-6 text-sm md:text-base">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using InsightBoard (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              2. Description of Service
            </h2>
            <p>
              InsightBoard provides data visualization and analytics tools. We
              reserve the right to modify, suspend, or discontinue any part of
              the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to notify us immediately of any
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              4. Data Privacy
            </h2>
            <p>
              Your data is important to us. We process your data in accordance
              with our Privacy Policy. By using InsightBoard, you consent to
              such processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              5. Limitation of Liability
            </h2>
            <p>
              InsightBoard shall not be liable for any indirect, incidental,
              special, consequential or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
