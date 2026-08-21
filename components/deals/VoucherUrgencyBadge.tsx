import React from 'react';
import { View } from 'react-native';
import FlashSaleCountdown from './FlashSaleCountdown';
import { getSecondsRemaining } from '../../utils/countdown';

interface VoucherUrgencyBadgeProps {
  expiresAt?: string;
  tone?: 'dark' | 'gold';
}

const VoucherUrgencyBadge: React.FC<VoucherUrgencyBadgeProps> = ({
  expiresAt,
  tone = 'dark',
}) => {
  if (!expiresAt) return null;

  const secondsRemaining = getSecondsRemaining(expiresAt);

  // Only show urgent countdown if less than 48 hours remaining
  const URGENCY_THRESHOLD_SECONDS = 48 * 60 * 60;

  if (secondsRemaining <= 0 || secondsRemaining > URGENCY_THRESHOLD_SECONDS) {
    return null;
  }

  return (
    <View>
      <FlashSaleCountdown
        endsAt={expiresAt}
        serverSecondsRemaining={secondsRemaining}
        tone={tone}
        labelPrefix="Expires in"
      />
    </View>
  );
};

export default VoucherUrgencyBadge;
