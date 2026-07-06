import { AccountListCard } from "@/components/account/AccountUi";
import { AppReviewPrompt } from "@/components/app-review/AppReviewPrompt";
import { MenuItem } from "@/components/MenuItem";
import { useTabBarContentInsetFromContext } from "@/components/navigation/TabBarMetricsContext";
import { ProfileCover } from "@/components/profile/ProfileCover";
import UserAvatar from "@/components/UserAvatar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useVendorSession } from "@/hooks/useVendorSession";
import { useVendorStore } from "@/stores/vendorStore";
import { rMS, rS, rV } from "@/styles/responsive";
import { normalizeVendorStatus } from "@/types/vendor";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAppReview } from "@/hooks/useAppReview";
import { resetAuthStackToSignIn } from "@/utils/authNavigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    promptFromProfile,
    handleRate: handleAppReviewRate,
    handleDismiss: handleAppReviewDismiss,
  } = useAppReview();
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
    resolvedVendorStatus,
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
          paddingBottom: tabBarInset,
        },
        profileEntryCard: {
          marginBottom: rV(14),
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: rV(14),
          overflow: "hidden",
        },
        profileEntryHero: {
          position: "relative",
        },
        profileEntryCover: {
          width: "100%",
        },
        profileEntryBody: {
          paddingHorizontal: rS(16),
          paddingTop: rV(8),
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
        avatarWrap: {
          position: "absolute",
          left: rS(16),
          bottom: -rS(24),
          zIndex: 2,
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
      <TouchableOpacity
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
        <AccountListCard style={styles.profileEntryCard}>
          <View style={styles.profileEntryHero}>
            <View style={styles.profileEntryCover}>
              <ProfileCover gender={user?.gender} height={rV(84)} compact />
            </View>
            <View style={styles.avatarWrap}>
              <UserAvatar
                avatarUrl={user?.avatar_url}
                gender={user?.gender}
                size={rS(56)}
                bordered
              />
            </View>
          </View>
          <View style={[styles.profileEntryBody, styles.profileEntryRow]}>
            <View style={styles.subHeader}>
              <View style={{ width: rS(56), marginRight: rS(12) }} />
              <View style={styles.profileEntryCopy}>
                <Text style={styles.name}>
                  {user ? user.full_name || "ODOS User" : "Guest"}
                </Text>
                <Text style={styles.email}>
                  {user?.email || "Sign in to view account details"}
                </Text>
                <Text style={styles.profileEntryHint}>
                  {user ? "Tap to edit your profile" : "Tap to sign in"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={rMS(22)} color={colors.iconMuted} />
          </View>
        </AccountListCard>
      </TouchableOpacity>

      {user ? (
        <>
          <Text style={styles.sectionTitle}>Vendor</Text>
          <View style={styles.vendorCard}>
            <View style={styles.vendorCardHeader}>
              <View style={styles.vendorIconWrap}>
                <Ionicons
                  name="briefcase-outline"
                  size={rMS(18)}
                  color={colors.text}
                />
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

          <Text style={styles.sectionTitle}>Account</Text>
          <AccountListCard style={styles.menuCard}>
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
              icon="card-outline"
              label="Payment Method"
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
          </AccountListCard>

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
        <MenuItem
          icon="star-outline"
          label="Rate ODOS"
          onPress={promptFromProfile}
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
      <AppReviewPrompt
        visible={reviewPromptVisible}
        onRate={() => void handleAppReviewRate()}
        onDismiss={() => void handleAppReviewDismiss()}
      />
    </SafeAreaView>
  );
}
