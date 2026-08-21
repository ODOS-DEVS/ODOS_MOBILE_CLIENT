import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';

export interface EmailPreferences {
  user_id: string;
  promotional_emails: boolean;
  order_updates: boolean;
  loyalty_rewards: boolean;
  cart_reminders: boolean;
  weekly_newsletter: boolean;
  product_recommendations: boolean;
  exclusive_offers: boolean;
  updated_at: string;
}

export function useEmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/account/email-preferences');
      setPreferences(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      // Return default preferences on error
      setPreferences({
        user_id: '',
        promotional_emails: false,
        order_updates: true,
        loyalty_rewards: true,
        cart_reminders: false,
        weekly_newsletter: false,
        product_recommendations: false,
        exclusive_offers: false,
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (updates: Partial<EmailPreferences>) => {
      try {
        const response = await apiClient.patch('/account/email-preferences', updates);
        setPreferences(response);
        return true;
      } catch (err) {
        console.error('Failed to update preferences:', err);
        return false;
      }
    },
    []
  );

  const togglePreference = useCallback(
    async (key: keyof EmailPreferences) => {
      if (!preferences) return false;

      const newValue = !(preferences[key] as boolean);
      const success = await updatePreferences({ [key]: newValue });

      if (success) {
        setPreferences({
          ...preferences,
          [key]: newValue,
        });
      }

      return success;
    },
    [preferences, updatePreferences]
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    togglePreference,
    refetch: fetchPreferences,
  };
}
