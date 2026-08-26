import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Tone = 'gold' | 'dark' | 'success' | 'muted';

interface PromoBadgeProps {
  label: string;
  tone?: Tone;
  small?: boolean;
}

const PromoBadge: React.FC<PromoBadgeProps> = ({
  label,
  tone = 'gold',
  small = false,
}) => {
  const { colors } = useTheme();

  const getToneStyles = (t: Tone) => {
    switch (t) {
      case 'dark':
        return {
          backgroundColor: colors.inverseSurface,
          textColor: colors.onInverseSurface,
        };
      case 'success':
        return {
          backgroundColor: colors.successText,
          textColor: colors.onPrimary,
        };
      case 'muted':
        return {
          backgroundColor: colors.surfaceMuted,
          textColor: colors.textMuted,
        };
      case 'gold':
      default:
        return {
          backgroundColor: '#FDB913',
          textColor: '#1a1a1a',
        };
    }
  };

  const toneStyles = getToneStyles(tone);
  const paddingSize = small ? 6 : 8;
  const fontSize = small ? 11 : 13;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: toneStyles.backgroundColor,
          paddingHorizontal: paddingSize * 2,
          paddingVertical: paddingSize,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: toneStyles.textColor,
            fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
});

export default PromoBadge;
