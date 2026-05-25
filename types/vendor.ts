export type AppRole = "customer" | "vendor" | "admin";

export type VendorStatus =
  | "none"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended";

export type VendorSessionContext = {
  accessToken: string | null;
  userId: string | null;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  roles?: AppRole[];
  vendorId?: string | null;
  vendorStatus?: VendorStatus;
  vendorRejectionReason?: string | null;
};

export type VendorApplicationInput = {
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  phoneNumber: string;
  whatsappNumber?: string;
  region: string;
  city: string;
  marketId?: string;
  storeLocation?: string;
  storeLatitude?: number | null;
  storeLongitude?: number | null;
  storeInstagramUrl?: string;
  storeFacebookUrl?: string;
  storeTiktokUrl?: string;
  storeTwitterUrl?: string;
  storeWhatsappUrl?: string;
  storeWebsiteUrl?: string;
  storeName: string;
  storeDescription?: string;
  ghanaCardNumber?: string;
  businessRegistrationNumber?: string;
  logoImage?: string;
  bannerImage?: string;
  shopImage?: string;
};

export type VendorApplication = VendorApplicationInput & {
  id: string;
  userId: string;
  status: VendorStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
};

export type VendorProfile = {
  id: string;
  userId: string;
  status: VendorStatus;
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  phoneNumber: string;
  whatsappNumber?: string | null;
  createdAt: string;
  storeId?: string | null;
  storeName?: string | null;
  rejectionReason?: string | null;
};

export type VendorDashboardStats = {
  storeName: string;
  vendorStatus: VendorStatus;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  currency: string;
  availableBalance: number;
  pendingWithdrawalBalance: number;
  lifetimeEarnings: number;
  totalCommission: number;
};

export type VendorWalletTransaction = {
  id: string;
  kind: string;
  title: string;
  amount: number;
  grossAmount?: number | null;
  commissionAmount?: number | null;
  balanceAfter: number;
  orderId?: string | null;
  returnRequestId?: string | null;
  withdrawalRequestId?: string | null;
  createdAt: string;
};

export type VendorWithdrawalStatus =
  | "pending"
  | "approved"
  | "processing"
  | "rejected"
  | "failed"
  | "paid";

export type VendorWithdrawalRequest = {
  id: string;
  status: VendorWithdrawalStatus;
  amount: number;
  note?: string | null;
  adminNote?: string | null;
  payoutMethodType: string;
  payoutAccountName: string;
  payoutAccountNumberMasked: string;
  payoutProvider?: string | null;
  transferFailureReason?: string | null;
  reviewedByUserId?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
  transferInitiatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VendorWallet = {
  id: string;
  vendorUserId: string;
  currency: string;
  availableBalance: number;
  pendingWithdrawalBalance: number;
  lifetimeEarnings: number;
  totalWithdrawn: number;
  totalCommission: number;
  payoutMethodType?: string | null;
  payoutAccountName?: string | null;
  payoutAccountNumberMasked?: string | null;
  payoutProvider?: string | null;
  recentTransactions: VendorWalletTransaction[];
  withdrawalRequests: VendorWithdrawalRequest[];
};

export type VendorPayoutDetailsInput = {
  payoutMethodType: "mobile_money" | "bank_transfer";
  payoutAccountName: string;
  payoutAccountNumber: string;
  payoutProvider: string;
};

export type VendorPayoutInstitution = {
  code: string;
  name: string;
  payoutMethodType: "mobile_money" | "bank_transfer";
  currency: string;
};

export type VendorWithdrawalInput = {
  amount: number;
  note?: string;
};

const VALID_ROLES: AppRole[] = ["customer", "vendor", "admin"];
const VALID_VENDOR_STATUSES: VendorStatus[] = [
  "none",
  "pending",
  "under_review",
  "approved",
  "rejected",
  "suspended",
];

export function normalizeRoles(
  inputRoles: unknown,
  fallbackRole?: unknown,
): AppRole[] {
  const normalized = new Set<AppRole>();

  const addRole = (value: unknown) => {
    if (typeof value !== "string") {
      return;
    }

    const lowerValue = value.trim().toLowerCase() as AppRole;
    if (VALID_ROLES.includes(lowerValue)) {
      normalized.add(lowerValue);
    }
  };

  if (Array.isArray(inputRoles)) {
    inputRoles.forEach(addRole);
  } else if (typeof inputRoles === "string") {
    inputRoles.split(",").forEach(addRole);
  }

  addRole(fallbackRole);

  if (normalized.size === 0) {
    normalized.add("customer");
  }

  return Array.from(normalized);
}

export function normalizeVendorStatus(
  value: unknown,
  roles: AppRole[] = ["customer"],
): VendorStatus {
  if (typeof value === "string") {
    const lowerValue = value.trim().toLowerCase() as VendorStatus;
    if (VALID_VENDOR_STATUSES.includes(lowerValue)) {
      return lowerValue;
    }
  }

  return roles.includes("vendor") ? "approved" : "none";
}

export function hasRole(roles: AppRole[] | undefined, role: AppRole) {
  return roles?.includes(role) ?? false;
}

export function canAccessVendorDashboard(
  roles: AppRole[] | undefined,
  vendorStatus: VendorStatus,
) {
  return hasRole(roles, "vendor") && vendorStatus === "approved";
}
