import { useState, useEffect } from 'react';

interface StripeConnectStatus {
  hasStripeAccount: boolean;
  isOnboarded: boolean;
  accountId: string | null;
  accountStatus?: {
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    requirements: any;
  };
}

export function useStripeConnectStatus() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stripe/connect/status');
        
        if (!response.ok) {
          throw new Error('Failed to check Stripe Connect status');
        }
        
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { status, loading, error };
}
