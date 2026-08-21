import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useVendorInventory } from '@/hooks/useVendorInventory';
import type { InventoryProduct, LowStockAlert } from '@/hooks/useVendorInventory';

interface Props {
  storeId: string;
}

export function InventoryDashboard({ storeId }: Props) {
  const { colors } = useTheme();
  const {
    products,
    stats,
    alerts,
    loading,
    fetchInventory,
    fetchAlerts,
    updateStock,
  } = useVendorInventory(storeId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState('');

  const handleRefresh = async () => {
    await fetchInventory(0, 50, searchQuery, filterStatus);
    await fetchAlerts();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleUpdateStock = async (productId: string) => {
    const newStock = parseInt(editingStock, 10);
    if (isNaN(newStock)) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }

    const success = await updateStock(productId, newStock);
    if (success) {
      setEditingProductId(null);
      setEditingStock('');
      Alert.alert('Success', 'Stock updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const getStatCard = (
    label: string,
    value: number | string,
    icon: string,
    color: string
  ) => (
    <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
      <View style={[styles.statIconBg, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#fff" />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>
          {label}
        </Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.screen }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsGrid}>
          {getStatCard(
            'Total Products',
            stats.total_products,
            'cube-outline',
            '#3B82F6'
          )}
          {getStatCard(
            'In Stock',
            stats.active_products,
            'checkmark-circle-outline',
            '#10B981'
          )}
          {getStatCard(
            'Low Stock',
            stats.low_stock,
            'warning-outline',
            '#F59E0B'
          )}
          {getStatCard(
            'Out of Stock',
            stats.out_of_stock,
            'close-circle-outline',
            '#EF4444'
          )}
          {getStatCard(
            'Stock Value',
            `GHS ${stats.total_stock_value.toFixed(2)}`,
            'wallet-outline',
            '#8B5CF6'
          )}
          {getStatCard(
            'Avg Price',
            `GHS ${stats.avg_price.toFixed(2)}`,
            'pricetag-outline',
            '#EC4899'
          )}
        </View>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Low Stock Alerts
          </Text>
          {alerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: colors.secondary,
                  borderLeftColor:
                    alert.status === 'critical' ? '#EF4444' : '#F59E0B',
                },
              ]}
            >
              <View style={styles.alertContent}>
                <Text
                  style={[styles.alertTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {alert.title}
                </Text>
                <Text style={[styles.alertStock, { color: colors.textMuted }]}>
                  Stock: {alert.stock} ({alert.status})
                </Text>
              </View>
              <View
                style={[
                  styles.alertBadge,
                  {
                    backgroundColor:
                      alert.status === 'critical' ? '#FEE2E2' : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={{
                    color: alert.status === 'critical' ? '#DC2626' : '#D97706',
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  {alert.stock}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: colors.secondary }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterButtons}>
          {['active', 'inactive'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterBtn,
                {
                  backgroundColor:
                    filterStatus === status ? colors.primary : colors.secondary,
                },
              ]}
              onPress={() =>
                setFilterStatus(filterStatus === status ? undefined : status)
              }
            >
              <Text
                style={[
                  styles.filterBtnText,
                  {
                    color:
                      filterStatus === status ? '#fff' : colors.textMuted,
                  },
                ]}
              >
                {status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Products List */}
      <View style={styles.productsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Products
        </Text>
        {products.map((product) => (
          <View
            key={product.id}
            style={[
              styles.productCard,
              {
                backgroundColor: colors.secondary,
                borderLeftColor: product.low_stock
                  ? '#F59E0B'
                  : colors.primary,
              },
            ]}
          >
            <View style={styles.productInfo}>
              <Text
                style={[styles.productTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {product.title}
              </Text>
              {product.sku && (
                <Text
                  style={[styles.productSku, { color: colors.textMuted }]}
                >
                  SKU: {product.sku}
                </Text>
              )}
              <View style={styles.productMeta}>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  GHS {product.price.toFixed(2)}
                </Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {product.views} views · {product.sales} sales
                </Text>
              </View>
            </View>

            {editingProductId === product.id ? (
              <View style={styles.editSection}>
                <TextInput
                  style={[
                    styles.stockInput,
                    { borderColor: colors.primary, color: colors.text },
                  ]}
                  placeholder="New stock"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={editingStock}
                  onChangeText={setEditingStock}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleUpdateStock(product.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.editBtn,
                      { backgroundColor: colors.textMuted },
                    ]}
                    onPress={() => {
                      setEditingProductId(null);
                      setEditingStock('');
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.stockSection}>
                <View
                  style={[
                    styles.stockBadge,
                    {
                      backgroundColor: product.low_stock ? '#FEE2E2' : '#DBEAFE',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: product.low_stock ? '#DC2626' : '#0284C7',
                      fontWeight: '600',
                      fontSize: 12,
                    }}
                  >
                    {product.stock} in stock
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.editIconBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setEditingProductId(product.id);
                    setEditingStock(product.stock.toString());
                  }}
                >
                  <Ionicons name="pencil" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  alertsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertStock: {
    fontSize: 12,
    marginTop: 4,
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  productSku: {
    fontSize: 11,
    marginTop: 4,
  },
  productMeta: {
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    width: 70,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
