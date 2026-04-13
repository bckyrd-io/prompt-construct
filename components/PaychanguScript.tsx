"use client";

import { useEffect, useState } from "react";

// Global type augmentation for PaychanguCheckout
declare global {
  interface Window {
    PaychanguCheckout?: (options: PaychanguCheckoutOptions) => void;
  }
}

export interface PaychanguCheckoutOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  callback_url?: string;
  return_url?: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, string | number>;
}

interface PaychanguScriptProps {
  onLoad?: () => void;
  onError?: () => void;
}

export function PaychanguScript({ onLoad, onError }: PaychanguScriptProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src="https://in.paychangu.com/js/popup.js"]')) {
      setLoaded(true);
      onLoad?.();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://in.paychangu.com/js/popup.js";
    script.async = true;
    
    script.onload = () => {
      setLoaded(true);
      onLoad?.();
    };
    
    script.onerror = () => {
      console.error("Failed to load Paychangu script");
      onError?.();
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid reloading
    };
  }, [onLoad, onError]);

  return null;
}

export function isPaychanguLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.PaychanguCheckout === "function";
}
