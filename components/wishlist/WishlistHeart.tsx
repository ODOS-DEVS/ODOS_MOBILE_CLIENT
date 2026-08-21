import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { router } from 'expo-router';
import type { WishlistItem } from '@/hooks/useWishlist';

interface Props {
  productId: string;
  isInWishlist: boolean;
  onToggle: (productId: string, productData?: Partial<WishlistItem>) => Promise<boolean>;
  loading?: boolean;
  productData?: Partial<WishlistItem>;
  size?: number;
}

export function WishlistHeart({
  productId,
  isInWishlist,
  onToggle,
  loading = false,
  productData,
  size = 24,
}: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handlePress = async () => {
    if (!user) {
      showToast('Sign in to save items to wishlist', 'info');
      router.push('/(root)/(auth)/signin');
      return;
    }

    try {
      const success = await onToggle(productId, productData);
      if (success) {
        const action = isInWishlist ? 'Removed from' : 'Added to';
        showToast(`${action} wishlist`, isInWishlist ? 'info' : 'success');
      } else {
        showToast('Failed to update wishlist', 'error');
      }
    } catch (error) {
      showToast('Error updating wishlist', 'error');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: colors.card }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons
          name={isInWishlist ? 'heart' : 'heart-outline'}
          size={size}
          color={isInWishlist ? '#FF6B6B' : colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
