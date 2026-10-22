// Type-only: keeps this module free of runtime imports so `npm run
// export:guide-catalog` can import it under plain Node without pulling in
// React Native.
import type { Ionicons } from "@expo/vector-icons";

/**
 * Step-by-step walkthroughs rendered by the resource center
 * (`screens/profileScreens/helpAndSupport/Resources` for the index,
 * `screens/resources/[slug]` for a single guide).
 *
 * These are deliberately a different shape from `constants/faqContent.ts`: an
 * FAQ item answers one question in a sentence, a guide walks someone through a
 * whole task and hands them a button that opens the screen the step is talking
 * about. Keep the copy honest — every screen name, fee rule, and order stage
 * here mirrors the real implementation, so when a flow changes, change the
 * guide with it.
 */

export type GuideCategory =
  | "Getting started"
  | "Buying"
  | "Paying"
  | "Delivery"
  | "After delivery"
  | "Account"
  | "Selling";

export const GUIDE_CATEGORIES: {
  key: GuideCategory | "All";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "All", label: "All", icon: "grid-outline" },
  { key: "Getting started", label: "Start here", icon: "rocket-outline" },
  { key: "Buying", label: "Buying", icon: "bag-handle-outline" },
  { key: "Paying", label: "Paying", icon: "card-outline" },
  { key: "Delivery", label: "Delivery", icon: "bicycle-outline" },
  { key: "After delivery", label: "After delivery", icon: "return-down-back-outline" },
  { key: "Account", label: "Account", icon: "person-outline" },
  { key: "Selling", label: "Selling", icon: "storefront-outline" },
];

/** A button that drops the reader on the screen the step is describing. */
export type GuideAction = {
  label: string;
  /** Router path. Cast to `Href` at the push site. */
  href: string;
  /** Prompt an anonymous reader to sign in before navigating. */
  requiresAuth?: boolean;
};

export type GuideNote = {
  tone: "tip" | "warning" | "info";
  title: string;
  body: string;
};

export type GuideStep = {
  title: string;
  body: string[];
  action?: GuideAction;
  note?: GuideNote;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: GuideCategory;
  icon: keyof typeof Ionicons.glyphMap;
  /** Rough read time, shown on the card. */
  minutes: number;
  /** Position in the pinned "New to ODOS" path; omit to keep it out. */
  starterOrder?: number;
  intro: string;
  steps: GuideStep[];
  /** Extra context that does not belong to any single step. */
  notes?: GuideNote[];
  /** Search terms a reader might use that the copy itself does not contain. */
  keywords: string[];
  related: string[];
};

export const RESOURCE_GUIDES: Guide[] = [
  {
    slug: "first-order",
    title: "Your first order, start to finish",
    summary:
      "Six steps from opening the app to watching your package move. Start here if you have never ordered on ODOS.",
    category: "Getting started",
    icon: "rocket-outline",
    minutes: 4,
    starterOrder: 1,
    intro:
      "Every order on ODOS follows the same shape: find it, cart it, check out, pay, track. This guide walks the whole path once so the rest of the app stops feeling unfamiliar.",
    steps: [
      {
        title: "Find something to buy",
        body: [
          "There are three ways in. Search by product or store name, browse the category tabs, or open Markets to shop a specific seller's storefront.",
          "You can browse all of this as a guest — you only need an account once you check out.",
        ],
        action: { label: "Browse markets", href: "/(root)/screens/stores/stores" },
      },
      {
        title: "Read the product page before you commit",
        body: [
          "The product page shows the price, the seller, available variants like size or colour, and reviews from people who already bought it.",
          "If something is unclear, tap Chat on the page to message the seller directly rather than guessing.",
        ],
      },
      {
        title: "Add it to your cart",
        body: [
          "Pick your variant and quantity, then add to cart. Not ready to buy? Save it to your wishlist instead and come back later.",
          "Your cart groups items by store. Each store you buy from becomes its own package with its own delivery, which is why a single order can arrive in more than one drop.",
        ],
        action: { label: "Open cart", href: "/(root)/(tabs)/cart" },
      },
      {
        title: "Review the cart",
        body: [
          "Change quantities or remove anything you have second thoughts about. The subtotal updates as you go.",
          "When the cart looks right, continue to checkout.",
        ],
      },
      {
        title: "Set address, delivery, and payment",
        body: [
          "Checkout asks for three things: where it goes, how fast you want it, and how you are paying.",
          "Pick a saved delivery address, choose a delivery speed, add a voucher code if you have one, then select ODOS Wallet, a card, or mobile money.",
        ],
        note: {
          tone: "info",
          title: "The total you see is the total you pay",
          body: "Delivery fees and any voucher discount are applied before the payment step, so the figure on the confirm button is the final one. Nothing is charged until you confirm.",
        },
      },
      {
        title: "Pay, then follow it",
        body: [
          "Paying from your ODOS Wallet completes instantly. Card and mobile money open a secure payment page and return you to the app when the payment clears.",
          "Your order then appears under Orders, where you can follow every stage from the seller confirming it to the rider handing it over.",
        ],
        action: {
          label: "Go to my orders",
          href: "/(root)/screens/profileScreens/orders",
          requiresAuth: true,
        },
      },
    ],
    keywords: ["buy", "purchase", "how to order", "beginner", "new", "shopping", "basics"],
    related: ["paying-on-odos", "tracking-delivery", "delivery-options"],
  },

  {
    slug: "finding-products",
    title: "Finding what you want",
    summary:
      "Search, categories, markets, and the deals lanes — plus the wishlist for things you are not ready to buy yet.",
    category: "Buying",
    icon: "search-outline",
    minutes: 3,
    intro:
      "ODOS carries a lot of stores. These are the different ways to cut through them depending on whether you know exactly what you want or are just looking.",
    steps: [
      {
        title: "Search when you know what you want",
        body: [
          "The search bar matches product names and store names, so it works whether you are after \"running shoes\" or a shop you have bought from before.",
        ],
        action: { label: "Open search", href: "/(root)/screens/search" },
      },
      {
        title: "Browse categories when you are exploring",
        body: [
          "The category tab organises everything by department, and narrows further into ladies, gents, and kids sections.",
        ],
        action: { label: "Browse categories", href: "/(root)/(tabs)/category" },
      },
      {
        title: "Shop a specific market or store",
        body: [
          "Markets group sellers the way a physical market does. Open one to see its stores, or open a store to see everything it sells in one place.",
          "There is also a map view if you would rather find sellers by where they actually are.",
        ],
        action: { label: "Open markets", href: "/(root)/screens/stores/stores" },
      },
      {
        title: "Check deals and flash sales",
        body: [
          "The deals screen collects discounted items and claimable vouchers. Flash sales run on a countdown and end when the timer does.",
        ],
        action: { label: "See deals", href: "/(root)/screens/deals" },
      },
      {
        title: "Save things for later",
        body: [
          "Tap the heart on any product to add it to your wishlist. It stays there until you move it to the cart or remove it.",
        ],
        action: { label: "Open wishlist", href: "/(root)/(tabs)/wishlist", requiresAuth: true },
      },
    ],
    keywords: ["search", "browse", "discover", "find", "stores", "shops", "wishlist", "favourites"],
    related: ["first-order", "vouchers-and-deals", "chat-and-support"],
  },

  {
    slug: "paying-on-odos",
    title: "Ways to pay",
    summary:
      "Wallet, card, and mobile money — how to save a method, how the secure payment page works, and what to do when a payment fails.",
    category: "Paying",
    icon: "card-outline",
    minutes: 4,
    starterOrder: 2,
    intro:
      "ODOS takes three kinds of payment. They behave differently at checkout, and knowing which is which saves a failed order.",
    steps: [
      {
        title: "ODOS Wallet — the instant one",
        body: [
          "If your wallet holds enough to cover the order, paying from it completes immediately with no redirect and no card details.",
          "Your available balance is shown next to the wallet option at checkout, so you can see at a glance whether it covers the total.",
        ],
        action: {
          label: "Open my wallet",
          href: "/(root)/screens/profileScreens/Account/Wallet",
          requiresAuth: true,
        },
      },
      {
        title: "Card — debit or credit",
        body: [
          "Choosing a card sends you to a secure hosted payment page to enter or confirm your details, then returns you to the app once the bank responds.",
        ],
        note: {
          tone: "tip",
          title: "No card surcharge",
          body: "ODOS does not add a fee for paying by card. The amount that leaves your account is the order total you confirmed.",
        },
      },
      {
        title: "Mobile money",
        body: [
          "Pick your network and pay from your MoMo wallet. You will get the usual prompt from your provider to authorise the payment.",
          "Keep the app open while you approve it — the order is confirmed when the payment clears, not when you tap pay.",
        ],
      },
      {
        title: "Save a method so checkout is one tap",
        body: [
          "Saved cards and MoMo numbers live in your wallet screen, and one can be marked as your default. Saved methods also work for topping up your wallet.",
        ],
        action: {
          label: "Manage payment methods",
          href: "/(root)/screens/profileScreens/Account/Wallet",
          requiresAuth: true,
        },
      },
      {
        title: "When a payment fails",
        body: [
          "Check the card number, expiry, and CVV first — a typo is the most common cause. Then confirm you have enough funds and that your bank allows online transactions.",
          "If it still will not go through, switch to another method rather than retrying the same one, and contact support if nothing works.",
        ],
        note: {
          tone: "warning",
          title: "A failed payment is not a placed order",
          body: "If payment does not clear, no order is created and nothing is reserved. Nothing has been taken from you either — start again when you are ready.",
        },
      },
    ],
    keywords: ["momo", "mobile money", "card", "visa", "mastercard", "checkout", "payment failed", "declined"],
    related: ["wallet-top-up", "first-order", "vouchers-and-deals"],
  },

  {
    slug: "wallet-top-up",
    title: "Topping up your ODOS wallet",
    summary:
      "Move money into your wallet from a card or MoMo so checkout becomes a single tap, and see where every cedi went.",
    category: "Paying",
    icon: "wallet-outline",
    minutes: 3,
    intro:
      "The wallet is a prepaid balance you load once and spend across orders. It is the fastest way to check out because it skips the payment redirect entirely.",
    steps: [
      {
        title: "Open your wallet",
        body: [
          "Your wallet lives in your profile. The top of the screen shows your available balance and what you have topped up over time.",
        ],
        action: {
          label: "Open my wallet",
          href: "/(root)/screens/profileScreens/Account/Wallet",
          requiresAuth: true,
        },
      },
      {
        title: "Enter an amount",
        body: [
          "Type what you want to load. It helps to top up a little above your usual order total so delivery fees do not leave you short at checkout.",
        ],
      },
      {
        title: "Choose card or mobile money",
        body: [
          "Pick which you are funding the top-up with, then select a saved method or add a new one.",
        ],
      },
      {
        title: "Finish on the secure page",
        body: [
          "ODOS opens a secure payment page to take the top-up. Approve it there, and the app brings you back automatically once it completes.",
        ],
        note: {
          tone: "warning",
          title: "Let it return on its own",
          body: "Do not close the payment page manually while it is processing. If you do get stuck, reopen the wallet screen — a completed top-up shows up in your balance and transaction list.",
        },
      },
      {
        title: "Spend it at checkout",
        body: [
          "Your new balance is available straight away. Pick ODOS Wallet as your payment method and the order completes without another redirect.",
          "Every top-up and every wallet payment is listed in your transaction history, so the balance is always accounted for.",
        ],
      },
    ],
    keywords: ["top up", "topup", "load wallet", "balance", "credit", "fund", "transactions"],
    related: ["paying-on-odos", "first-order", "account-security"],
  },

  {
    slug: "tracking-delivery",
    title: "Tracking your delivery",
    summary:
      "What each stage of the order journey actually means, and what you can do at the moment your package is out for delivery.",
    category: "Delivery",
    icon: "navigate-outline",
    minutes: 5,
    starterOrder: 3,
    intro:
      "Every order has a journey timeline that fills in as it progresses. Knowing what each stage means tells you whether to wait or to act.",
    steps: [
      {
        title: "Open the order",
        body: [
          "Orders are listed newest first in your profile, split across processing, delivered, and cancelled. Tap any one to open its full detail screen.",
        ],
        action: {
          label: "Go to my orders",
          href: "/(root)/screens/profileScreens/orders",
          requiresAuth: true,
        },
      },
      {
        title: "Read the order journey",
        body: [
          "Order placed — we have your order and are waiting on payment to clear.",
          "Payment confirmed — the money cleared and the seller has been notified.",
          "Order received — the seller has it and will confirm shortly.",
          "Confirmed by seller — the seller accepted and will start preparing.",
          "Preparing your order — your items are being picked and packed.",
          "Ready for handoff — packed and waiting for the rider.",
          "Out for delivery — it is physically on the way to you.",
          "Delivered — confirmed received.",
        ],
        note: {
          tone: "info",
          title: "Stages carry timestamps",
          body: "Each completed stage shows when it happened, so you can see exactly where the time went if an order feels slow.",
        },
      },
      {
        title: "Orders from several stores move separately",
        body: [
          "If you bought from more than one store, each store's package has its own progress. One can be out for delivery while another is still being packed — that is normal, not an error.",
        ],
      },
      {
        title: "When it says out for delivery",
        body: [
          "This is the stage where you have options. If the timing no longer works, request a reschedule from the order screen and explain when suits you better.",
        ],
      },
      {
        title: "Confirm when it reaches your hands",
        body: [
          "Once you physically have the package, confirm receipt on the order screen. This is what closes the order out and releases it to the seller.",
          "Only confirm after you actually have it — confirming early makes a missing package much harder to resolve.",
        ],
        note: {
          tone: "warning",
          title: "Something wrong? Say so instead",
          body: "If it never arrived or arrived damaged, use the \"I haven't received it\" option rather than confirming. The order is held open while the problem is looked into.",
        },
      },
      {
        title: "Keep your receipt",
        body: [
          "Every order has a receipt with the items, delivery fee, any voucher applied, and the total. You can open it from the order screen at any point, including long after delivery.",
        ],
      },
    ],
    keywords: ["track", "tracking", "where is my order", "status", "timeline", "late", "delayed", "reschedule", "eta"],
    related: ["delivery-options", "returns-and-refunds", "addresses"],
  },

  {
    slug: "delivery-options",
    title: "Delivery options and fees",
    summary:
      "Economy, express, and same-day — what each costs you in time, and how the fee on your order is worked out.",
    category: "Delivery",
    icon: "bicycle-outline",
    minutes: 3,
    intro:
      "You choose a delivery speed at checkout. Which options appear depends on where you are sending it, and the fee is always shown before you pay.",
    steps: [
      {
        title: "Economy — 3 to 5 business days",
        body: [
          "The cheapest option and the default for most orders. Fine for anything you are not in a hurry for.",
        ],
      },
      {
        title: "Express — 1 to 2 business days",
        body: [
          "Costs more and moves your package up the queue. Available across most areas ODOS serves.",
        ],
      },
      {
        title: "Same-day — where your address qualifies",
        body: [
          "Same-day appears at checkout only when your delivery address falls inside a serviceable area and the order is placed in time for it.",
          "If you do not see it, your address is outside the zone for it — not an app fault.",
        ],
        note: {
          tone: "tip",
          title: "A precise address unlocks more options",
          body: "Same-day availability is decided from your saved address. A vague or wrongly pinned address can hide options you would otherwise qualify for.",
        },
      },
      {
        title: "How your fee is calculated",
        body: [
          "Three things decide it: the region you are delivering to, your cart total, and the speed you picked.",
          "The exact figure appears on the checkout summary before the payment step, and again on your receipt afterwards.",
        ],
      },
      {
        title: "Multi-store orders",
        body: [
          "Buying from several stores in one checkout creates one order with several packages. The breakdown on the checkout screen shows what is coming from where.",
        ],
        action: { label: "Open cart", href: "/(root)/(tabs)/cart" },
      },
    ],
    keywords: ["shipping", "delivery fee", "express", "same day", "economy", "cost", "how long", "speed"],
    related: ["tracking-delivery", "addresses", "first-order"],
  },

  {
    slug: "vouchers-and-deals",
    title: "Vouchers, deals, and flash sales",
    summary:
      "Where discounts come from, how to apply one at checkout, and the usual reasons a code gets rejected.",
    category: "Buying",
    icon: "pricetag-outline",
    minutes: 3,
    intro:
      "Discounts on ODOS come in a few forms. Vouchers are the ones you hold and apply yourself; deals and flash sales are already priced in.",
    steps: [
      {
        title: "Claim vouchers from Deals",
        body: [
          "The deals screen lists vouchers you can claim. Claiming one moves it into your voucher wallet, where it waits until you use it.",
        ],
        action: { label: "See deals", href: "/(root)/screens/deals" },
      },
      {
        title: "Check what you are holding",
        body: [
          "Your voucher wallet shows each voucher's discount, its expiry, and any minimum order it requires. Worth a look before you check out.",
        ],
        action: {
          label: "My vouchers",
          href: "/(root)/screens/profileScreens/Account/Vouchers",
          requiresAuth: true,
        },
      },
      {
        title: "Apply it at checkout",
        body: [
          "The checkout screen has a voucher section. Type a code in directly, or tap Browse Wallet to pick one you have already claimed.",
          "A valid voucher updates the total immediately. Apply it before confirming payment — a voucher cannot be added to an order after the fact.",
        ],
      },
      {
        title: "If the code is rejected",
        body: [
          "Almost always one of three things: it has expired, it has already been used, or your cart has not reached the minimum order amount it requires.",
          "Open the voucher in your wallet to see its exact terms.",
        ],
        note: {
          tone: "info",
          title: "Changing your cart revalidates the voucher",
          body: "Because some vouchers need a minimum spend, removing items after applying one can make it stop qualifying. The total on screen always reflects the current state of the cart.",
        },
      },
      {
        title: "Flash sales end on a timer",
        body: [
          "Flash sale pricing applies while the countdown is running. Once it ends, the item returns to its normal price — having it sitting in your cart does not hold the sale price.",
        ],
        action: { label: "Flash sales", href: "/(root)/screens/flash-sales" },
      },
    ],
    keywords: ["voucher", "coupon", "promo code", "discount", "deal", "flash sale", "offer", "rejected"],
    related: ["first-order", "loyalty-points", "paying-on-odos"],
  },

  {
    slug: "returns-and-refunds",
    title: "Returns and refunds",
    summary:
      "How to raise a return on a delivered item, what to include so it is approved quickly, and how the refund comes back.",
    category: "After delivery",
    icon: "return-down-back-outline",
    minutes: 4,
    intro:
      "If something arrives wrong, damaged, or not as described, you raise a return against that specific item. Here is what that process looks like.",
    steps: [
      {
        title: "Check what is eligible",
        body: [
          "The returns screen has two sides: items from delivered orders you can still return, and the requests you have already raised.",
          "Returns are raised per item, not per order, so you can return one thing from an order and keep the rest.",
        ],
        action: {
          label: "Open returns",
          href: "/(root)/screens/profileScreens/Account/Returns",
          requiresAuth: true,
        },
      },
      {
        title: "Pick the item and explain the problem",
        body: [
          "Select the item, then describe what is wrong. Be specific — \"the zip is broken\" gets resolved faster than \"faulty\".",
        ],
      },
      {
        title: "Add photos",
        body: [
          "You can attach photos to the request. For anything damaged or visibly not as described, this is the single thing that most speeds up approval.",
        ],
        note: {
          tone: "tip",
          title: "Photograph it before you repack it",
          body: "Take the photos while the item and its packaging are as they arrived. It is much harder to evidence a damaged delivery after everything has been boxed back up.",
        },
      },
      {
        title: "Submit and follow the request",
        body: [
          "Once submitted, the request moves to your requests list with a status you can check at any time. The seller or the ODOS team reviews it from there.",
          "You can also see the return against the order itself, in its returns and refunds section.",
        ],
      },
      {
        title: "Getting your money back",
        body: [
          "Approved refunds go back to the method you paid with. Timing after approval depends on your bank or mobile money provider, and is usually a few business days.",
        ],
      },
    ],
    keywords: ["return", "refund", "damaged", "wrong item", "send back", "money back", "faulty"],
    related: ["tracking-delivery", "chat-and-support", "paying-on-odos"],
  },

  {
    slug: "addresses",
    title: "Addresses and your delivery pin",
    summary:
      "Saving addresses, setting a default, and why an accurate map pin changes both your options and your fee.",
    category: "Delivery",
    icon: "location-outline",
    minutes: 3,
    intro:
      "Your saved address does more than tell a rider where to go. It decides which delivery speeds you are offered and what they cost, so it is worth getting right once.",
    steps: [
      {
        title: "Add your addresses",
        body: [
          "Save as many as you need — home, work, somewhere a package can actually be received during the day.",
        ],
        action: {
          label: "Manage addresses",
          href: "/(root)/screens/profileScreens/Account/Addresses",
          requiresAuth: true,
        },
      },
      {
        title: "Get the region and city right",
        body: [
          "Region and city are what the delivery fee is calculated from, so an incorrect region gives you a quoted fee that does not match reality.",
        ],
      },
      {
        title: "Drop an accurate pin",
        body: [
          "Street addresses are not always enough to find a door. The map pin is what actually guides the rider to you.",
        ],
        note: {
          tone: "warning",
          title: "A rough pin costs you options",
          body: "Same-day eligibility is worked out from your address. If the pin is off, you may be quoted the wrong fee or lose access to faster delivery entirely.",
        },
      },
      {
        title: "Set a default",
        body: [
          "Mark the address you use most as your default and checkout pre-fills it, which removes the most common source of misdelivered orders — forgetting to switch addresses.",
        ],
      },
      {
        title: "Check it before you pay",
        body: [
          "The delivery address is shown on the checkout screen. Glance at it before confirming, especially if you have several saved.",
        ],
        note: {
          tone: "info",
          title: "Once it is out for delivery, the address is fixed",
          body: "You cannot redirect a package mid-delivery. If something is wrong, request a reschedule from the order screen or contact support.",
        },
      },
    ],
    keywords: ["address", "location", "gps", "pin", "map", "default address", "region", "city"],
    related: ["delivery-options", "tracking-delivery", "first-order"],
  },

  {
    slug: "chat-and-support",
    title: "Getting help: sellers, assistant, support",
    summary:
      "Four different ways to ask a question, and which one is actually the right one for your problem.",
    category: "Account",
    icon: "chatbubbles-outline",
    minutes: 3,
    starterOrder: 4,
    intro:
      "Asking the right channel is most of the battle. A question about a product needs the seller; a question about a payment needs support.",
    steps: [
      {
        title: "Ask the seller about their products",
        body: [
          "Sizing, materials, stock, what a store actually has on the shelf — the seller knows and support does not. Tap Chat on a product or store page to reach them.",
        ],
      },
      {
        title: "Ask the ODOS Assistant for anything quick",
        body: [
          "The assistant is available at any hour and handles the fast questions — finding a product, explaining a fee, pointing you at the right screen.",
        ],
        action: { label: "Open assistant", href: "/(root)/screens/assistant" },
      },
      {
        title: "Message support for account and payment issues",
        body: [
          "Anything involving your money, your account, or an order that has gone wrong should go to support, where it stays attached to your account and can be followed up.",
        ],
        action: {
          label: "Contact support",
          href: "/(root)/screens/profileScreens/helpAndSupport/GetHelp",
          requiresAuth: true,
        },
      },
      {
        title: "Find your conversations again",
        body: [
          "Every chat you have opened — sellers and support alike — is listed in one place, so you do not have to retrace your steps to find a reply.",
        ],
        action: {
          label: "My chats",
          href: "/(root)/screens/profileScreens/Account/Chats",
          requiresAuth: true,
        },
      },
      {
        title: "Check the FAQ first for the common ones",
        body: [
          "Short answers to the questions people ask most, searchable by keyword. Often faster than waiting on a reply.",
        ],
        action: {
          label: "Open FAQ",
          href: "/(root)/screens/profileScreens/helpAndSupport/FAQ",
        },
      },
    ],
    keywords: ["help", "support", "contact", "chat", "assistant", "message", "complaint", "problem"],
    related: ["returns-and-refunds", "tracking-delivery", "account-security"],
  },

  {
    slug: "loyalty-points",
    title: "Loyalty tiers and points",
    summary:
      "Bronze, silver, and gold — what each tier is worth on your orders and how you move up.",
    category: "Account",
    icon: "sparkles-outline",
    minutes: 2,
    intro:
      "Shopping on ODOS earns points, and points move you through tiers. The tier you are in changes what you pay.",
    steps: [
      {
        title: "Find your tier",
        body: [
          "Your loyalty screen shows your current tier, your points, and how far through you are to the next one.",
        ],
        action: { label: "Open loyalty", href: "/(root)/screens/loyalty", requiresAuth: true },
      },
      {
        title: "What each tier gives you",
        body: [
          "Bronze — standard shipping, no order discount. The starting point.",
          "Silver — 5% off your orders, and free shipping once you spend 50 GHS.",
          "Gold — 10% off your orders, and free shipping from 30 GHS.",
        ],
      },
      {
        title: "Moving up",
        body: [
          "Points accumulate as you shop, and the progress bar on the loyalty screen shows exactly how much of the next tier you have covered.",
        ],
        note: {
          tone: "tip",
          title: "Tier benefits stack with vouchers",
          body: "Your tier discount is a property of your account, not a voucher, so reaching silver or gold is worth real money on every order you place afterwards.",
        },
      },
    ],
    keywords: ["loyalty", "points", "tier", "bronze", "silver", "gold", "rewards", "free shipping"],
    related: ["vouchers-and-deals", "first-order", "account-security"],
  },

  {
    slug: "account-security",
    title: "Your account and privacy",
    summary:
      "Profile details, passwords, notification control, and what happens if you decide to delete your account.",
    category: "Account",
    icon: "shield-checkmark-outline",
    minutes: 3,
    intro:
      "Your account holds your addresses, orders, wallet, and payment methods. A few minutes here keeps all of it under your control.",
    steps: [
      {
        title: "Keep your details current",
        body: [
          "Your name, phone number, and contact details are what sellers and riders use to reach you. An out-of-date phone number is a common reason a delivery fails.",
        ],
        action: {
          label: "Edit my profile",
          href: "/(root)/screens/profileScreens/CustomerProfile",
          requiresAuth: true,
        },
      },
      {
        title: "Use a password only you know",
        body: [
          "Avoid anything you have reused on another site. If you ever lose access, the forgot-password flow on the sign-in screen sends a reset to your registered email.",
        ],
      },
      {
        title: "Decide what you get notified about",
        body: [
          "Order updates, deals, and account alerts can each be turned on or off. Turning off deals still leaves order updates on, so you will not miss a delivery.",
        ],
        action: {
          label: "Notification settings",
          href: "/(root)/screens/profileScreens/personalization/Notification",
          requiresAuth: true,
        },
      },
      {
        title: "Read the legal bits once",
        body: [
          "Terms and the privacy policy set out what ODOS does with your data and what you are agreeing to when you buy.",
        ],
        action: {
          label: "Legal and policies",
          href: "/(root)/screens/profileScreens/helpAndSupport/LegalPolicy",
        },
      },
      {
        title: "Deleting your account",
        body: [
          "You can delete your account from inside the app. It is permanent — your order history, wallet balance, saved addresses, and payment methods go with it.",
        ],
        note: {
          tone: "warning",
          title: "Settle up first",
          body: "Spend or withdraw any remaining wallet balance and close out open orders and returns before deleting. Deletion cannot be undone and the balance does not come back.",
        },
      },
    ],
    keywords: ["security", "password", "privacy", "delete account", "notifications", "profile", "data"],
    related: ["chat-and-support", "wallet-top-up", "loyalty-points"],
  },

  {
    slug: "selling-on-odos",
    title: "Selling on ODOS",
    summary:
      "What the vendor application asks for, how approval works, and what you get access to once you are in.",
    category: "Selling",
    icon: "storefront-outline",
    minutes: 4,
    intro:
      "Any ODOS account can apply to sell. Approval turns on a separate Seller Center for managing your store alongside your normal shopping.",
    steps: [
      {
        title: "Have your details ready",
        body: [
          "The application asks for your business name and description, a business contact number, the store name customers will see, and your region and city.",
          "You also pick the market your store belongs to, which is how buyers browsing that market find you.",
        ],
      },
      {
        title: "Prepare your images",
        body: [
          "Three uploads: a store logo, a store banner, and a photo of your shop. These are the first thing a buyer sees, so use clear, well-lit images rather than placeholders you mean to replace later.",
        ],
      },
      {
        title: "Submit the application",
        body: [
          "Fill it in and send it. A store description is optional, but it gives buyers a reason to trust a shop they have not bought from before.",
        ],
        action: { label: "Apply to sell", href: "/vendor/apply", requiresAuth: true },
      },
      {
        title: "Track your application",
        body: [
          "The application status screen shows where your submission is. You do not need to reapply while one is under review.",
        ],
        action: {
          label: "Check application status",
          href: "/vendor/application-status",
          requiresAuth: true,
        },
      },
      {
        title: "What you get once approved",
        body: [
          "The Seller Center opens up: list and edit products, manage stock, work incoming orders, handle returns, run vouchers and flash sales, and track your payouts and performance.",
          "You can switch between shopping and selling without signing out of anything.",
        ],
        note: {
          tone: "info",
          title: "Your buyer account does not change",
          body: "Selling is added to the account you already have. Your orders, wallet, and addresses as a buyer stay exactly as they were.",
        },
      },
    ],
    keywords: ["sell", "vendor", "seller", "become a vendor", "store", "shop", "business", "merchant"],
    related: ["account-security", "chat-and-support", "first-order"],
  },
];

export const GUIDES_BY_SLUG: Record<string, Guide> = RESOURCE_GUIDES.reduce(
  (map, guide) => {
    map[guide.slug] = guide;
    return map;
  },
  {} as Record<string, Guide>,
);

export function getGuide(slug?: string | string[]): Guide | null {
  const key = Array.isArray(slug) ? slug[0] : slug;
  return key ? (GUIDES_BY_SLUG[key] ?? null) : null;
}

/** The pinned "New to ODOS" path, in the order it is meant to be read. */
export const STARTER_GUIDES: Guide[] = RESOURCE_GUIDES.filter(
  (guide) => typeof guide.starterOrder === "number",
).sort((a, b) => (a.starterOrder ?? 0) - (b.starterOrder ?? 0));

export function buildGuideCounts(guides: Guide[]): Record<string, number> {
  const counts: Record<string, number> = { All: guides.length };
  for (const guide of guides) {
    counts[guide.category] = (counts[guide.category] ?? 0) + 1;
  }
  return counts;
}

export function groupGuidesByCategory(
  guides: Guide[],
): { category: GuideCategory; items: Guide[] }[] {
  const order = GUIDE_CATEGORIES.map((entry) => entry.key).filter(
    (key): key is GuideCategory => key !== "All",
  );

  return order
    .map((category) => ({
      category,
      items: guides.filter((guide) => guide.category === category),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * Matches against everything a reader might plausibly type — including the body
 * of each step, so searching "momo" finds the payment guide even though the
 * word only appears three steps in.
 */
export function filterGuides(
  guides: Guide[],
  selectedCategory: GuideCategory | "All",
  query: string,
): Guide[] {
  const needle = query.trim().toLowerCase();

  return guides.filter((guide) => {
    const matchesCategory =
      selectedCategory === "All" || guide.category === selectedCategory;

    if (!needle) {
      return matchesCategory;
    }

    const haystack = [
      guide.title,
      guide.summary,
      guide.category,
      guide.intro,
      ...guide.keywords,
      ...guide.steps.flatMap((step) => [step.title, ...step.body]),
    ]
      .join(" ")
      .toLowerCase();

    return matchesCategory && haystack.includes(needle);
  });
}
