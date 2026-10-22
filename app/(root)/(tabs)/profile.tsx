import { AccountListCard } from "@/components/account/AccountUi";
import WorkspaceSwitcherSheet from "@/components/account/WorkspaceSwitcherSheet";
import { AppReviewPrompt } from "@/components/app-review/AppReviewPrompt";
import { MenuItem } from "@/components/MenuItem";
import { formatOrderMoney } from "@/components/orders/OrderUi";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import UserAvatar from "@/components/UserAvatar";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useVendorStore } from "@/stores/vendorStore";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import { rMS, rS, rV } from "@/styles/responsive";
import { normalizeVendorStatus, type AppRole, type VendorStatus } from "@/types/vendor";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAppReview } from "@/hooks/useAppReview";
import { resetAuthStackToSignIn } from "@/utils/authNavigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VendorIdentity = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  roles: AppRole[];
  vendorId?: string | null;
  // Matches VendorSessionContext: the store wants a normalized status or
  // nothing, never a raw string.
  vendorStatus?: VendorStatus;
  vendorRejectionReason?: string | null;
};

/** Maps an auth user onto the identity fields the vendor store expects. */
function toVendorSessionFields(user: VendorIdentity) {
  return {
    userId: user.id,
    fullName: user.full_name,
    email: user.email,
    phoneNumber: user.phone_number,
    roles: user.roles,
    vendorId: user.vendorId,
    vendorStatus: user.vendorStatus,
    vendorRejectionReason: user.vendorRejectionReason,
  };
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const {
    isSigningOut,
    refreshCurrentUser,
    signOut,
    user,
  } = useAuth();
  const { requireAuth } = useRequireAuth();
  const {
    visible: reviewPromptVisible,
    handleRate: handleAppReviewRate,
    handleDismiss: handleAppReviewDismiss,
  } = useAppReview();
  const { session } = useVendorSession();
  const { isApprovedVendor, storeLabel } = useVendorQuickAccess();
  const workspaceMode = useWorkspaceModeStore((state) => state.mode);
  const [workspaceSwitcherVisible, setWorkspaceSwitcherVisible] = useState(false);
  const { refreshVendorState, vendorApplication, vendorStatus } = useVendorStore();
  const { account: loyaltyAccount } = useLoyalty();
  const hasRefreshedThisFocusRef = useRef(false);
  const authUserSnapshot = useMemo(
    () =>
      user
        ? {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            phoneNumber: user.phone_number,
            roles: user.roles,
            rolesKey: user.roles.join(","),
            vendorId: user.vendorId,
            vendorStatus: user.vendorStatus,
            vendorRejectionReason: user.vendorRejectionReason,
          }
        : null,
    [user],
  );
  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          resetAuthStackToSignIn(router);
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;
      hasRefreshedThisFocusRef.current = false;

      const syncVendorState = async () => {
        if (!authUserSnapshot?.id || hasRefreshedThisFocusRef.current) {
          return;
        }

        hasRefreshedThisFocusRef.current = true;
        const shouldRefreshAuthUser =
          authUserSnapshot.vendorStatus !== "approved" ||
          !authUserSnapshot.roles.includes("vendor");

        const knownUser = {
          id: authUserSnapshot.id,
          full_name: authUserSnapshot.fullName,
          email: authUserSnapshot.email,
          phone_number: authUserSnapshot.phoneNumber,
          roles: authUserSnapshot.roles,
          vendorId: authUserSnapshot.vendorId,
          vendorStatus: authUserSnapshot.vendorStatus,
          vendorRejectionReason: authUserSnapshot.vendorRejectionReason,
        };

        // Both requests go out together. The vendor fetch only needs identity
        // fields we already hold, so waiting on refreshCurrentUser first was
        // an extra round trip before anything could render — that serial wait
        // is why this section settled visibly later than the rest of the page.
        const [refreshedUser] = await Promise.all([
          shouldRefreshAuthUser ? refreshCurrentUser() : Promise.resolve(null),
          refreshVendorState({
            accessToken: session.accessToken,
            ...toVendorSessionFields(knownUser),
          }),
        ]);

        if (isCancelled || !refreshedUser) {
          return;
        }

        // A role actually changed server-side (an application was approved
        // while the app was open), so re-resolve against the new identity.
        const rolesChanged =
          refreshedUser.roles.join(",") !== authUserSnapshot.rolesKey ||
          refreshedUser.vendorStatus !== authUserSnapshot.vendorStatus;

        if (rolesChanged) {
          await refreshVendorState(
            {
              accessToken: session.accessToken,
              ...toVendorSessionFields(refreshedUser),
            },
            { force: true },
          );
        }
      };

      void syncVendorState();

      return () => {
        isCancelled = true;
        hasRefreshedThisFocusRef.current = false;
      };
    }, [
      authUserSnapshot,
      refreshCurrentUser,
      refreshVendorState,
      session.accessToken,
    ]),
  );

  const resolvedVendorStatus = useMemo(() => {
    if (!user) {
      return vendorStatus;
    }

    const authVendorStatus = normalizeVendorStatus(user.vendorStatus, user.roles);
    return authVendorStatus !== "none" ? authVendorStatus : vendorStatus;
  }, [user, vendorStatus]);

  /**
   * The vendor state as a menu row rather than a standalone card.
   *
   * Every destination the old card reached is still here: the primary row
   * carries the main action, and `secondary` becomes a second row instead of
   * a small text link under a button. A rejection reason is deliberately not
   * inlined — the badge says something needs changing and the review-notes row
   * leads to the full explanation, which is where it already lives.
   */
  const vendorRow = useMemo((): {
    label: string;
    description?: string;
    badge?: { label: string; tone: "success" | "info" | "warning" | "danger" };
    value?: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    onPress: () => void;
    secondary: { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void } | null;
  } => {
    if (resolvedVendorStatus === "approved") {
      return {
        label: "Vendor dashboard",
        description: vendorApplication?.storeName || undefined,
        badge: { label: "Active", tone: "success" },
        icon: "briefcase-outline",
        onPress: () => router.push("/vendor/dashboard" as any),
        secondary: {
          label: "Vendor settings",
          icon: "options-outline",
          onPress: () => router.push("/vendor/settings" as any),
        },
      };
    }

    if (resolvedVendorStatus === "pending" || resolvedVendorStatus === "under_review") {
      return {
        label: "Vendor application",
        badge: { label: "In review", tone: "info" },
        icon: "time-outline",
        onPress: () => router.push("/vendor/application-status" as any),
        secondary: null,
      };
    }

    if (resolvedVendorStatus === "rejected") {
      return {
        label: "Vendor application",
        badge: { label: "Needs changes", tone: "danger" },
        icon: "alert-circle-outline",
        onPress: () => router.push("/vendor/apply" as any),
        secondary: {
          label: "Review notes",
          icon: "document-text-outline",
          onPress: () => router.push("/vendor/application-status" as any),
        },
      };
    }

    if (resolvedVendorStatus === "suspended") {
      return {
        label: "Vendor access",
        badge: { label: "Suspended", tone: "warning" },
        icon: "pause-circle-outline",
        onPress: () => router.push("/vendor/application-status" as any),
        secondary: null,
      };
    }

    return {
      label: "Sell on ODOS",
      description: "Apply once, sell from this account",
      icon: "storefront-outline",
      onPress: () => router.push("/vendor/apply" as any),
      secondary: null,
    };
  }, [resolvedVendorStatus, vendorApplication?.storeName]);

  // Deliberately no loading state. `resolvedVendorStatus` already has a usable
  // answer from the auth user on the first frame, so "Checking..." only
  // replaced a correct label with a placeholder and then changed it back. The
  // background refresh corrects the row in place if the server disagrees.

  /**
   * Rendered for every signed-in user, loaded or not. The backend creates a
   * loyalty account on first read, so one always exists — which means the row
   * can claim its space on the first frame and fill its value in when the
   * request lands, instead of appearing late and pushing the list down.
   */
  const loyaltyRow = useMemo(() => {
    if (!loyaltyAccount) {
      return { value: undefined, description: "Points, tier and rewards" };
    }

    const tier =
      loyaltyAccount.tier_level.charAt(0).toUpperCase() + loyaltyAccount.tier_level.slice(1);

    return {
      value: `${tier} · ${loyaltyAccount.total_points.toLocaleString()} pts`,
      description: `Worth ${formatOrderMoney(loyaltyAccount.points_value_ghs)}`,
    };
  }, [loyaltyAccount]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
          paddingHorizontal: rS(16),
        },
        scroll: {
          flex: 1,
        },
        scrollContent: {
          paddingTop: rV(10),
          paddingBottom: tabBarInset,
        },
        profileEntryCard: {
          marginBottom: rV(14),
        },
        profileEntryRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(12),
        },
        profileEntryCopy: {
          flex: 1,
          minWidth: 0,
        },
        nameRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          maxWidth: "100%",
        },
        namePressable: {
          flexShrink: 1,
        },
        profileEntryHint: {
          marginTop: rV(4),
          fontSize: rMS(11.5),
          fontFamily: Fonts.title,
          color: colors.primary,
        },
        modeHint: {
          marginTop: rV(2),
          fontSize: rMS(11),
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        avatarWrap: {
          marginRight: rS(12),
        },
        name: {
          fontSize: rMS(16),
          fontFamily: Fonts.titleBold,
          color: colors.text,
          flexShrink: 1,
        },
        email: {
          fontSize: rMS(13),
          color: colors.textMuted,
          marginTop: rMS(2),
          fontFamily: Fonts.text,
        },
        sectionTitle: {
          fontSize: rMS(14),
          color: colors.textMuted,
          marginTop: rMS(20),
          marginBottom: rMS(14),
          marginLeft: rMS(4),
          fontFamily: Fonts.textBold,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        },
        menuCard: {
          marginBottom: rV(20),
        },
        logoutWrap: {
          marginTop: rV(8),
          marginBottom: rV(24),
        },
      }),
    [colors, tabBarInset],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <AccountListCard style={styles.profileEntryCard}>
        <View style={styles.profileEntryRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.9}
            onPress={() => {
              if (user) {
                router.push("../screens/profileScreens/CustomerProfile" as any);
                return;
              }
              requireAuth({
                title: "Sign in to manage your profile",
                message:
                  "Create an account or log in to update your personal details and preferences.",
              });
            }}
          >
            <UserAvatar
              avatarUrl={user?.avatar_url}
              gender={user?.gender}
              size={rS(56)}
              bordered
            />
          </TouchableOpacity>
          <View style={styles.profileEntryCopy}>
            {isApprovedVendor ? (
              <TouchableOpacity
                style={styles.namePressable}
                activeOpacity={0.75}
                onPress={() => setWorkspaceSwitcherVisible(true)}
              >
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {workspaceMode === "sell_only"
                      ? storeLabel
                      : user?.full_name || "ODOS User"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={rMS(18)}
                    color={colors.text}
                  />
                </View>
                <Text style={styles.email}>
                  {user?.email || "Sign in to view account details"}
                </Text>
                <Text style={styles.modeHint}>
                  {workspaceMode === "sell_only"
                    ? "Seller mode · tap to switch"
                    : "Shopping mode · tap to switch"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  if (user) {
                    router.push("../screens/profileScreens/CustomerProfile" as any);
                    return;
                  }
                  requireAuth({
                    title: "Sign in to manage your profile",
                    message:
                      "Create an account or log in to update your personal details and preferences.",
                  });
                }}
              >
                <Text style={styles.name} numberOfLines={1}>
                  {user ? user.full_name || "ODOS User" : "Guest"}
                </Text>
                <Text style={styles.email}>
                  {user?.email || "Sign in to view account details"}
                </Text>
                <Text style={styles.profileEntryHint}>
                  {user ? "Tap to edit your profile" : "Tap to sign in"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (user) {
                router.push("../screens/profileScreens/CustomerProfile" as any);
                return;
              }
              requireAuth({
                title: "Sign in to manage your profile",
                message:
                  "Create an account or log in to update your personal details and preferences.",
              });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={rMS(22)} color={colors.iconMuted} />
          </TouchableOpacity>
        </View>
      </AccountListCard>

      {user ? (
        <>
          <Text style={styles.sectionTitle}>
            {workspaceMode === "sell_only" ? "Business" : "Account"}
          </Text>
          <AccountListCard style={styles.menuCard}>
            {workspaceMode === "sell_only" ? (
              <>
                <MenuItem
                  icon="analytics-outline"
                  label="Analytics"
                  onPress={() => {
                    router.push("/vendor/analytics" as any);
                  }}
                />
                <MenuItem
                  icon="wallet-outline"
                  label="Wallet & payouts"
                  onPress={() => {
                    router.push("/vendor/wallet" as any);
                  }}
                />
                <MenuItem
                  icon="chatbubble-outline"
                  label="Messages"
                  onPress={() => {
                    router.push("/vendor/chats" as any);
                  }}
                />
                <MenuItem
                  icon="people-outline"
                  label="Customers"
                  onPress={() => {
                    router.push("/vendor/customers" as any);
                  }}
                />
                <MenuItem
                  icon="star-outline"
                  label="Reviews"
                  onPress={() => {
                    router.push("/vendor/reviews" as any);
                  }}
                />
                <MenuItem
                  icon="return-up-back-outline"
                  label="Returns"
                  onPress={() => {
                    router.push("/vendor/returns" as any);
                  }}
                />
                <MenuItem
                  icon="ticket-outline"
                  label="Vouchers"
                  onPress={() => {
                    router.push("/vendor/vouchers" as any);
                  }}
                />
                <MenuItem
                  icon="megaphone-outline"
                  label="Campaigns"
                  onPress={() => {
                    router.push("/vendor/campaigns" as any);
                  }}
                />
                <MenuItem
                  icon="storefront-outline"
                  label="Store profile"
                  onPress={() => {
                    router.push("/vendor/store" as any);
                  }}
                />
                <MenuItem
                  icon="settings-outline"
                  label="Seller settings"
                  onPress={() => {
                    router.push("/vendor/settings" as any);
                  }}
                />
              </>
            ) : (
              <>
                <MenuItem
                  icon="receipt-outline"
                  label="Orders"
                  onPress={() => {
                    router.push("../screens/profileScreens/orders" as any);
                  }}
                />
                <MenuItem
                  icon="return-up-back-outline"
                  label="Returns"
                  onPress={() => {
                    router.push("../screens/profileScreens/Account/Returns" as any);
                  }}
                />
                <MenuItem
                  icon="location-outline"
                  label="Addresses"
                  onPress={() => {
                    router.push("../screens/profileScreens/Account/Addresses" as any);
                  }}
                />
                <MenuItem
                  icon="chatbubble-outline"
                  label="Chats"
                  onPress={() => {
                    router.push("../screens/profileScreens/Account/Chats" as any);
                  }}
                />
                <MenuItem
                  icon="wallet-outline"
                  label="Wallet & Payment"
                  onPress={() => {
                    router.push("../screens/profileScreens/Account/Wallet" as any);
                  }}
                />
                <MenuItem
                  icon="star-outline"
                  label="Reviews"
                  onPress={() => {
                    router.push("../screens/profileScreens/Account/Reviews" as any);
                  }}
                />
                <MenuItem
                  icon="ticket-outline"
                  label="Vouchers"
                  onPress={() => {
                    router.push("../screens/profileScreens/Account/Vouchers" as any);
                  }}
                />
                <MenuItem
                  icon="medal-outline"
                  label="Loyalty"
                  value={loyaltyRow.value}
                  description={loyaltyRow.description}
                  onPress={() => {
                    router.push("../screens/loyalty" as any);
                  }}
                />
              </>
            )}
          </AccountListCard>

          <Text style={styles.sectionTitle}>Selling</Text>
          <AccountListCard style={styles.menuCard}>
            <MenuItem
              icon={vendorRow.icon}
              label={vendorRow.label}
              description={vendorRow.description}
              value={vendorRow.value}
              badge={vendorRow.badge}
              onPress={vendorRow.onPress}
            />
            {vendorRow.secondary && workspaceMode !== "sell_only" ? (
              <MenuItem
                icon={vendorRow.secondary.icon}
                label={vendorRow.secondary.label}
                onPress={vendorRow.secondary.onPress}
              />
            ) : null}
          </AccountListCard>

          {workspaceMode === "sell_only" ? null : (
            <>
          <Text style={styles.sectionTitle}>Personalization</Text>
          <AccountListCard style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Activity"
              onPress={() => {
                router.push("../screens/Notification" as any);
              }}
            />
            <MenuItem
              icon="options-outline"
              label="Notification Settings"
              onPress={() => {
                router.push(
                  "../screens/profileScreens/personalization/Notification" as any,
                );
              }}
            />
            <MenuItem
              icon="sparkles-outline"
              label="Preferences"
              onPress={() => {
                router.push(
                  "../screens/profileScreens/personalization/Preferences" as any,
                );
              }}
            />
            <MenuItem
              icon="language-outline"
              label="Language"
              onPress={() => {
                router.push(
                  "../screens/profileScreens/personalization/Language" as any,
                );
              }}
            />
          </AccountListCard>
            </>
          )}
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Help & Support</Text>
      <AccountListCard style={styles.menuCard}>
        <MenuItem
          icon="sparkles-outline"
          label="ODOS Assistant"
          onPress={() => {
            router.push("../screens/assistant" as any);
          }}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Get Help"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/GetHelp");
          }}
        />
        <MenuItem
          icon="document-text-outline"
          label="Legal & Policy"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/LegalPolicy");
          }}
        />
        <MenuItem
          icon="library-outline"
          label="Resources"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/Resources");
          }}
        />
        <MenuItem
          icon="help-outline"
          label="FAQ"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/FAQ");
          }}
        />
      </AccountListCard>

      {user ? (
        <AccountListCard style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label={isSigningOut ? "Logging out..." : "Log out"}
            onPress={handleLogout}
            textColor={colors.dangerText}
          />
          {/*
            Required by App Store Guideline 5.1.1(v): an app that creates
            accounts must offer deletion from inside it. Placed under Log out
            because both end a session, and separated onto its own screen
            because this one cannot be undone.
          */}
          <MenuItem
            icon="trash-outline"
            label="Delete account"
            onPress={() =>
              router.push("/(root)/screens/profileScreens/Account/DeleteAccount")
            }
            textColor={colors.dangerText}
          />
        </AccountListCard>
      ) : null}
      </ScrollView>
      <WorkspaceSwitcherSheet
        visible={workspaceSwitcherVisible}
        onClose={() => setWorkspaceSwitcherVisible(false)}
      />
      <AppReviewPrompt
        visible={reviewPromptVisible}
        onRate={() => void handleAppReviewRate()}
        onDismiss={() => void handleAppReviewDismiss()}
      />
    </SafeAreaView>
  );
}
