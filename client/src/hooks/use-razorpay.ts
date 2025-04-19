import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number; // in smallest currency unit (paise for INR)
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      setIsLoading(false);
      toast({
        title: "Payment Service Error",
        description: "Could not load payment service. Please try again later.",
        variant: "destructive"
      });
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const openRazorpayCheckout = (options: RazorpayOptions) => {
    if (!isLoaded) {
      toast({
        title: "Payment Service Not Ready",
        description: "Payment service is still loading. Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }
    
    const razorpay = new window.Razorpay({
      ...options,
      key: options.key || process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere",
      theme: { color: "#3b82f6", ...options.theme },
      modal: {
        ondismiss: () => {
          toast({
            title: "Payment Cancelled",
            description: "You have closed the payment window. Your order has not been placed.",
            variant: "destructive"
          });
        }
      }
    });
    
    razorpay.open();
  };

  return { isLoaded, isLoading, openRazorpayCheckout };
}
