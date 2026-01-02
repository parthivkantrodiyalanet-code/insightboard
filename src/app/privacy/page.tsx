import React from "react";
import MarketingNavbar from "@/components/layout/MarketingNavbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <MarketingNavbar />
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-sm md:text-base">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when
              you create an account, subscribe to our newsletter, or contact
              customer support. This may include your name, email address, and
              payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to operate, maintain, and
              improve our services, to process transactions, and to communicate
              with you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">
              3. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal data against accidental or unlawful
              destruction, loss, change, or damage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track the
              activity on our Service and hold certain information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
