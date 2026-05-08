import { MenuItem } from "@/components/MenuItem";
import UserAvatar from "@/components/UserAvatar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
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
  const {
    isRefreshingSession,
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

  const isVendorSectionLoading = !user
    ? false
    : isRefreshingSession || (isLoading && resolvedVendorStatus === "none");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: rV(10),
          paddingBottom: 90,
        }}
      >
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          openProtectedRoute(
            "../screens/profileScreens/CustomerProfile",
            "Sign in to manage your profile",
            "Create an account or log in to update your personal details and preferences.",
          );
        }}
      >
        <View
          className="bg-white rounded-3xl mb-5 shadow-sm"
          style={styles.header}
        >
          <View style={styles.subHeader}>
            <UserAvatar avatarUrl={user?.avatar_url} size={rS(50)} style={styles.avatar} />
            <View>
              <Text style={styles.name}>{user?.full_name || "ODOS User"}</Text>
              <Text style={styles.email}>
                {user?.email || "Sign in to view account details"}
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#111" />
        </View>
      </TouchableOpacity>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View className="bg-white rounded-3xl mb-5 shadow-sm">
        <MenuItem
          icon="receipt-outline"
          label="Orders"
          onPress={() => {
            openProtectedRoute("../screens/profileScreens/orders");
          }}
        />
        <MenuItem icon="return-up-back-outline" label="Returns" />
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
      </View>

      <Text style={styles.sectionTitle}>Vendor</Text>
      <View style={styles.vendorCard}>
        <View style={styles.vendorCardHeader}>
          <View style={styles.vendorIconWrap}>
            <Ionicons name="briefcase-outline" size={rMS(18)} color={AppColors.text} />
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

      {/* Personalization */}
      <Text style={styles.sectionTitle}>Personalization</Text>
      <View className="bg-white rounded-3xl mb-5 shadow-sm">
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
      </View>

      {/* Help & Support */}
      <Text style={styles.sectionTitle}>Help & Support</Text>
      <View className="bg-white rounded-3xl mb-5 shadow-sm">
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
      </View>

      {user ? (
        <View className="bg-white rounded-3xl mb-5 shadow-sm">
          <MenuItem
            icon="log-out-outline"
            label={isSigningOut ? "Logging out..." : "Log out"}
            onPress={handleLogout}
            textColor="#E53935"
          />
        </View>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: rS(16),
  },
  scroll: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: rMS(16),
    marginTop: rV(8),
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: rS(50),
    height: rV(50),
    borderRadius: rMS(30),
    marginRight: rS(12),
  },

  name: {
    fontSize: rMS(16),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },

  email: {
    fontSize: rMS(13),
    color: AppColors.subtext[100],
    marginTop: rMS(2),
    fontFamily: Fonts.text,
  },

  sectionTitle: {
    fontSize: rMS(14),
    color: AppColors.secondary,
    marginTop: rMS(20),
    marginBottom: rMS(14),
    marginLeft: rMS(4),
    fontFamily: Fonts.textBold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  vendorCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    padding: rMS(16),
    marginBottom: rV(18),
  },
  vendorCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  vendorIconWrap: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },
  vendorTextWrap: {
    flex: 1,
  },
  vendorTitle: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  vendorBody: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  vendorButton: {
    marginTop: rV(16),
    backgroundColor: AppColors.primary,
    borderRadius: rMS(999),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(14),
  },
  vendorButtonLabel: {
    color: AppColors.white,
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
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
});
