import type { AssistantAction, AssistantMessage } from "@/types/assistant";

export type AssistantQuickPrompt = {
  label: string;
  prompt: string;
};

export type AssistantScreenContext =
  | "checkout"
  | "cart"
  | "product"
  | "store"
  | "orders"
  | "deals"
  | "vendor"
  | "returns"
  | "vouchers"
  | "home"
  | "assistant";

const DEFAULT_PROMPTS: AssistantQuickPrompt[] = [
  { label: "Track my order", prompt: "Where is my order?" },
  { label: "Delivery options", prompt: "How do delivery options work?" },
  { label: "Use a voucher", prompt: "How do I use a voucher?" },
  { label: "Start a return", prompt: "How do I start a return?" },
];

const SCREEN_PROMPTS: Record<AssistantScreenContext, AssistantQuickPrompt[]> = {
  checkout: [
    { label: "Why is delivery this price?", prompt: "Why is my delivery fee this amount?" },
    { label: "Can I pay with wallet?", prompt: "Can I pay with my ODOS wallet?" },
    { label: "Apply my best voucher", prompt: "How do I apply my best voucher at checkout?" },
    { label: "Delivery to my address", prompt: "When will this arrive at my address?" },
  ],
  cart: [
    { label: "Apply my best voucher", prompt: "Do I have a voucher I can use on this cart?" },
    { label: "When will this arrive?", prompt: "When will my cart items arrive?" },
    { label: "Delivery options", prompt: "What delivery options do I have?" },
    { label: "Ready to checkout?", prompt: "Is my cart ready for checkout?" },
  ],
  product: [
    { label: "Delivery to my area?", prompt: "Can this be delivered to my address?" },
    { label: "Any deals on this?", prompt: "Are there any vouchers or deals for this product?" },
    { label: "Return policy", prompt: "What is the return policy for this item?" },
    { label: "Chat the store", prompt: "How do I chat with this store?" },
  ],
  store: [
    { label: "Browse this store", prompt: "How do I explore all products from this store?" },
    { label: "Delivery from this store", prompt: "How long does delivery take from this store?" },
    { label: "Chat this store", prompt: "How do I message this store?" },
    { label: "Find deals here", prompt: "Does this store have any active deals?" },
  ],
  orders: [
    { label: "Track latest order", prompt: "Where is my latest order?" },
    { label: "Start a return", prompt: "How do I start a return on my order?" },
    { label: "Chat the store", prompt: "How do I chat with the store about my order?" },
    { label: "Delivery update", prompt: "When will my order be delivered?" },
  ],
  deals: [
    { label: "Use a voucher", prompt: "How do I use a voucher from Deals?" },
    { label: "Claim a deal", prompt: "How do I claim a deal or voucher?" },
    { label: "Apply at checkout", prompt: "How do I apply a voucher at checkout?" },
    { label: "My voucher wallet", prompt: "Where is my voucher wallet?" },
  ],
  vendor: [
    { label: "New orders waiting?", prompt: "Do I have new orders waiting?" },
    { label: "Manage products", prompt: "How do I add or edit my products?" },
    { label: "Payout help", prompt: "How do vendor payouts work?" },
    { label: "Handle a return", prompt: "How do I handle a customer return?" },
  ],
  returns: [
    { label: "Return status", prompt: "What is the status of my return?" },
    { label: "Start another return", prompt: "How do I start a new return?" },
    { label: "Refund timeline", prompt: "How long do refunds take?" },
    { label: "Talk to support", prompt: "I need help with my return" },
  ],
  vouchers: [
    { label: "Use this voucher", prompt: "How do I use my saved voucher?" },
    { label: "Apply at checkout", prompt: "How do I apply a voucher at checkout?" },
    { label: "Find more deals", prompt: "Where can I find more vouchers?" },
    { label: "Voucher expired?", prompt: "What happens if my voucher expired?" },
  ],
  home: [
    { label: "Track my order", prompt: "Where is my order?" },
    { label: "Browse deals", prompt: "What deals are available today?" },
    { label: "Find a store", prompt: "How do I find stores on ODOS?" },
    { label: "Delivery options", prompt: "How do delivery options work?" },
  ],
  assistant: DEFAULT_PROMPTS,
};

const SCREEN_SNIPPETS: { context: AssistantScreenContext; snippets: string[] }[] = [
  { context: "checkout", snippets: ["Checkout", "/checkout"] },
  { context: "cart", snippets: ["/cart", "(tabs)/cart"] },
  { context: "product", snippets: ["productDetails", "/product/"] },
  { context: "store", snippets: ["/stores/", "stores/"] },
  { context: "orders", snippets: ["profileScreens/orders", "/orders/"] },
  { context: "deals", snippets: ["/deals", "screens/deals"] },
  { context: "returns", snippets: ["Account/Returns", "/returns"] },
  { context: "vouchers", snippets: ["Account/Vouchers", "/vouchers"] },
  { context: "vendor", snippets: ["/vendor"] },
  { context: "home", snippets: ["(tabs)/index", "/(root)/(tabs)"] },
];

export function deriveAssistantScreen(pathname: string): AssistantScreenContext {
  const normalized = pathname.toLowerCase();
  for (const entry of SCREEN_SNIPPETS) {
    if (entry.snippets.some((snippet) => normalized.includes(snippet.toLowerCase()))) {
      return entry.context;
    }
  }
  return "assistant";
}

export function getAssistantQuickPrompts(screen?: string): AssistantQuickPrompt[] {
  const key = (screen ?? "assistant") as AssistantScreenContext;
  return SCREEN_PROMPTS[key] ?? DEFAULT_PROMPTS;
}

const WELCOME_BY_SCREEN: Partial<
  Record<AssistantScreenContext, { content: string; actions: AssistantAction[] }>
> = {
  checkout: {
    content:
      "Need help finishing checkout? I can explain delivery fees, vouchers, and payment options.",
    actions: [
      { label: "My vouchers", route: "/screens/profileScreens/Account/Vouchers" },
      { label: "Delivery help", route: "/screens/profileScreens/helpAndSupport/FAQ" },
    ],
  },
  cart: {
    content:
      "I can help with vouchers, delivery timing, and getting your cart ready to checkout.",
    actions: [
      { label: "Go to checkout", route: "/(root)/screens/Checkout" },
      { label: "Browse deals", route: "/screens/deals" },
    ],
  },
  product: {
    content:
      "Ask about delivery, returns, deals, or how to chat with this store.",
    actions: [
      { label: "Delivery options", route: "/screens/profileScreens/helpAndSupport/FAQ" },
      { label: "Browse deals", route: "/screens/deals" },
    ],
  },
  orders: {
    content: "I can help track orders, start returns, or connect you with the store.",
    actions: [
      { label: "View orders", route: "/screens/profileScreens/orders" },
      { label: "Returns", route: "/screens/profileScreens/Account/Returns" },
    ],
  },
  vendor: {
    content:
      "Vendor Assistant — I can check pending orders, wallet balance, products, payouts, and returns with live data.",
    actions: [
      { label: "Vendor dashboard", route: "/vendor/dashboard" },
      { label: "Vendor orders", route: "/vendor/orders" },
      { label: "Vendor wallet", route: "/vendor/wallet" },
    ],
  },
};

export function buildAssistantWelcomeMessage(screen?: string): AssistantMessage {
  const context = (screen ?? "assistant") as AssistantScreenContext;
  const custom = WELCOME_BY_SCREEN[context];
  return {
    id: "welcome",
    role: "assistant",
    content: custom?.content ?? "Hi! How can I help you today?",
    suggestedActions:
      custom?.actions ?? [
        { label: "View my orders", route: "/screens/profileScreens/orders" },
        { label: "Browse deals", route: "/screens/deals" },
      ],
    createdAt: Date.now(),
  };
}
