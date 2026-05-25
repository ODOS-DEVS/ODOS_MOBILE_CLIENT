import PrimaryButton from "@/components/buttons/PrimaryButton";
import TextInputField from "@/components/TextInputField";
import {
  AccountListCard,
  formatVendorCurrency,
  VendorDetailRow,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { VendorEmptyState } from "@/components/vendor/VendorEmptyState";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useRealtime } from "@/context/RealtimeContext";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  createVendorWithdrawal,
  fetchVendorPayoutInstitutions,
  fetchVendorWallet,
  updateVendorPayoutDetails,
} from "@/services/vendorService";
import type {
  VendorPayoutInstitution,
  VendorPayoutDetailsInput,
  VendorWallet,
  VendorWithdrawalStatus,
} from "@/types/vendor";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAYOUT_METHOD_OPTIONS: Array<{
  value: VendorPayoutDetailsInput["payoutMethodType"];
  label: string;
}> = [
  { value: "mobile_money", label: "Mobile money" },
  { value: "bank_transfer", label: "Bank transfer" },
];

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not yet";
  }
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(status: VendorWithdrawalStatus) {
  switch (status) {
    case "approved":
      return {
        backgroundColor: "#DCFCE7",
        textColor: "#166534",
      };
    case "processing":
      return {
        backgroundColor: "#DBEAFE",
        textColor: "#1D4ED8",
      };
    case "paid":
      return {
        backgroundColor: "#DCFCE7",
        textColor: "#166534",
      };
    case "failed":
      return {
        backgroundColor: "#FEE2E2",
        textColor: "#B91C1C",
      };
    case "rejected":
      return {
        backgroundColor: "#FEE2E2",
        textColor: "#B91C1C",
      };
    default:
      return {
        backgroundColor: "#FEF3C7",
        textColor: "#92400E",
      };
  }
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryHelper}>{helper}</Text>
    </View>
  );
}

export default function VendorWalletScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, isTablet, width } = useResponsive();
  const { subscribe } = useRealtime();
  const { showToast } = useToast();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const [wallet, setWallet] = useState<VendorWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutMethodType, setPayoutMethodType] =
    useState<VendorPayoutDetailsInput["payoutMethodType"]>("mobile_money");
  const [payoutAccountName, setPayoutAccountName] = useState("");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutProvider, setPayoutProvider] = useState("");
  const [selectedInstitutionCode, setSelectedInstitutionCode] = useState("");
  const [payoutInstitutions, setPayoutInstitutions] = useState<VendorPayoutInstitution[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalNote, setWithdrawalNote] = useState("");

  const loadWallet = useCallback(async () => {
    if (!hasVendorAccess) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchVendorWallet(session);
      setWallet(result);
      setPayoutMethodType(
        result.payoutMethodType === "bank_transfer"
          ? "bank_transfer"
          : "mobile_money",
      );
      setPayoutAccountName(result.payoutAccountName ?? "");
      setPayoutAccountNumber("");
      setPayoutProvider(result.payoutProvider ?? "");
      setSelectedInstitutionCode("");
    } catch (walletError) {
      setError(
        walletError instanceof Error
          ? walletError.message
          : "We couldn't load your vendor wallet right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasVendorAccess, session]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    let isMounted = true;

    async function loadInstitutions() {
      setIsLoadingInstitutions(true);
      try {
        const result = await fetchVendorPayoutInstitutions(session, payoutMethodType);
        if (!isMounted) {
          return;
        }
        setPayoutInstitutions(result);
      } catch (institutionError) {
        if (!isMounted) {
          return;
        }
        showToast(
          institutionError instanceof Error
            ? institutionError.message
            : "We couldn't load payout institutions right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingInstitutions(false);
        }
      }
    }

    void loadInstitutions();
    return () => {
      isMounted = false;
    };
  }, [hasVendorAccess, payoutMethodType, session, showToast]);

  useEffect(() => {
    if (!payoutProvider || selectedInstitutionCode) {
      return;
    }
    const match = payoutInstitutions.find(
      (institution) => institution.name === payoutProvider,
    );
    if (match) {
      setSelectedInstitutionCode(match.code);
    }
  }, [payoutInstitutions, payoutProvider, selectedInstitutionCode]);

  useEffect(() => {
    if (!hasVendorAccess) {
      return;
    }

    const unsubscribeWallet = subscribe("vendor.wallet.updated", () => {
      void loadWallet();
    });
    const unsubscribeDashboard = subscribe("vendor.dashboard.updated", () => {
      void loadWallet();
    });

    return () => {
      unsubscribeWallet();
      unsubscribeDashboard();
    };
  }, [hasVendorAccess, loadWallet, subscribe]);

  const walletSummary = useMemo(() => {
    if (!wallet) {
      return null;
    }
    return [
      {
        label: "Available balance",
        value: formatVendorCurrency(wallet.availableBalance, wallet.currency),
        helper: "Ready for withdrawal requests",
      },
      {
        label: "Pending withdrawals",
        value: formatVendorCurrency(wallet.pendingWithdrawalBalance, wallet.currency),
        helper: "Held while ODOS reviews or pays out",
      },
      {
        label: "Lifetime earnings",
        value: formatVendorCurrency(wallet.lifetimeEarnings, wallet.currency),
        helper: "Net vendor earnings settled so far",
      },
      {
        label: "ODOS commission",
        value: formatVendorCurrency(wallet.totalCommission, wallet.currency),
        helper: "Marketplace fee deducted before payout",
      },
    ];
  }, [wallet]);

  const payoutDestination = useMemo(() => {
    if (!wallet?.payoutAccountName || !wallet?.payoutAccountNumberMasked) {
      return "No payout destination saved yet";
    }

    const methodLabel =
      wallet.payoutMethodType === "bank_transfer" ? "Bank transfer" : "Mobile money";
    const providerLabel = wallet.payoutProvider ? ` · ${wallet.payoutProvider}` : "";

    return `${methodLabel}${providerLabel} · ${wallet.payoutAccountNumberMasked}`;
  }, [wallet]);

  const selectedInstitution = useMemo(
    () =>
      payoutInstitutions.find(
        (institution) => institution.code === selectedInstitutionCode,
      ) ?? null,
    [payoutInstitutions, selectedInstitutionCode],
  );

  const filteredInstitutions = useMemo(() => {
    const normalizedQuery = institutionSearch.trim().toLowerCase();
    if (!normalizedQuery) {
      return payoutInstitutions;
    }
    return payoutInstitutions.filter((institution) =>
      `${institution.name} ${institution.code}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [institutionSearch, payoutInstitutions]);

  const useWideLayout = isTablet || width >= 560;

  if (isCheckingVendorAccess || isLoading) {
    return (
      <VendorScreenShell
        title="Vendor Wallet"
        loading
        loadingLabel="Loading your vendor wallet..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  async function handleSavePayoutDetails() {
    if (!payoutAccountName.trim() || !payoutAccountNumber.trim()) {
      showToast("Enter both the payout account name and account number.");
      return;
    }
    if (!selectedInstitutionCode) {
      showToast("Choose the payout provider or bank before saving.");
      return;
    }

    setIsSavingPayout(true);
    try {
      const updated = await updateVendorPayoutDetails(session, {
        payoutMethodType,
        payoutAccountName: payoutAccountName.trim(),
        payoutAccountNumber: payoutAccountNumber.trim(),
        payoutProvider: selectedInstitutionCode,
      });
      setWallet(updated);
      setPayoutAccountNumber("");
      setPayoutProvider(updated.payoutProvider ?? "");
      const matchedInstitution = payoutInstitutions.find(
        (institution) => institution.name === (updated.payoutProvider ?? ""),
      );
      setSelectedInstitutionCode(matchedInstitution?.code ?? selectedInstitutionCode);
      showToast("Payout details updated.");
    } catch (updateError) {
      showToast(
        updateError instanceof Error
          ? updateError.message
          : "We couldn't update your payout details.",
      );
    } finally {
      setIsSavingPayout(false);
    }
  }

  async function handleRequestWithdrawal() {
    const amount = Number(withdrawalAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      showToast("Enter a valid withdrawal amount.");
      return;
    }

    setIsRequestingWithdrawal(true);
    try {
      await createVendorWithdrawal(session, {
        amount,
        note: withdrawalNote.trim() || undefined,
      });
      setWithdrawalAmount("");
      setWithdrawalNote("");
      showToast("Withdrawal request submitted.");
      await loadWallet();
    } catch (withdrawalError) {
      showToast(
        withdrawalError instanceof Error
          ? withdrawalError.message
          : "We couldn't submit that withdrawal.",
      );
    } finally {
      setIsRequestingWithdrawal(false);
    }
  }

  const walletCurrency = wallet?.currency ?? "GHS";

  return (
    <VendorScreenShell title="Vendor Wallet">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          vendorStyles.content,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <VendorPageIntro
            title="Vendor wallet"
            subtitle="Settled earnings land here after ODOS deducts marketplace commission. Withdraw when you are ready for payout review."
            stats={[
              {
                value: formatVendorCurrency(wallet?.availableBalance ?? 0, walletCurrency),
                label: "Available",
              },
              {
                value: formatVendorCurrency(wallet?.totalWithdrawn ?? 0, walletCurrency),
                label: "Withdrawn",
              },
            ]}
            error={error}
          />
          <AccountListCard>
            <VendorDetailRow label="Saved payout route" value={payoutDestination} isLast />
          </AccountListCard>

          {walletSummary ? (
            <View style={styles.summaryGrid}>
              {walletSummary.map((card) => (
                <View
                  key={card.label}
                  style={[
                    styles.summaryCardWrap,
                    useWideLayout && styles.summaryCardWrapWide,
                  ]}
                >
                  <SummaryCard
                    label={card.label}
                    value={card.value}
                    helper={card.helper}
                  />
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.stepsCard}>
            <Text style={styles.sectionEyebrow}>How payouts move</Text>
            <View style={styles.stepsRow}>
              <View style={styles.stepItem}>
                <Text style={styles.stepIndex}>1</Text>
                <Text style={styles.stepTitle}>Orders settle</Text>
                <Text style={styles.stepBody}>
                  Delivered orders move your net earnings into the wallet.
                </Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepIndex}>2</Text>
                <Text style={styles.stepTitle}>Admin reviews</Text>
                <Text style={styles.stepBody}>
                  ODOS approves or rejects the withdrawal request.
                </Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepIndex}>3</Text>
                <Text style={styles.stepTitle}>Payout completes</Text>
                <Text style={styles.stepBody}>
                  The transfer is processed and the request is marked paid.
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.managementGrid, useWideLayout && styles.managementGridWide]}>
            <View style={[styles.sectionCard, styles.gridCard, useWideLayout && styles.gridCardWide]}>
              <Text style={styles.sectionEyebrow}>Withdraw funds</Text>
              <Text style={styles.sectionTitle}>Request a payout</Text>
              <Text style={styles.sectionBody}>
                Submit only what is currently available. The ODOS admin team reviews
                each request, approves it, then marks it paid after the transfer is
                completed.
              </Text>
              <TextInputField
                label="Amount"
                value={withdrawalAmount}
                onChangeText={setWithdrawalAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                helperText={`Available now: ${formatVendorCurrency(
                  wallet?.availableBalance ?? 0,
                  wallet?.currency ?? "GHS",
                )}`}
              />
              <TextInputField
                label="Withdrawal note"
                value={withdrawalNote}
                onChangeText={setWithdrawalNote}
                placeholder="Optional note for the ODOS finance team"
                helperText="Optional. Add context if this request needs special handling."
                multiline
                numberOfLines={4}
              />
              <PrimaryButton
                title={
                  isRequestingWithdrawal
                    ? "Submitting withdrawal..."
                    : "Request withdrawal"
                }
                onPress={handleRequestWithdrawal}
                isLoading={isRequestingWithdrawal}
              />
            </View>

            <View style={[styles.sectionCard, styles.gridCard, useWideLayout && styles.gridCardWide]}>
              <Text style={styles.sectionEyebrow}>Payout destination</Text>
              <Text style={styles.sectionTitle}>Saved payout details</Text>
              <Text style={styles.sectionBody}>
                ODOS uses these details whenever you ask to withdraw from your
                wallet. Update them any time your preferred account changes.
              </Text>

              <View style={styles.segmentRow}>
                {PAYOUT_METHOD_OPTIONS.map((option) => {
                  const isActive = payoutMethodType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.85}
                      style={[
                        styles.segmentButton,
                        isActive && styles.segmentButtonActive,
                      ]}
                      onPress={() => {
                        setPayoutMethodType(option.value);
                        setSelectedInstitutionCode("");
                        setPayoutProvider("");
                        setInstitutionSearch("");
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentButtonLabel,
                          isActive && styles.segmentButtonLabelActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInputField
                label="Account holder name"
                value={payoutAccountName}
                onChangeText={setPayoutAccountName}
                placeholder="Enter the name tied to this payout account"
                helperText="Use the exact name that matches your mobile money or bank account."
              />
              <TextInputField
                label={
                  payoutMethodType === "mobile_money"
                    ? "Mobile money number"
                    : "Bank account number"
                }
                value={payoutAccountNumber}
                onChangeText={setPayoutAccountNumber}
                placeholder={wallet?.payoutAccountNumberMasked ?? "Enter the account number"}
                keyboardType="number-pad"
                helperText={
                  wallet?.payoutAccountNumberMasked
                    ? `Current saved account: ${wallet.payoutAccountNumberMasked}. Re-enter the number only if you want to replace it.`
                    : "This is where ODOS will send your withdrawals."
                }
              />
              <View style={styles.selectorFieldWrap}>
                <Text style={styles.selectorLabel}>
                  {payoutMethodType === "mobile_money"
                    ? "Mobile money network"
                    : "Bank"}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.selectorField}
                  onPress={() => setShowInstitutionSelector(true)}
                >
                  <View style={styles.selectorFieldTextWrap}>
                    <Text style={styles.selectorFieldValue}>
                      {selectedInstitution?.name ||
                        payoutProvider ||
                        (payoutMethodType === "mobile_money"
                          ? "Choose a supported mobile money network"
                          : "Choose a supported bank")}
                    </Text>
                    <Text style={styles.selectorFieldHelper}>
                      Paystack-supported destinations only
                    </Text>
                  </View>
                  {isLoadingInstitutions ? (
                    <ActivityIndicator size="small" color={AppColors.primary} />
                  ) : (
                    <Text style={styles.selectorFieldAction}>Select</Text>
                  )}
                </TouchableOpacity>
              </View>

              <PrimaryButton
                title={isSavingPayout ? "Saving payout details..." : "Save payout details"}
                onPress={handleSavePayoutDetails}
                isLoading={isSavingPayout}
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>Status tracking</Text>
            <Text style={styles.sectionTitle}>Recent withdrawal requests</Text>
            <Text style={styles.sectionBody}>
              Track every withdrawal request from submission through approval,
              payout, or rejection.
            </Text>
            {wallet?.withdrawalRequests.length ? (
              wallet.withdrawalRequests.map((request) => {
                const tone = statusTone(request.status);
                return (
                  <View key={request.id} style={styles.listCard}>
                    <View style={styles.listHeader}>
                      <View style={styles.listTitleWrap}>
                        <Text style={styles.listTitle}>
                          {formatVendorCurrency(request.amount, wallet.currency)}
                        </Text>
                        <Text style={styles.listMeta}>
                          Requested {formatDateTime(request.createdAt)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusChip,
                          { backgroundColor: tone.backgroundColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusChipLabel,
                            { color: tone.textColor },
                          ]}
                        >
                          {request.status.replace(/_/g, " ")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.listMeta}>
                      {request.payoutAccountName}
                    </Text>
                    <View style={styles.detailChipsRow}>
                      <View style={styles.detailChip}>
                        <Text style={styles.detailChipText}>
                          {request.payoutMethodType.replace(/_/g, " ")}
                        </Text>
                      </View>
                      <View style={styles.detailChip}>
                        <Text style={styles.detailChipText}>
                          {request.payoutAccountNumberMasked}
                        </Text>
                      </View>
                      {request.payoutProvider ? (
                        <View style={styles.detailChip}>
                          <Text style={styles.detailChipText}>{request.payoutProvider}</Text>
                        </View>
                      ) : null}
                    </View>
                    {request.note ? (
                      <Text style={styles.listNote}>Vendor note: {request.note}</Text>
                    ) : null}
                    {request.adminNote ? (
                      <Text style={styles.listNote}>
                        ODOS note: {request.adminNote}
                      </Text>
                    ) : null}
                    {request.transferFailureReason ? (
                      <Text style={styles.listNote}>
                        Transfer issue: {request.transferFailureReason}
                      </Text>
                    ) : null}
                    {request.transferInitiatedAt ? (
                      <Text style={styles.listMeta}>
                        Transfer started {formatDateTime(request.transferInitiatedAt)}
                      </Text>
                    ) : null}
                    {request.paidAt ? (
                      <Text style={styles.listMeta}>
                        Paid on {formatDateTime(request.paidAt)}
                      </Text>
                    ) : null}
                    {request.reviewedByName ? (
                      <Text style={styles.listMeta}>
                        Reviewed by {request.reviewedByName}
                      </Text>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <VendorEmptyState
                icon="cash-outline"
                title="No withdrawal requests yet"
                message="Your payout requests will appear here with status updates from the ODOS admin team."
              />
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>Settlement ledger</Text>
            <Text style={styles.sectionTitle}>Recent wallet activity</Text>
            <Text style={styles.sectionBody}>
              This ledger shows when ODOS settles sales into your wallet and when
              refunds or withdrawal holds affect your balance.
            </Text>
            {wallet?.recentTransactions.length ? (
              wallet.recentTransactions.map((transaction) => {
                const isPositive = transaction.amount >= 0;
                return (
                  <View key={transaction.id} style={styles.listCard}>
                    <View style={styles.listHeader}>
                      <View style={styles.listTitleWrap}>
                        <Text style={styles.listTitle}>{transaction.title}</Text>
                        <Text style={styles.listMeta}>
                          {formatDateTime(transaction.createdAt)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          isPositive
                            ? styles.transactionAmountPositive
                            : styles.transactionAmountNegative,
                        ]}
                      >
                        {isPositive ? "+" : ""}
                        {formatVendorCurrency(transaction.amount, wallet.currency)}
                      </Text>
                    </View>
                    <Text style={styles.listMeta}>
                      Balance after:{" "}
                      {formatVendorCurrency(transaction.balanceAfter, wallet.currency)}
                    </Text>
                    <View style={styles.detailChipsRow}>
                      <View style={styles.detailChip}>
                        <Text style={styles.detailChipText}>
                          {transaction.kind.replace(/_/g, " ")}
                        </Text>
                      </View>
                    </View>
                    {transaction.grossAmount !== null &&
                    transaction.grossAmount !== undefined ? (
                      <Text style={styles.listMeta}>
                        Gross: {formatVendorCurrency(transaction.grossAmount, wallet.currency)}
                        {transaction.commissionAmount !== null &&
                        transaction.commissionAmount !== undefined
                          ? ` · Commission: ${formatVendorCurrency(
                              transaction.commissionAmount,
                              wallet.currency,
                            )}`
                          : ""}
                      </Text>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <VendorEmptyState
                icon="wallet-outline"
                title="No wallet activity yet"
                message="Once delivered orders settle, your earnings and payout activity will start showing here."
              />
            )}
          </View>

          <View style={styles.supportCard}>
            <Text style={styles.sectionEyebrow}>Need payout help?</Text>
            <Text style={styles.supportTitle}>Use Admin Support when money needs review</Text>
            <Text style={styles.supportBody}>
              If a withdrawal is delayed, rejected, or a settlement looks wrong, message
              the ODOS admin team from the vendor dashboard support area so finance can
              follow up properly.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showInstitutionSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInstitutionSelector(false)}
      >
        <Pressable
          style={styles.selectorOverlay}
          onPress={() => setShowInstitutionSelector(false)}
        >
          <Pressable style={styles.selectorModal} onPress={() => undefined}>
            <Text style={styles.selectorModalTitle}>
              {payoutMethodType === "mobile_money"
                ? "Choose a mobile money network"
                : "Choose a bank"}
            </Text>
            <Text style={styles.selectorModalBody}>
              ODOS only sends payouts to Paystack-supported destinations.
            </Text>
            <TextInput
              value={institutionSearch}
              onChangeText={setInstitutionSearch}
              placeholder="Search by name"
              placeholderTextColor="#94A3B8"
              style={styles.selectorSearchInput}
            />

            <ScrollView
              style={styles.selectorList}
              contentContainerStyle={styles.selectorListContent}
              keyboardShouldPersistTaps="handled"
            >
              {isLoadingInstitutions ? (
                <Text style={styles.selectorEmptyText}>Loading payout destinations...</Text>
              ) : filteredInstitutions.length ? (
                filteredInstitutions.map((institution) => {
                  const isSelected = selectedInstitutionCode === institution.code;
                  return (
                    <TouchableOpacity
                      key={institution.code}
                      activeOpacity={0.88}
                      style={[
                        styles.selectorOption,
                        isSelected && styles.selectorOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedInstitutionCode(institution.code);
                        setPayoutProvider(institution.name);
                        setShowInstitutionSelector(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectorOptionLabel,
                          isSelected && styles.selectorOptionLabelSelected,
                        ]}
                      >
                        {institution.name}
                      </Text>
                      <Text style={styles.selectorOptionCode}>{institution.code}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.selectorEmptyText}>
                  No payout destinations matched that search.
                </Text>
              )}
            </ScrollView>

            <PrimaryButton
              title="Close"
              onPress={() => setShowInstitutionSelector(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  heroCard: {
    backgroundColor: "#0B1526",
    borderRadius: rMS(30),
    paddingHorizontal: rS(20),
    paddingVertical: rV(20),
    marginBottom: rV(18),
  },
  heroOverline: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroValue: {
    marginTop: rV(10),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
  },
  heroBody: {
    marginTop: rV(8),
    color: "rgba(255,255,255,0.78)",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
    marginTop: rV(16),
  },
  heroMetaCard: {
    flex: 1,
    minWidth: rS(132),
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: rMS(20),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  heroMetaLabel: {
    color: "rgba(255,255,255,0.62)",
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  heroMetaValue: {
    marginTop: rV(7),
    color: AppColors.white,
    fontFamily: Fonts.title,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  errorText: {
    marginBottom: rV(12),
    color: "#B91C1C",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: rS(12),
    marginBottom: rV(18),
  },
  summaryCardWrap: {
    width: "100%",
  },
  summaryCardWrapWide: {
    width: "48.6%",
  },
  summaryCard: {
    width: "100%",
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  summaryLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  summaryValue: {
    marginTop: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  summaryHelper: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    lineHeight: rMS(16),
  },
  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(18),
  },
  stepsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(12),
    marginTop: rV(10),
  },
  stepItem: {
    flex: 1,
    minWidth: rS(130),
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  stepIndex: {
    width: rMS(26),
    height: rMS(26),
    borderRadius: rMS(13),
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#0B1526",
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    lineHeight: rMS(26),
  },
  stepTitle: {
    marginTop: rV(10),
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(13.5),
  },
  stepBody: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    lineHeight: rMS(17),
  },
  sectionCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginBottom: rV(18),
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  sectionEyebrow: {
    color: "#8B5E34",
    fontFamily: Fonts.text,
    fontSize: rMS(10.5),
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: rV(6),
  },
  sectionBody: {
    marginTop: rV(6),
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  managementGrid: {
    gap: rS(14),
    marginBottom: rV(18),
  },
  managementGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    marginBottom: 0,
  },
  gridCardWide: {
    width: "48.8%",
  },
  segmentRow: {
    flexDirection: "row",
    gap: rS(10),
    marginBottom: rV(16),
  },
  segmentButton: {
    flex: 1,
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#D7DBE2",
    backgroundColor: "#F8FAFC",
    paddingVertical: rV(12),
    alignItems: "center",
  },
  segmentButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: "#E7EEF8",
  },
  segmentButtonLabel: {
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  segmentButtonLabelActive: {
    color: AppColors.primary,
  },
  selectorFieldWrap: {
    marginBottom: rV(16),
  },
  selectorLabel: {
    marginBottom: rV(6),
    paddingLeft: rS(8),
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    color: AppColors.primary,
  },
  selectorField: {
    minHeight: rV(58),
    borderRadius: rMS(22),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  selectorFieldTextWrap: {
    flex: 1,
  },
  selectorFieldValue: {
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
  },
  selectorFieldHelper: {
    marginTop: rV(4),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  selectorFieldAction: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: rS(18),
  },
  selectorModal: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingTop: rV(18),
    paddingBottom: rV(16),
    maxHeight: "78%",
  },
  selectorModalTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  selectorModalBody: {
    marginTop: rV(6),
    marginBottom: rV(14),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  selectorSearchInput: {
    borderRadius: rMS(18),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  selectorList: {
    marginTop: rV(14),
    marginBottom: rV(14),
  },
  selectorListContent: {
    gap: rV(10),
  },
  selectorOption: {
    borderRadius: rMS(18),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(13),
  },
  selectorOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: "#E7EEF8",
  },
  selectorOptionLabel: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  selectorOptionLabelSelected: {
    color: AppColors.primary,
  },
  selectorOptionCode: {
    marginTop: rV(3),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  selectorEmptyText: {
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    paddingVertical: rV(12),
  },
  listCard: {
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFBFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    marginTop: rV(10),
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: rS(10),
  },
  listTitleWrap: {
    flex: 1,
  },
  listTitle: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(14),
  },
  listMeta: {
    marginTop: rV(4),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(11.8),
    lineHeight: rMS(17),
  },
  detailChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(10),
  },
  detailChip: {
    borderRadius: rMS(999),
    backgroundColor: "#EDF2F7",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  detailChipText: {
    color: "#44556E",
    fontFamily: Fonts.textBold,
    fontSize: rMS(10.5),
    textTransform: "capitalize",
  },
  listNote: {
    marginTop: rV(7),
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(12.2),
    lineHeight: rMS(18),
  },
  statusChip: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  statusChipLabel: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.2),
    textTransform: "capitalize",
  },
  transactionAmount: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  transactionAmountPositive: {
    color: "#15803D",
  },
  transactionAmountNegative: {
    color: "#B91C1C",
  },
  supportCard: {
    backgroundColor: "#0B1526",
    borderRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
  },
  supportTitle: {
    marginTop: rV(8),
    color: AppColors.white,
    fontFamily: Fonts.title,
    fontSize: rMS(15),
  },
  supportBody: {
    marginTop: rV(8),
    color: "rgba(255,255,255,0.72)",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
});
