export type ManagedStoreStatus = "draft" | "active" | "inactive" | "suspended";

export type VendorProductStatus =
  | "pending"
  | "active"
  | "hidden"
  | "suspended";

export type VendorOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type VendorVoucherAvailability = "auto" | "claim" | "assigned";
export type VendorVoucherDiscountType = "percent" | "fixed";

export type ManagedStoreProfile = {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  marketId?: string | null;
  location?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  whatsappUrl?: string | null;
  websiteUrl?: string | null;
  region: string;
  city: string;
  bannerImage?: string | null;
  logoImage?: string | null;
  audienceSlugs?: string[] | null;
  status: ManagedStoreStatus;
};

export type ManagedStoreUpdateInput = {
  name: string;
  description: string;
  category: string;
  marketId?: string;
  location?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  websiteUrl?: string;
  region: string;
  city: string;
  bannerImage?: string;
  logoImage?: string;
  audienceSlugs?: string[];
};

export type VendorProductInput = {
  name: string;
  description: string;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  imageKey?: string;
  imageUrl?: string;
  imageUris?: string[];
  placementTags?: string[];
  colorOptions?: string[];
  sizeOptions?: string[];
  specifications?: string[];
  isReturnable?: boolean;
};

export type VendorProduct = VendorProductInput & {
  id: string;
  storeId: string;
  vendorId: string;
  discount?: string;
  status: VendorProductStatus;
  image?: any;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
};

export type VendorOrderItem = {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type VendorOrder = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  productCount: number;
  totalAmount: number;
  status: VendorOrderStatus;
  createdAt: string;
  items: VendorOrderItem[];
};

export type VendorVoucher = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  issuerName?: string | null;
  availability: VendorVoucherAvailability;
  rewardText: string;
  discountType: "percent" | "fixed" | "free_shipping";
  discountValue: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive: boolean;
  status: string;
  redemptionCount: number;
  uniqueUserCount: number;
  totalDiscountAmount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  approvalStatus?: string;
  reviewNotes?: string | null;
};

export type VendorVoucherInput = {
  code: string;
  title: string;
  description?: string | null;
  issuerName?: string | null;
  availability: VendorVoucherAvailability;
  discountType: VendorVoucherDiscountType;
  discountValue: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};
