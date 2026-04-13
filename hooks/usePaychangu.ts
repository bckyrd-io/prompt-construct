"use client";

import { useState, useCallback } from "react";
import { PaychanguCheckoutOptions, isPaychanguLoaded } from "@/components/PaychanguScript";

interface UsePaychanguOptions {
  publicKey: string;
  onSuccess?: (txRef: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

interface PaymentParams {
  amount: number;
  currency?: string;
  txRef: string;
  milestoneId?: string;
  milestoneName?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
}

export function usePaychangu({ publicKey, onSuccess, onClose, onError }: UsePaychanguOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);

  const initializePayment = useCallback((params: PaymentParams) => {
    if (!isPaychanguLoaded()) {
      onError?.(new Error("Paychangu script not loaded"));
      return;
    }

    setIsLoading(true);

    try {
      const options: PaychanguCheckoutOptions = {
        public_key: publicKey,
        tx_ref: params.txRef,
        amount: params.amount,
        currency: params.currency || "USD",
        customer: {
          email: params.customerEmail || "client@example.com",
          first_name: params.customerFirstName || "James",
          last_name: params.customerLastName || "Roy",
        },
        customization: {
          title: params.milestoneName || "Construction Payment",
          description: `Payment for: ${params.milestoneName || "Construction Project"}`,
        },
        meta: {
          milestoneId: params.milestoneId || "",
        },
      };

      // Call Paychangu checkout
      window.PaychanguCheckout!(options);

      // Note: Paychangu doesn't provide direct callbacks in the popup version
      // Success/failure is handled via redirect URLs or webhook
      // We'll simulate the flow for better UX
      
      // After a delay, assume the user completed or closed the popup
      // In reality, this would be handled by the callback/return URLs
      setTimeout(() => {
        setIsLoading(false);
        onClose?.();
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      onError?.(error instanceof Error ? error : new Error("Payment initialization failed"));
    }
  }, [publicKey, onSuccess, onClose, onError]);

  const handleScriptLoad = useCallback(() => {
    setIsScriptReady(true);
  }, []);

  const handleScriptError = useCallback(() => {
    onError?.(new Error("Failed to load Paychangu script"));
  }, [onError]);

  return {
    initializePayment,
    isLoading,
    isScriptReady,
    handleScriptLoad,
    handleScriptError,
  };
}
