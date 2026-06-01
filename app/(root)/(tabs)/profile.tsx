import { AccountListCard } from "@/components/account/AccountUi";
import { MenuItem } from "@/components/MenuItem";
import UserAvatar from "@/components/UserAvatar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useVendorStore } from "@/stores/vendorStore";
import { rMS, rS, rV } from "@/styles/responsive";
import { normalizeVendorStatus } from "@/types/vendor";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const {
    isSigningOut,
    refreshCurrentUser,
    signOut,
    user,
  } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { session } = useVendorSession();
  const { isLoading, refreshVendorState, vendorApplication, vendorStatus } =
    useVendorStore();
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
  const openProtectedRoute = useCallback(
    (
      pathname: string,
      title = "Sign in to continue",
      message = "Log in or create an account to access your account features.",
    ) => {
      if (!requireAuth({ title, message })) {
        return;
      }

      router.push(pathname as any);
    },
    [requireAuth],
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
          router.replace("/(root)/(tabs)");
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

        const refreshedUser = shouldRefreshAuthUser
          ? await refreshCurrentUser()
          : null;
        if (isCancelled) {
          return;
        }

        const nextUser =
          refreshedUser ??
          {
            id: authUserSnapshot.id,
            full_name: authUserSnapshot.fullName,
            email: authUserSnapshot.email,
            phone_number: authUserSnapshot.phoneNumber,
            roles: authUserSnapshot.roles,
            vendorId: authUserSnapshot.vendorId,
            vendorStatus: authUserSnapshot.vendorStatus,
            vendorRejectionReason: authUserSnapshot.vendorRejectionReason,
          };
        await refreshVendorState({
          accessToken: session.accessToken,
          userId: nextUser.id,
          fullName: nextUser.full_name,
          email: nextUser.email,
          phoneNumber: nextUser.phone_number,
          roles: nextUser.roles,
          vendorId: nextUser.vendorId,
          vendorStatus: nextUser.vendorStatus,
          vendorRejectionReason: nextUser.vendorRejectionReason,
        });
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

  const vendorSection = useMemo(() => {
    if (!user) {
      return {
        title: "Become a Vendor",
        body: "Apply once and manage your store from the same ODOS account after approval.",
        cta: "Apply to Become a Vendor",
        onPress: () =>
          openProtectedRoute(
            "/vendor/apply" as any,
            "Sign in to become a vendor",
            "Create an account or log in before starting a vendor application.",
          ),
        secondaryAction: null as null | { label: string; onPress: () => void },
      };
    }

    if (resolvedVendorStatus === "approved") {
      return {
        title: "Vendor Dashboard",
        body:
          vendorApplication?.storeName
            ? `${vendorApplication.storeName} is ready for vendor management.`
            : "Your vendor access is active and ready to manage products, orders, and store details.",
        cta: "Open Vendor Dashboard",
        onPress: () => router.push("/vendor/dashboard" as any),
        secondaryAction: {
          label: "Vendor Settings",
          onPress: () => router.push("/vendor/settings" as any),
        },
      };
    }

    if (
      resolvedVendorStatus === "pending" ||
      resolvedVendorStatus === "under_review"
    ) {
      return {
        title: "Vendor Application Pending",
        body: "Your application is in review. You can track progress and next steps from the status screen.",
        cta: "View Application Status",
        onPress: () => router.push("/vendor/application-status" as any),
        secondaryAction: null,
      };
    }

    if (resolvedVendorStatus === "rejected") {
      return {
        title: "Vendor Application Needs Changes",
        body:
          vendorApplication?.rejectionReason ||
          "ODOS needs a few updates before approval. Review the status details and apply again when ready.",
        cta: "Apply Again",
        onPress: () => router.push("/vendor/apply" as any),
        secondaryAction: {
          label: "View Review Notes",
          onPress: () => router.push("/vendor/application-status" as any),
        },
      };
    }

    if (resolvedVendorStatus === "suspended") {
      return {
        title: "Vendor Access Suspended",
        body: "Your vendor profile exists, but storefront actions are currently paused pending review.",
        cta: "View Status Details",
        onPress: () => router.push("/vendor/application-status" as any),
        secondaryAction: null,
      };
    }

    return {
      title: "Become a Vendor",
      body: "Apply once and manage your store from the same ODOS account after approval.",
      cta: "Apply to Become a Vendor",
      onPress: () => router.push("/vendor/apply" as any),
      secondaryAction: null,
    };
  }, [
    openProtectedRoute,
    resolvedVendorStatus,
    user,
    vendorApplication?.rejectionReason,
    vendorApplication?.storeName,
  ]);

  const hasResolvedVendorState = Boolean(
    user &&
      (vendorApplication ||
        resolvedVendorStatus === "approved" ||
        resolvedVendorStatus === "pending" ||
        resolvedVendorStatus === "under_review" ||
        resolvedVendorStatus === "rejected" ||
        resolvedVendorStatus === "suspended"),
  );
  const isVendorSectionLoading = Boolean(user) && isLoading && !hasResolvedVendorState;

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
          paddingBottom: 90,
        },
        profileEntryCard: {
          marginBottom: rV(14),
        },
        profileEntryRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: rS(10),
        },
        subHeader: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
        },
        profileEntryCopy: {
          flex: 1,
        },
        profileEntryHint: {
          marginTop: rV(4),
          fontSize: rMS(11.5),
          fontFamily: Fonts.title,
          color: colors.primary,
        },
        avatar: {
          width: rS(52),
          height: rS(52),
          borderRadius: rMS(26),
          marginRight: rS(12),
        },
        name: {
          fontSize: rMS(16),
          fontFamily: Fonts.titleBold,
          color: colors.text,
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
        vendorCard: {
          backgroundColor: colors.card,
          borderRadius: rMS(24),
          padding: rMS(16),
          marginBottom: rV(18),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        vendorCardHeader: {
          flexDirection: "row",
          alignItems: "flex-start",
        },
        vendorIconWrap: {
          width: rMS(40),
          height: rMS(40),
          borderRadius: rMS(20),
          backgroundColor: colors.pill,
          alignItems: "center",
          justifyContent: "center",
          marginRight: rS(12),
        },
        vendorTextWrap: {
          flex: 1,
        },
        vendorTitle: {
          color: colors.text,
          fontFamily: Fonts.title,
          fontSize: rMS(15),
        },
        vendorBody: {
          marginTop: rV(6),
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(12.5),
          lineHeight: rMS(18),
        },
        vendorButton: {
          marginTop: rV(16),
          backgroundColor: colors.text,
          borderRadius: rMS(999),
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: rV(14),
        },
        vendorButtonLabel: {
          color: colors.onPrimary,
          fontFamily: Fonts.textBold,
          fontSize: rMS(13),
        },
        vendorSecondaryButton: {
          marginTop: rV(12),
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: rV(6),
        },
        vendorSecondaryButtonLabel: {
          color: colors.primary,
          fontFamily: Fonts.textBold,
          fontSize: rMS(12.5),
        },
        menuCard: {
          marginBottom: rV(20),
        },
        logoutWrap: {
          marginTop: rV(8),
          marginBottom: rV(24),
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          openProtectedRoute(
            "../screens/profileScreens/CustomerProfile",
            "Sign in to manage your profile",
            "Create an account or log in to update your personal details and preferences.",
          );
        }}
      >
        <AccountListCard style={styles.profileEntryCard}>
          <View style={styles.profileEntryRow}>
            <View style={styles.subHeader}>
              <UserAvatar avatarUrl={user?.avatar_url} size={rS(52)} style={styles.avatar} />
              <View style={styles.profileEntryCopy}>
                <Text style={styles.name}>{user?.full_name || "ODOS User"}</Text>
                <Text style={styles.email}>
                  {user?.email || "Sign in to view account details"}
                </Text>
                <Text style={styles.profileEntryHint}>Tap to edit your profile</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={rMS(22)} color={colors.iconMuted} />
          </View>
        </AccountListCard>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Vendor</Text>
      <View style={styles.vendorCard}>
        <View style={styles.vendorCardHeader}>
          <View style={styles.vendorIconWrap}>
            <Ionicons name="briefcase-outline" size={rMS(18)} color={colors.text} />
          </View>
          <View style={styles.vendorTextWrap}>
            <Text style={styles.vendorTitle}>{vendorSection.title}</Text>
            <Text style={styles.vendorBody}>{vendorSection.body}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.vendorButton}
          onPress={vendorSection.onPress}
          activeOpacity={0.85}
          disabled={isVendorSectionLoading}
        >
          <Text style={styles.vendorButtonLabel}>
            {isVendorSectionLoading ? "Loading..." : vendorSection.cta}
          </Text>
        </TouchableOpacity>

        {vendorSection.secondaryAction ? (
          <TouchableOpacity
            onPress={vendorSection.secondaryAction.onPress}
            activeOpacity={0.75}
            style={styles.vendorSecondaryButton}
          >
            <Text style={styles.vendorSecondaryButtonLabel}>
              {vendorSection.secondaryAction.label}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <AccountListCard style={styles.menuCard}>
        <MenuItem
          icon="receipt-outline"
          label="Orders"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/orders");
          }}
        />
        <MenuItem
          icon="return-up-back-outline"
          label="Returns"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/Account/Returns");
          }}
        />
        <MenuItem
          icon="location-outline"
          label="Addresses"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/Account/Addresses");
          }}
        />
        <MenuItem
          icon="chatbubble-outline"
          label="Chats"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/Account/Chats");
          }}
        />
        <MenuItem
          icon="card-outline"
          label="Payment Method"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/Account/Wallet");
          }}
        />
        <MenuItem
          icon="star-outline"
          label="Reviews"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/Account/Reviews");
          }}
        />
        <MenuItem
          icon="ticket-outline"
          label="Vouchers"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/Account/Vouchers");
          }}
        />
      </AccountListCard>

      {/* Personalization */}
      <Text style={styles.sectionTitle}>Personalization</Text>
      <AccountListCard style={styles.menuCard}>
        <MenuItem
          icon="notifications-outline"
          label="Activity"
          onPress={() => {
            openProtectedRoute(
              "../screens/Notification",
              "Sign in to view activity",
              "Log in or create an account to see order updates, milestones, and account activity.",
            );
          }}
        />
        <MenuItem
          icon="options-outline"
          label="Notification Settings"
          onPress={() => {
            openProtectedRoute(
              "../screens/profileScreens/personalization/Notification",
              "Sign in to manage notifications",
              "Log in or create an account to save notification preferences.",
            );
          }}
        />
        <MenuItem
          icon="sparkles-outline"
          label="Preferences"
          onPress={() => {
            openProtectedRoute(
              "../screens/profileScreens/personalization/Preferences",
              "Sign in to manage preferences",
              "Log in or create an account to save your shopping preferences.",
            );
          }}
        />
        <MenuItem
          icon="language-outline"
          label="Language"
          onPress={() => {
            openProtectedRoute(
              "../screens/profileScreens/personalization/Language",
              "Sign in to manage language settings",
              "Log in or create an account to keep your language settings synced.",
            );
          }}
        />
      </AccountListCard>

      {/* Help & Support */}
      <Text style={styles.sectionTitle}>Help & Support</Text>
      <AccountListCard style={styles.menuCard}>
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
            textColor="#E53935"
          />
        </AccountListCard>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
