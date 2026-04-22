"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { LayoutDashboard, Building2, CreditCard, FileText, Settings, CheckCircle, User, XCircle, ShieldCheck, Lock as LockIcon, ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

// Hardcoded payment data
const paymentData = {
  project: {
    id: "RC-2024-88",
    name: "The Highlands Estate",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    location: "Lilongwe"
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
  const propertyIdParam = searchParams.get("propertyId");
  const errorParam = searchParams.get("error");

  const [amount, setAmount] = useState(amountParam || paymentData.balance.nextDue.toString());
  const [milestoneName, setMilestoneName] = useState(nameParam || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(errorParam ? "Payment was cancelled or failed. Please try again." : "");
  const [transactionId] = useState(() => `PAY-${Date.now()}`);
  const [property, setProperty] = useState<any>(null);
  const [balanceInfo, setBalanceInfo] = useState({
    totalCost: 0,
    paidAmount: 0,
    remainingBalance: 0
  });
  const isCompletePay = milestoneId === '-1';

  // Fetch property data if propertyId is provided
  useEffect(() => {
    if (propertyIdParam) {
      fetchPropertyData(propertyIdParam);
    }
  }, [propertyIdParam]);

  const fetchPropertyData = async (propId: string) => {
    try {
      const response = await fetch(`/api/properties/${propId}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data.property);
        
        // Calculate balance
        if (data.property?.milestones) {
          const totalCost = data.property.price || 0;
          const paidAmount = data.property.milestones
            .filter((m: any) => m.payment_status === 'paid' || m.completed)
            .reduce((sum: number, m: any) => sum + (m.amount || 0), 0);
          const remainingBalance = totalCost - paidAmount;
          
          setBalanceInfo({
            totalCost,
            paidAmount,
            remainingBalance
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch property:", err);
    }
  };


  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    try {
      // Validate Complete Pay requires full remaining balance
      if (isCompletePay) {
        const requiredAmount = balanceInfo.remainingBalance;
        const paymentAmount = parseInt(amount || "0");
        if (paymentAmount !== requiredAmount) {
          throw new Error(`Complete Payment requires paying the full remaining balance of MK ${requiredAmount.toLocaleString()}`);
        }
      }

      const tx_ref = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Build callback URL - explicitly include port for localhost
      const protocol = window.location.protocol;
      const host = window.location.host;
      // For localhost, explicitly include port 3000
      const callbackHost = host.includes('localhost') ? 'localhost:3000' : host;
      const callbackUrl = `${protocol}//${callbackHost}/api/payment/callback`;
      const returnUrl = `${protocol}//${callbackHost}/api/payment/return`;

      // Call server-side initialization endpoint
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency: 'MWK',
          tx_ref,
          callback_url: callbackUrl,
          return_url: returnUrl,
          customer: {
            email: 'client@example.com',
            first_name: 'James',
            last_name: 'Roy',
          },
          customization: {
            title: isCompletePay ? 'Complete Payment' : (milestoneName || 'Construction Payment'),
            description: isCompletePay ? 'Final payment to complete property acquisition' : `Payment for: ${milestoneName || 'Construction Project'}`,
          },
          meta: {
            milestoneId: milestoneId || '',
            milestoneName: milestoneName || '',
            propertyId: propertyIdParam || '',
            amount: amount || '0',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Payment initialization failed');
      }

      const data = await response.json();

      if (data.checkout_url) {
        // Redirect to Paychangu checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(message);
      toast.error(message);
    }
  }, [amount, milestoneId, milestoneName, propertyIdParam, isCompletePay, balanceInfo.remainingBalance]);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-black mb-2 uppercase">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your payment of MK {parseInt(amount).toLocaleString()} has been processed.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">Transaction ID</p>
            <p className="font-mono font-bold text-black">{transactionId}</p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full h-11 bg-[#ffc300] hover:bg-[#e6b000] text-black font-semibold rounded-lg">
              <Link href="/dashboard">
                Return to Dashboard
              </Link>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowSuccess(false)}
              className="w-full h-11 border-border font-semibold"
            >
              Make Another Payment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <AppSidebar>
      <Toaster />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 transition-all">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold tracking-tight text-foreground">Make Payment</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Summary */}
        


              <div className="lg:col-span-2">


      {/* Balance Summary */}
            <Card className="shadow-sm hover:shadow-md transition-shadow mb-5">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Property Cost</span>
                  <span className="font-bold">MK {(property?.price || balanceInfo.totalCost || paymentData.balance.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-green-600">MK {balanceInfo.paidAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Remaining Balance</span>
                  <span className="font-black text-[#ffc300]">MK {balanceInfo.remainingBalance.toLocaleString()}</span>
                </div>
              </div>
              <Progress 
                value={balanceInfo.totalCost > 0 ? (balanceInfo.paidAmount / balanceInfo.totalCost) * 100 : 
                       paymentData.balance.total > 0 ? (paymentData.balance.paid / paymentData.balance.total) * 100 : 0} 
                className="mt-4 h-2 bg-gray-100 [&>[data-slot=progress-indicator]]:bg-[#ffc300]" 
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                {balanceInfo.totalCost > 0 ? ((balanceInfo.paidAmount / balanceInfo.totalCost) * 100).toFixed(0) :
                 paymentData.balance.total > 0 ? ((paymentData.balance.paid / paymentData.balance.total) * 100).toFixed(0) : 0}% Paid
              </p>
              </CardContent>
            </Card>


                <Card className="shadow-sm hover:shadow-md transition-shadow mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Make Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Milestone Info */}
                  {milestoneName && (
                    <div className={`mb-6 p-4 rounded-lg border ${isCompletePay ? 'bg-green-50 border-green-200' : 'bg-[#ffc300]/10 border-[#ffc300]/20'}`}>
                      <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                        {isCompletePay ? 'Final Payment' : 'Payment For'}
                      </p>
                      <p className="text-lg font-black text-black">{milestoneName}</p>
                      {isCompletePay && (
                        <p className="text-xs text-green-700 mt-2">
                          ✓ All milestones completed • Property ready for final acquisition
                        </p>
                      )}
                    </div>
                  )}

                  {/* Amount Display */}

                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-3">
                      {isCompletePay ? 'Final Payment Amount (Fixed)' : 'Payment Amount'}
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-8 text-2xl font-bold h-11 bg-muted border-border"
                        placeholder="0"
                        disabled={isCompletePay}
                      />
                      {isCompletePay && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <LockIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {isCompletePay 
                        ? 'This is the final payment to complete your property acquisition. The amount is fixed.'
                        : 'You can edit the amount above if needed'}
                    </p>
                  </div>

                 

                  {/* Pay Button */}
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing || !amount}
                        className={`w-full h-11 font-semibold uppercase tracking-wide gap-2 ${isCompletePay ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-black hover:bg-[#ffc300] hover:text-black text-white'}`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-6 h-6 text-[#ffc300]" />
                            {isCompletePay ? 'Complete Acquisition' : `Pay MK ${parseInt(amount || "0").toLocaleString()}`}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Secure Paychangu checkout</TooltipContent>
                  </Tooltip>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>Secured by Paychangu • 256-bit SSL encryption</span>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
    </AppSidebar>
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
