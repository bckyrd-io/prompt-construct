"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PaychanguScript, isPaychanguLoaded } from "@/components/PaychanguScript";

// Navigation items for client sidebar
const navItems = [
  { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { name: "Milestones", icon: "construction", href: "/dashboard" },
  { name: "Payment", icon: "payments", active: true, href: "/payment" },
  { name: "Documents", icon: "description", href: "#" },
  { name: "Settings", icon: "settings", href: "#" }
];

// Hardcoded payment data
const paymentData = {
  project: {
    id: "RC-2024-88",
    name: "The Highlands Estate",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    location: "Austin, TX"
  },
  balance: {
    total: 450000,
    paid: 150000,
    outstanding: 300000,
    nextDue: 50000,
    dueDate: "March 01, 2024"
  },
  milestones: [
    { id: 1, name: "Initial Deposit", amount: 75000, status: "paid", date: "Jan 15, 2024", percentage: 20 },
    { id: 2, name: "Foundation Complete", amount: 75000, status: "paid", date: "Feb 10, 2024", percentage: 20 },
    { id: 3, name: "Structural Framing", amount: 50000, status: "due", date: "Mar 01, 2024", percentage: 15 },
    { id: 4, name: "Roof Installation", amount: 60000, status: "pending", date: "Apr 15, 2024", percentage: 15 },
    { id: 5, name: "Interior Finishing", amount: 100000, status: "pending", date: "Jun 01, 2024", percentage: 25 },
    { id: 6, name: "Final Walkthrough", amount: 90000, status: "pending", date: "Jul 15, 2024", percentage: 15 }
  ]
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestoneId");
  const amountParam = searchParams.get("amount");
  const nameParam = searchParams.get("name");
  const errorParam = searchParams.get("error");

  const [amount, setAmount] = useState(amountParam || paymentData.balance.nextDue.toString());
  const [milestoneName, setMilestoneName] = useState(nameParam || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(errorParam ? "Payment was cancelled or failed. Please try again." : "");

  // Get public key from env or use test key
  const publicKey = process.env.NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY || "pub-test-HYSBQpa5K91mmXMHrjhkmC6mAjObPJ2u";

  const handlePayment = useCallback(() => {
    setIsProcessing(true);
    setError("");

    if (!isPaychanguLoaded()) {
      setError("Payment system not loaded. Please refresh and try again.");
      setIsProcessing(false);
      return;
    }

    try {
      const tx_ref = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Call Paychangu inline checkout
      window.PaychanguCheckout!({
        public_key: publicKey,
        tx_ref: tx_ref,
        amount: parseInt(amount),
        currency: "USD",
        callback_url: `${window.location.origin}/api/payment/callback`,
        return_url: `${window.location.origin}/api/payment/return`,
        customer: {
          email: "client@example.com",
          first_name: "James",
          last_name: "Roy",
        },
        customization: {
          title: milestoneName || "Construction Payment",
          description: `Payment for: ${milestoneName || "Construction Project"}`,
        },
        meta: {
          milestoneId: milestoneId || "",
          milestoneName: milestoneName || "",
        },
      });

      // The popup will handle the rest
      // User will either complete payment or close the popup
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);

    } catch (err) {
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : "Payment initialization failed");
    }
  }, [amount, milestoneId, milestoneName, publicKey]);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
          </div>
          <h2 className="text-2xl font-black text-black mb-2 uppercase">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your payment of ${parseInt(amount).toLocaleString()} has been processed.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">Transaction ID</p>
            <p className="font-mono font-bold text-black">PAY-{Date.now()}</p>
          </div>
          <div className="space-y-3">
            <Link 
              href="/dashboard"
              className="block w-full py-3 bg-[#ffc300] hover:bg-[#e6b000] text-black font-bold rounded-lg transition-colors"
            >
              Return to Dashboard
            </Link>
            <button 
              onClick={() => setShowSuccess(false)}
              className="block w-full py-3 border border-gray-200 hover:bg-gray-50 text-black font-bold rounded-lg transition-colors"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PaychanguScript onLoad={() => setScriptLoaded(true)} />
      <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffc300] flex items-center justify-center text-black rounded">
              <span className="material-symbols-outlined font-bold">construction</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase">RoyConstruction</h1>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active 
                  ? "bg-[#ffc300]/10 text-black" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span className={`material-symbols-outlined ${item.active ? "text-black" : "text-gray-400"}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-300 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600">person</span>
            </div>
            <div>
              <p className="text-sm font-bold text-black">James Roy</p>
              <p className="text-xs text-gray-500">Client</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <Link href="/dashboard" className="text-gray-500 hover:text-black">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-black font-bold underline decoration-[#ffc300] decoration-2 underline-offset-4">Make Payment</span>
              </nav>
              <h1 className="text-3xl font-bold text-black">Payment Portal</h1>
            </div>
           
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Summary */}
        


              <div className="lg:col-span-2">


      {/* Balance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Project Cost</span>
                  <span className="font-bold">${paymentData.balance.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-green-600">${paymentData.balance.paid.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Outstanding</span>
                  <span className="font-black text-[#ffc300]">${paymentData.balance.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffc300] rounded-full"
                  style={{ width: `${(paymentData.balance.paid / paymentData.balance.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                {((paymentData.balance.paid / paymentData.balance.total) * 100).toFixed(0)}% Paid
              </p>
            </div>


                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                 
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600">error</span>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Milestone Info */}
                  {milestoneName && (
                    <div className="mb-6 p-4 bg-[#ffc300]/10 rounded-lg border border-[#ffc300]/20">
                      <p className="text-xs font-bold uppercase text-gray-500 mb-1">Payment For</p>
                      <p className="text-lg font-black text-black">{milestoneName}</p>
                    </div>
                  )}

                  {/* Amount Display */}





                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Payment Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg text-2xl font-bold focus:border-[#ffc300] focus:ring-0 outline-none"
                        placeholder="Enter amount"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">You can edit the amount above if needed</p>
                  </div>

                  {/* Payment Method Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#ffc300] text-2xl">security</span>
                      <div>
                        <p className="font-bold text-black">Secure Checkout</p>
                        <p className="text-sm text-gray-500">You will be redirected to Paychangu&apos;s secure payment page where you can pay with:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600 border">Credit/Debit Card</span>
                          <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600 border">Bank Transfer</span>
                          <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600 border">Mobile Money</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !amount}
                className="w-full py-4 bg-black hover:bg-[#ffc300] hover:text-black text-white font-bold uppercase tracking-wide rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Pay ${parseInt(amount || "0").toLocaleString()}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="material-symbols-outlined text-sm">security</span>
                <span>Secured by Paychangu • 256-bit SSL encryption</span>
              </div>
            </div>
          </div>

        </div>
        </div>
      </main>
    </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#ffc300] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
