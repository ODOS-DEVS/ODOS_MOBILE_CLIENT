export type ManagedStoreStatus = "draft" | "active" | "inactive" | "suspended";

export type VendorProductStatus =
  | "draft"
  | "active"
  | "archived"
  | "out_of_stock";

export type VendorOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "delivered"
  | "cancelled";

export type ManagedStoreProfile = {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  marketId?: string | null;
  location?: string | null;
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
