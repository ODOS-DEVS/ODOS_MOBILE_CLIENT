import { AccountActionButton, AccountFormField, AccountListCard } from "@/components/account/AccountUi";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch, apiJson, formatApiDetail } from "@/services/apiClient";
import { rMS, rS, rV } from "@/styles/responsive";
import { resetAuthStackToSignIn } from "@/utils/authNavigation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Eligibility = {
  can_delete: boolean;
  blockers: string[];
  requires_password: boolean;
};

/**
 * Deleting your own account.
 *
 * Required by App Store Guideline 5.1.1(v), but the shape of this screen comes
 * from what deletion actually means on a marketplace rather than from the
 * guideline. Two things are load-bearing:
 *
 * The reasons deletion is refused are fetched and shown *before* the person
 * commits to anything. Being told "you have an order in progress" after typing
 * your password is a worse experience than being told at the start, and the
 * server returns every reason at once so they can all be listed.
 *
 * What survives deletion is stated plainly. Orders and receipts stay, because
 * they are a vendor's sales record too, and it is better to say so than to let
 * someone discover it later.
 */
export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { accessToken, signOut } = useAuth();
  const { showToast } = useToast();

  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kept free of setState so the effect below does not set state synchronously,
  // which schedules a second render before the first has committed.
  const fetchEligibility = useCallback(async (): Promise<Eligibility | null> => {
    if (!accessToken) return null;
    try {
      return await apiJson<Eligibility>("/account/deletion-eligibility", { accessToken });
    } catch (err) {
      showToast(formatApiDetail(err, "Could not check your account. Try again."), "error");
      return null;
    }
  }, [accessToken, showToast]);

  useEffect(() => {
    let cancelled = false;
    void fetchEligibility().then((data) => {
      if (cancelled) return;
      if (data) setEligibility(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchEligibility]);

  const recheck = useCallback(async () => {
    const data = await fetchEligibility();
    if (data) setEligibility(data);
  }, [fetchEligibility]);

  // Typing the word is deliberate friction. This cannot be undone, and a
  // mis-tap on a red button should not be enough to trigger it.
  const confirmed = confirmText.trim().toUpperCase() === "DELETE";
  const passwordReady = !eligibility?.requires_password || password.length > 0;
  const canSubmit = Boolean(eligibility?.can_delete) && confirmed && passwordReady && !submitting;

  const handleDelete = useCallback(async () => {
    if (!canSubmit || !accessToken) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/account", {
        method: "DELETE",
        accessToken,
        json: { password: eligibility?.requires_password ? password : null },
      });
      // Sign out locally before navigating: the token is dead server-side now,
      // and any screen that refetches on focus would fail noisily otherwise.
      await signOut();
      showToast("Your account has been deleted.", "success");
      resetAuthStackToSignIn(router);
    } catch (err) {
      setError(formatApiDetail(err, "Could not delete your account. Try again."));
      setSubmitting(false);
    }
  }, [accessToken, canSubmit, eligibility, password, router, showToast, signOut]);

  const styles = StyleSheet.create({
    body: { padding: rS(16), gap: rV(14), paddingBottom: rV(40) },
    lead: { fontSize: rMS(14), lineHeight: rMS(21), color: colors.textMuted },
    card: { padding: rS(14), gap: rV(10) },
    cardTitle: { fontSize: rMS(14), fontWeight: "700", color: colors.text },
    row: { flexDirection: "row", gap: rS(9), alignItems: "flex-start" },
    rowText: { flex: 1, fontSize: rMS(13), lineHeight: rMS(19), color: colors.textMuted },
    blocker: { flex: 1, fontSize: rMS(13), lineHeight: rMS(19), color: colors.text },
    errorText: { fontSize: rMS(13), color: colors.dangerText, lineHeight: rMS(19) },
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <ProfileHeader title="Delete account" />
        <ScreenLoader />
      </View>
    );
  }

  const blocked = eligibility ? !eligibility.can_delete : false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <ProfileHeader title="Delete account" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {blocked ? (
          <>
            <Text style={styles.lead}>
              Your account can&apos;t be deleted just yet. Here&apos;s what&apos;s outstanding:
            </Text>
            <AccountListCard style={styles.card}>
              {eligibility?.blockers.map((reason) => (
                <View key={reason} style={styles.row}>
                  <Ionicons name="alert-circle-outline" size={rMS(18)} color={colors.dangerText} />
                  <Text style={styles.blocker}>{reason}</Text>
                </View>
              ))}
            </AccountListCard>
            <AccountActionButton
              label="Check again"
              icon="refresh-outline"
              variant="secondary"
              onPress={() => void recheck()}
            />
          </>
        ) : (
          <>
            <Text style={styles.lead}>
              This permanently removes your personal information and signs you out everywhere.
              It can&apos;t be undone.
            </Text>

            <AccountListCard style={styles.card}>
              <Text style={styles.cardTitle}>What gets removed</Text>
              {[
                "Your name, email, phone number and photo",
                "Saved addresses and payment methods",
                "Your cart, wishlist and browsing history",
              ].map((line) => (
                <View key={line} style={styles.row}>
                  <Ionicons name="close-circle-outline" size={rMS(17)} color={colors.dangerText} />
                  <Text style={styles.rowText}>{line}</Text>
                </View>
              ))}
            </AccountListCard>

            <AccountListCard style={styles.card}>
              <Text style={styles.cardTitle}>What stays</Text>
              {[
                "Past orders and receipts, with your name removed",
                "Reviews you left, shown without your name",
              ].map((line) => (
                <View key={line} style={styles.row}>
                  <Ionicons name="receipt-outline" size={rMS(17)} color={colors.textMuted} />
                  <Text style={styles.rowText}>{line}</Text>
                </View>
              ))}
              <Text style={styles.rowText}>
                Orders are kept because they&apos;re also the seller&apos;s record of the sale and
                are needed for tax. They no longer point to you.
              </Text>
            </AccountListCard>

            {eligibility?.requires_password ? (
              <AccountFormField
                label="Confirm your password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                placeholder="Your password"
              />
            ) : null}

            <AccountFormField
              label='Type DELETE to confirm'
              icon="create-outline"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="DELETE"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AccountActionButton
              label={submitting ? "Deleting..." : "Delete my account"}
              icon="trash-outline"
              variant="danger"
              disabled={!canSubmit}
              onPress={() => void handleDelete()}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
