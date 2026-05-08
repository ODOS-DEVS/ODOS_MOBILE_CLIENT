import * as SecureStore from "expo-secure-store";

import type {
  VendorApplication,
  VendorDashboardStats,
  VendorProfile,
  VendorSessionContext,
  VendorStatus,
} from "@/types/vendor";
import type {
  ManagedStoreProfile,
  ManagedStoreStatus,
  VendorOrder,
  VendorOrderStatus,
  VendorProduct,
  VendorProductStatus,
} from "@/types/store";

export type VendorMockState = {
  application: VendorApplication | null;
  profile: VendorProfile | null;
  store: ManagedStoreProfile | null;
  products: VendorProduct[];
  orders: VendorOrder[];
};

const VENDOR_MOCK_KEY_PREFIX = "odos_vendor_mock_state";

function buildMockKey(userId: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${VENDOR_MOCK_KEY_PREFIX}_${safeUserId}`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sumOrdersByStatus(
  orders: VendorOrder[],
  statuses: VendorOrderStatus[],
) {
  return orders
    .filter((order) => statuses.includes(order.status))
    .reduce((total, order) => total + order.totalAmount, 0);
}

function buildSampleOrders(storeId: string, vendorId: string): VendorOrder[] {
  const now = Date.now();
  const items = [
    {
      id: createId("order-item"),
      productId: createId("product"),
      title: "Featured ODOS Item",
      quantity: 2,
      unitPrice: 120,
    },
  ];

  return [
    {
      id: createId("vendor-order"),
      orderNumber: `OD-${String(now).slice(-6)}`,
      customerName: "Ama Mensah",
      productCount: items.reduce((count, item) => count + item.quantity, 0),
      totalAmount: 240,
      status: "pending",
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      items,
    },
    {
      id: createId("vendor-order"),
      orderNumber: `OD-${String(now - 1).slice(-6)}`,
      customerName: "Kojo Boateng",
      productCount: 1,
      totalAmount: 85,
      status: "delivered",
      createdAt: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
      items: [
        {
          id: createId("order-item"),
          productId: createId("product"),
          title: `${storeId}-${vendorId}-Daily Pick`,
          quantity: 1,
          unitPrice: 85,
        },
      ],
    },
  ];
}

function buildSampleProducts(storeId: string, vendorId: string): VendorProduct[] {
  const now = new Date().toISOString();
  return [
    {
      id: createId("vendor-product"),
      storeId,
      vendorId,
      name: "Classic Shoulder Bag",
      description: "A polished everyday product seeded for vendor MVP previews.",
      category: "Accessories",
      subcategory: "Handbags",
      price: 120,
      oldPrice: 155,
      stock: 18,
      status: "active",
      imageKey: "handbag",
      placementTags: ["flash-sale"],
      discount: "23% off",
      colorOptions: ["Black", "Tan", "Stone"],
      sizeOptions: ["Standard"],
      specifications: ["Material: Vegan leather", "Closure: Magnetic flap", "Strap: Adjustable"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("vendor-product"),
      storeId,
      vendorId,
      name: "Weekend Travel Pack",
      description: "A simple mock product to populate the vendor dashboard.",
      category: "Bags",
      subcategory: "Travel",
      price: 220,
      stock: 8,
      status: "draft",
      imageKey: "backpack1",
      sizeOptions: ["Medium", "Large"],
      specifications: ["Capacity: 28L", "Compartments: 4", "Water resistance: Yes"],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createDefaultState(): VendorMockState {
  return {
    application: null,
    profile: null,
    store: null,
    products: [],
    orders: [],
  };
}

export async function loadVendorMockState(userId: string) {
  try {
    const rawValue = await SecureStore.getItemAsync(buildMockKey(userId));
    if (!rawValue) {
      return createDefaultState();
    }

    const parsed = JSON.parse(rawValue) as Partial<VendorMockState>;
    return {
      application: parsed.application ?? null,
      profile: parsed.profile ?? null,
      store: parsed.store ?? null,
      products: parsed.products ?? [],
      orders: parsed.orders ?? [],
    };
  } catch {
    return createDefaultState();
  }
}

export async function saveVendorMockState(
  userId: string,
  state: VendorMockState,
) {
  await SecureStore.setItemAsync(buildMockKey(userId), JSON.stringify(state));
}

export async function clearVendorMockState(userId: string) {
  await SecureStore.deleteItemAsync(buildMockKey(userId));
}

export async function ensureVendorMockState(session: VendorSessionContext) {
  if (!session.userId) {
    return createDefaultState();
  }

  const state = await loadVendorMockState(session.userId);
  const shouldBeApproved =
    session.vendorStatus === "approved" || session.roles?.includes("vendor");

  if (!shouldBeApproved) {
    return state;
  }

  if (state.profile && state.store) {
    return state;
  }

  const vendorId = session.vendorId || createId("vendor");
  const storeId = createId("store");
  const businessName = session.fullName
    ? `${session.fullName.split(" ")[0]}'s Store`
    : "ODOS Vendor Store";
  const createdAt = new Date().toISOString();
  const storeStatus: ManagedStoreStatus =
    session.vendorStatus === "suspended" ? "suspended" : "active";
  const vendorStatus: VendorStatus = session.vendorStatus || "approved";

  const nextState: VendorMockState = {
    application:
      state.application ??
      {
        id: createId("vendor-application"),
        userId: session.userId,
        status: vendorStatus,
        submittedAt: createdAt,
        reviewedAt: createdAt,
        businessName,
        businessCategory: "General Merchandising",
        businessDescription: "Auto-generated local vendor profile for ODOS MVP.",
        phoneNumber: session.phoneNumber || "",
        whatsappNumber: session.phoneNumber || undefined,
        region: "Greater Accra",
        city: "Accra",
        storeName: businessName,
        storeDescription: "ODOS vendor storefront",
      },
    profile:
      state.profile ??
      {
        id: vendorId,
        userId: session.userId,
        status: vendorStatus,
        businessName,
        businessCategory: "General Merchandising",
        businessDescription: "Auto-generated local vendor profile for ODOS MVP.",
        phoneNumber: session.phoneNumber || "",
        whatsappNumber: session.phoneNumber || undefined,
        createdAt,
        storeId,
        storeName: businessName,
        rejectionReason: session.vendorRejectionReason || undefined,
      },
    store:
      state.store ??
      {
        id: storeId,
        vendorId,
        name: businessName,
        slug: slugify(businessName),
        description: "A local vendor storefront seeded for the ODOS vendor MVP.",
        category: "General Merchandising",
        region: "Greater Accra",
        city: "Accra",
        location: "Main Market Row",
        audienceSlugs: ["ladies"],
        status: storeStatus,
        bannerImage: "ladiesstore",
        logoImage: "bag",
      },
    products:
      state.products.length > 0 ? state.products : buildSampleProducts(storeId, vendorId),
    orders:
      state.orders.length > 0 ? state.orders : buildSampleOrders(storeId, vendorId),
  };

  await saveVendorMockState(session.userId, nextState);
  return nextState;
}

export function deriveDashboardStats(
  state: VendorMockState,
  vendorStatus: VendorStatus,
): VendorDashboardStats | null {
  if (!state.store) {
    return null;
  }

  return {
    storeName: state.store.name,
    vendorStatus,
    totalProducts: state.products.length,
    activeProducts: state.products.filter((product) => product.status === "active").length,
    pendingOrders: state.orders.filter((order) =>
      ["pending", "confirmed", "processing", "ready"].includes(order.status),
    ).length,
    completedOrders: state.orders.filter((order) => order.status === "delivered").length,
    totalSales: sumOrdersByStatus(state.orders, ["confirmed", "processing", "ready", "delivered"]),
    currency: "GHS",
  };
}

export function createVendorProductRecord(input: {
  vendorId: string;
  storeId: string;
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
  status?: VendorProductStatus;
}) {
  const timestamp = new Date().toISOString();
  return {
    id: createId("vendor-product"),
    vendorId: input.vendorId,
    storeId: input.storeId,
    name: input.name,
    description: input.description,
    category: input.category,
    subcategory: input.subcategory,
    price: input.price,
    oldPrice: input.oldPrice,
    stock: input.stock,
    imageKey: input.imageKey,
    imageUrl: input.imageUrl,
    imageUris: input.imageUris,
    imageUrls: input.imageUris,
    placementTags: input.placementTags,
    discount:
      input.oldPrice && input.oldPrice > input.price
        ? `${Math.round(((input.oldPrice - input.price) / input.oldPrice) * 100)}% off`
        : undefined,
    colorOptions: input.colorOptions,
    sizeOptions: input.sizeOptions,
    specifications: input.specifications,
    status: input.status ?? "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies VendorProduct;
}
