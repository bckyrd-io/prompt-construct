"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PaychanguScript, isPaychanguLoaded } from "@/components/PaychanguScript";
import { LayoutDashboard, Building2, CreditCard, FileText, Settings, CheckCircle, User, XCircle, ShieldCheck, Lock , ChevronsUpDown, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Navigation items for client sidebar
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Milestones", icon: Building2, href: "/dashboard" },
  { name: "Payment", icon: CreditCard, active: true, href: "/payment" },
  { name: "Documents", icon: FileText, href: "#" },
  { name: "Settings", icon: Settings, href: "#" }
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
  const [transactionId] = useState(() => `PAY-${Date.now()}`);

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

      toast.success("Secure payment initialized. Follow the Paychangu popup to complete.");

      // The popup will handle the rest
      // User will either complete payment or close the popup
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);

    } catch (err) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : "Payment initialization failed";
      setError(message);
      toast.error(message);
    }
  }, [amount, milestoneId, milestoneName, publicKey]);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-black mb-2 uppercase">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your payment of ${parseInt(amount).toLocaleString()} has been processed.</p>
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
    <SidebarProvider>
      <PaychanguScript onLoad={() => setScriptLoaded(true)} />
      <Toaster />
              <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon" className="border-r border-border !bg-white">
          <SidebarHeader className="h-16 border-b flex items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-3 w-full overflow-hidden group-data-[collapsible=icon]:justify-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col leading-none truncate group-data-[collapsible=icon]:hidden">
                <span className="font-semibold tracking-tight text-sm">RoyConstruction</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Client Portal</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem className="w-full" key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active} 
                    tooltip={item.name}
                    className="h-10 px-3 transition-colors"
                  >
                    <Link href={item.href} className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center ${item.active ? 'bg-primary/10' : ''}`}>
                      <item.icon className="size-4 shrink-0" />
                      <span className={`text-sm font-medium group-data-[collapsible=icon]:hidden ${item.active ? 'text-primary' : ''}`}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
                      <Avatar className="h-8 w-8 rounded-lg border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">JR</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">James Roy</span>
                        <span className="truncate text-xs text-muted-foreground">Client</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium text-xs">JR</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">James Roy</span>
                        <span className="truncate text-xs text-muted-foreground">james.roy@example.com</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

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
              <Progress value={(paymentData.balance.paid / paymentData.balance.total) * 100} className="mt-4 h-2 bg-gray-100 [&>[data-slot=progress-indicator]]:bg-[#ffc300]" />
              <p className="text-xs text-center text-gray-500 mt-2">
                {((paymentData.balance.paid / paymentData.balance.total) * 100).toFixed(0)}% Paid
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
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-8 text-2xl font-bold h-11 bg-muted border-border"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">You can edit the amount above if needed</p>
                  </div>

                  {/* Payment Method Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 text-[#ffc300]" />
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
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing || !amount}
                        className="w-full h-11 bg-black hover:bg-[#ffc300] hover:text-black text-white font-semibold uppercase tracking-wide gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Pay ${parseInt(amount || "0").toLocaleString()}
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
    </div>
    </SidebarProvider>
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
