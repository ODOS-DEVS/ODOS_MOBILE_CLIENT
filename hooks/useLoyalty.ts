import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from '@/context/AuthContext';
import {
  isLoyaltyCacheFresh,
  readLoyaltyCache,
  writeLoyaltyCache,
} from '@/utils/loyaltyCache';

// Re-exported so existing callers keep working; the implementation moved to
// utils/loyaltyCache to break an AuthContext require cycle.
export { clearLoyaltyCache } from '@/utils/loyaltyCache';

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

interface LoyaltyHistoryResponse {
  transactions: LoyaltyTransaction[];
  count: number;
  limit: number;
  offset: number;
}

interface RedeemResponse {
  success: boolean;
  message?: string;
  account?: LoyaltyAccount;
  /**
   * Cash moved into the ODOS wallet by this redemption.
   *
   * Replaces `discount_amount_ghs`, which was never real: the old endpoint
   * burned the points and reported a discount no checkout code applied. Points
   * now become spendable wallet balance, so the response carries the credit
   * and the resulting balance.
   */
  cash_value_ghs?: number;
  points_redeemed?: number;
  wallet_balance?: number;
}

export function useLoyalty({ withHistory = false }: { withHistory?: boolean } = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Seed from cache so a revisit paints the real value on the first frame.
  const [account, setAccount] = useState<LoyaltyAccount | null>(
    () => readLoyaltyCache(userId)?.account ?? null,
  );
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(() => !readLoyaltyCache(userId));
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const entry = readLoyaltyCache(userId);
      if (!force && isLoyaltyCacheFresh(entry)) {
        setAccount(entry!.account);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const next = await apiClient.get<LoyaltyAccount>('/loyalty/account');
        writeLoyaltyCache(userId, next);
        setAccount(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch loyalty account');
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const fetchTransactionHistory = useCallback(async (limit = 20, offset = 0) => {
    try {
      setError(null);
      const response = await apiClient.get<LoyaltyHistoryResponse>(
        '/loyalty/history',
        { params: { limit, offset } }
      );
      setTransactions(response.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    }
  }, []);

  const redeemPoints = useCallback(async (points: number) => {
    try {
      setError(null);
      // `points` is a QUERY parameter server-side (POST /api/loyalty/redeem),
      // not a body field — sending it in the body returns 422.
      const response = await apiClient.post<RedeemResponse>(
        '/loyalty/redeem',
        undefined,
        { params: { points } }
      );
      if (response.success) {
        if (response.account) setAccount(response.account);
        return {
          success: true,
          cashValue: response.cash_value_ghs,
          pointsRedeemed: response.points_redeemed,
          walletBalance: response.wallet_balance,
          message: response.message,
        };
      } else {
        return {
          success: false,
          error: response.message,
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
    void fetchAccount();
    if (withHistory) {
      void fetchTransactionHistory();
    }
  }, [fetchAccount, fetchTransactionHistory, withHistory]);

  return {
    account,
    transactions,
    loading,
    /** False only while the first load for this user is still in flight. */
    hasLoaded: !loading,
    error,
    fetchAccount,
    fetchTransactionHistory,
    redeemPoints,
    getTierColor,
    getTierEmoji,
  };
}
