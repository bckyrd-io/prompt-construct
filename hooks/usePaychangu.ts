"use client";

import { useState, useCallback } from "react";

interface UsePaychanguOptions {
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
  propertyId?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  callbackUrl?: string;
  returnUrl?: string;
}

export function usePaychangu({ onSuccess, onClose, onError }: UsePaychanguOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = useCallback(async (params: PaymentParams) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'MWK',
          tx_ref: params.txRef,
          callback_url: params.callbackUrl,
          return_url: params.returnUrl,
          customer: {
            email: params.customerEmail || 'client@example.com',
            first_name: params.customerFirstName || 'James',
            last_name: params.customerLastName || 'Roy',
          },
          customization: {
            title: params.milestoneName || 'Construction Payment',
            description: `Payment for: ${params.milestoneName || 'Construction Project'}`,
          },
          meta: {
            milestoneId: params.milestoneId || '',
            milestoneName: params.milestoneName || '',
            propertyId: params.propertyId || '',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Payment initialization failed');
      }

      const data = await response.json();

      if (data.checkout_url) {
        onSuccess?.(params.txRef);
        // Redirect to Paychangu checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      setIsLoading(false);
      onError?.(error instanceof Error ? error : new Error("Payment initialization failed"));
    }
  }, [onSuccess, onError]);

  return {
    initializePayment,
    isLoading,
  };
}
