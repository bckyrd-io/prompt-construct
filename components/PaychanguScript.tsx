"use client";

import Script from "next/script";
import { useCallback } from "react";

// Paychangu checkout options interface
export interface PaychanguCustomer {
  email: string;
  first_name: string;
  last_name: string;
}

export interface PaychanguCustomization {
  title?: string;
  description?: string;
  logo?: string;
}

export interface PaychanguCheckoutOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  callback_url?: string;
  return_url?: string;
  customer: PaychanguCustomer;
  customization?: PaychanguCustomization;
  meta?: Record<string, string>;
}

// Extend Window interface to include Paychangu
declare global {
  interface Window {
    PaychanguCheckout?: (options: PaychanguCheckoutOptions) => void;
  }
}

// Check if Paychangu is loaded
export function isPaychanguLoaded(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.PaychanguCheckout === "function";
}

interface PaychanguScriptProps {
  onLoad?: () => void;
  onError?: () => void;
}

export function PaychanguScript({ onLoad, onError }: PaychanguScriptProps) {
  const handleLoad = useCallback(() => {
    console.log("Paychangu script loaded successfully");
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    console.error("Failed to load Paychangu script");
    onError?.();
  }, [onError]);

  return (
    <Script
      src="https://api.paychangu.com/js/paychangu.js"
      strategy="lazyOnload"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

export default PaychanguScript;
