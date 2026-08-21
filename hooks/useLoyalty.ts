import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export interface LoyaltyAccount {
  account_id: string;
  user_id: string;
  total_points: number;
  tier_level: 'bronze' | 'silver' | 'gold';
  tier_progress_percent: number;
  lifetime_spend: number;
  tier_upgraded_at?: string;
  benefits: {
    discount_percent: number;
    points_multiplier: number;
    free_shipping_threshold?: number;
    birthday_bonus: number;
  };
  points_value_ghs: number;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'bonus';
  points: number;
  reason: string;
  created_at: string;
}

export function useLoyalty() {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/loyalty/account');
      setAccount(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loyalty account');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactionHistory = useCallback(async (limit = 20, offset = 0) => {
    try {
      setError(null);
      const response = await apiClient.get('/loyalty/history', {
        params: { limit, offset },
      });
      setTransactions(response.data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    }
  }, []);

  const redeemPoints = useCallback(async (points: number) => {
    try {
      setError(null);
      const response = await apiClient.post('/loyalty/redeem', null, {
        params: { points },
      });
      if (response.data.success) {
        setAccount(response.data.account);
        return {
          success: true,
          discountAmount: response.data.discount_amount_ghs,
        };
      } else {
        return {
          success: false,
          error: response.data.message,
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to redeem points';
      setError(message);
      return {
        success: false,
        error: message,
      };
    }
  }, []);

  const getTierColor = useCallback(() => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
    };
    return account ? colors[account.tier_level] : colors.bronze;
  }, [account]);

  const getTierEmoji = useCallback(() => {
    const emojis = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
    };
    return account ? emojis[account.tier_level] : emojis.bronze;
  }, [account]);

  useEffect(() => {
    fetchAccount();
    fetchTransactionHistory();
  }, [fetchAccount, fetchTransactionHistory]);

  return {
    account,
    transactions,
    loading,
    error,
    fetchAccount,
    fetchTransactionHistory,
    redeemPoints,
    getTierColor,
    getTierEmoji,
  };
}
